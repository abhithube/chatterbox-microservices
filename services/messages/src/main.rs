use std::{env, sync::Arc};

use anyhow::anyhow;
use axum::{routing, Router};
use jsonwebtoken::{DecodingKey, Validation};
use socketioxide::{
    extract::{Data, Extension, MaybeExtension, SocketRef, State},
    handler::ConnectHandler,
    SocketIo,
};
use tokio::net::TcpListener;

const BASE_PATH: &str = "/api/v1";

#[derive(Clone)]
struct SocketState {
    pub jwt_secret: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct Claims {
    pub sub: String,
    pub name: String,
    pub image: Option<String>,
}

#[derive(Debug, Clone)]
struct SocketUser {
    pub id: String,
    pub name: String,
    pub image: Option<String>,
}

#[derive(Debug, Clone)]
struct SocketParty {
    pub id: String,
}

#[derive(Debug, Clone)]
struct SocketTopic {
    pub id: String,
}

fn auth_middleware(
    socket: SocketRef,
    State(state): State<Arc<SocketState>>,
) -> Result<(), anyhow::Error> {
    let bearer = socket
        .req_parts()
        .headers
        .get("Authorization")
        .ok_or_else(|| anyhow!("'Authorization' header not found"))?
        .to_str()?
        .split_whitespace()
        .next_back()
        .ok_or_else(|| anyhow!("Invalid format for 'Authorization' header"))?;

    let token = jsonwebtoken::decode::<Claims>(
        bearer,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::default(),
    )?;

    socket.extensions.insert(SocketUser {
        id: token.claims.sub,
        name: token.claims.name,
        image: token.claims.image,
    });

    Ok(())
}

fn on_connect(socket: SocketRef, Extension(_user): Extension<SocketUser>) {
    socket.on("party:join", on_party_join);
    socket.on("topic:join", on_topic_join);
}

async fn on_party_join(
    io: SocketIo,
    socket: SocketRef,
    Extension(user): Extension<SocketUser>,
    MaybeExtension(party): MaybeExtension<SocketParty>,
    Data(party_id): Data<String>,
) {
    if let Some(party) = party {
        socket.leave(format!("party:{}", party.id));
    }

    let room = format!("party:{}", party_id);
    socket.join(room.clone());

    println!("user {} joined party {}", user.id, party_id);

    socket.extensions.insert(SocketParty { id: party_id });

    let users = io
        .to(room.clone())
        .sockets()
        .into_iter()
        .filter_map(|e| e.extensions.get::<SocketUser>().map(|e| e.id))
        .collect::<Vec<_>>();

    io.to(room).emit("user:online", &users).await.unwrap();
}

async fn on_topic_join(
    socket: SocketRef,
    Extension(user): Extension<SocketUser>,
    Extension(_party): Extension<SocketParty>,
    MaybeExtension(topic): MaybeExtension<SocketTopic>,
    Data(topic_id): Data<String>,
) {
    if let Some(topic) = topic {
        socket.leave(format!("topic:{}", topic.id));
    }

    socket.join(format!("party:{}", topic_id));

    println!("user {} joined topic {}", user.id, topic_id);

    socket.extensions.insert(SocketTopic { id: topic_id });
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let jwt_secret = env::var("JWT_SECRET")?;

    let (layer, io) = SocketIo::builder()
        .with_state(Arc::new(SocketState { jwt_secret }))
        .req_path(format!("{}/socket.io", BASE_PATH))
        .build_layer();

    io.ns("/", on_connect.with(auth_middleware));

    let app = Router::new()
        .nest(
            BASE_PATH,
            Router::new().route("/health", routing::get(|| async { "OK" })),
        )
        .layer(layer);

    let listener = TcpListener::bind("0.0.0.0:8000").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
