# ChatterBox

![Auth Service CI](https://github.com/abhithube/chatterbox-microservices/actions/workflows/auth-test.yaml/badge.svg)
![Parties Service CI](https://github.com/abhithube/chatterbox-microservices/actions/workflows/parties-test.yaml/badge.svg)
![Messages Service CI](https://github.com/abhithube/chatterbox-microservices/actions/workflows/messages-test.yaml/badge.svg)

## Link

The application is live on DigitalOcean and can be found at https://chatterbox.abhithube.com.

## Intro

ChatterBox is a web application designed for group messaging, in a similar vein to Discord and Slack. Users create **_parties_** which other users can join, and then create **_topics_** within a party to send messages to each other.

## Features

- User registration and login with email/password or OAuth with Google/GitHub
- Email verification and password reset
- Create parties to connect with other users (up to 10 parties)
- Join parties via an invite link (up to 10 users)
- Create topics within parties (up to 10 topics)
- Send messages to other users within topics

## To Do

1. Finish testing PartiesService and MessagesService
2. Configure auto-scaling for Kubernetes deployments
3. Migrate from Prisma ORM to raw MongoDB driver for Node.js to reduce Docker image sizes
4. Implement client-side caching to improve performance and minimize loading spinners

## Tech Stack

- JavaScript/TypeScript
- Node.js
- React
- NestJS
- MongoDB
- Redis
- Kafka
- Docker
- Kubernetes

## Project Structure

This repo contains all of the code for the application. Each service has its own directory. The _client_ directory contains the frontend React application. The _common_ directory contains several reusable NestJS modules that were published as NPM packages and made available for the microservices to use. The _k8s_ directory contains all of the manifests for the Kubernetes cluster running on DigitalOcean.

## Frontend Design

The client application is a fairly straightforward React application boostrapped by Create React App. The code is written using functional components and React hooks. State management is taken care of by Redux. Redux Toolkit in particular reduces a lot of the boilerplate code with configuring the store, defining actions and action creators, and adding middleware such as Redux Thunk. In addition, a custom middleware handles the WebSockets connection and event logic. React Router is used for routing and Chakra UI for styling.

## Backend Design

The backend of this application is broken into several components, following the event-driven microservices architecture. All of the services are built in the NestJS web framework for Node.js. Each service has its own MongoDB database, deployed in the cloud on MongoDB Atlas. The services communicate asynchronously via a Kafka broker deployed on Confluent Cloud. Details below.

### Microservices

- AuthService is responsible for user management and authentication. It supports email/password login as well as social login via your Google or Github accounts. This service also handles email verification and password reset. Upon successful authentication, users are issued a JSON web token, which is used to authorize users across all microservices in the application.
- PartiesService deals with the CRUD REST API for parties and topics. It also provides functionality for joining and leaving parties.
- MessagesService handles the real-time messaging functionality of the application by receiving incoming WebSocket connections. It also provides a REST endpoint for retrieving a subset of messages within a topic using cursor-based pagination.

### Asynchronous Communication

These microservices are designed to be completely self-sufficient, meaning that they contain all of the data necessary to handle client requests without having to reach out to other services. This is where the "event-driven" aspect comes into play. Any write operation to a service's database is followed by a event published to a Kafka topic, containing the particular event type (e.g. 'USER_CREATED', 'PARTY_DELETED') and the resource data such as the newly created user or the ID of the deleted party. Other services subscribe to topics to receive these events, and extract whatever data is needed to maintain its own "version" of the resource in the database. This makes the microservices more decoupled, as each one can function properly regardless of whether another service is available or not. This design pattern is also more fault-tolerant than synchronous communication because unavailable services can simply process the data when they become available again, rather than losing it forever in the case of REST. Furthermore, new services can be introduced and they simply have to subscribe to the data they care about. Existing services don't have to accomodate for new services, wh

### Shared Library

Because all of the services are written in the same language and framework, a shared library of code was necessary in order to avoid a lot of duplicate code for things such as authorizing JWTs and subscribing to Kafka topics. As NestJS strongly encourages encapsulating functionality into reusable modules, this shared library consists of several NestJS modules. All of these modules are available as NPM packages, allowing the microservices to install and import them for use. In addition to reducing code duplication, this also helps to keep the services more focused.

### Scalability

This microservices architecture allows for painless scalability. RESTful APIs ensure that any instance of a microservice can handle subsequent communications by a particular user, as all of the data necessary to process a request is stored in the request itself. In particular, the use of JWTs means that all of the data necessary to authorize a user to access an API endpoint is stored within the token. One tricky aspect of scaling up a microservice has to do with WebSockets, specifically the case in which users that want to communicate with each other are connected to different WebSocket servers. The Socket.io Redis adapter handles this by sending any WebSocket communication across a Redis "channel" to other connected servers. Essentially, it allows the Socket.io concept of "rooms" to extend across multiple servers by connecting these servers via a single Redis instance.

## Deployment

The client application is deployed on Vercel as a static site. The microservices are deployed onto a DigitalOcean Kubernetes cluster. The services are sitting behind a DO load balancer provisioned by an NGINX Ingress controller.

## Orchestration

Each service has its own Dockerfile, configured with a multi-stage build process to allow for lightweight images and quicker rebuilds. Kubernetes was chosen as the orchestration solution. Each service has its own Kubernetes _deployment_ and _service_ resources. An _ingress_ resource configures round robin routing and handles SSL/TLS termination. General application configuration is stored in _config maps_, and sensitive config is stored in _secrets_.

## CI/CD

Each service is tested and deployed independently. GitHub Actions is the CI/CD tool of choice. The CI process begins with a pull request to the main branch, where changes to a particular microservice directory will trigger its corresponding GitHub workflow. The workflow will compile the TypeScript and ES6+ code to vanilla JavaScript and then execute the Jest suite of unit and integration tests. The pull request can be merged if all workflows succeed, which will trigger the same workflow on the main branch in order to ensure that the final version of the code that will be pushed into production has been verified. Once these workflows pass, the CD workflows will take over. The deployment workflow will build a Docker image from the microservice, push it to DockerHub, and update the appropriate Kubernetes deployment on DigitalOcean. If any Kubernetes manifests in the _k8s_ directory have been modified, a separate workflow will apply them to the cluster.
