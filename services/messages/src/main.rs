use std::error::Error;

use axum::{routing, Router};
use socketioxide::{extract::SocketRef, SocketIo};
use tokio::net::TcpListener;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let (layer, io) = SocketIo::new_layer();

    io.ns("/", |socket: SocketRef| {
        socket.on("message", |socket: SocketRef| {
            socket.emit("message-back", "Hello World!").ok();
        });
    });

    let app = Router::new()
        .route("/", routing::get(|| async { "Hello, World!" }))
        .layer(layer);

    let listener = TcpListener::bind("0.0.0.0:8000").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
