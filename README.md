# Chatterbox

Chatterbox is a web application designed for group messaging, in a similar vein to Discord and Slack. Users create _parties_ which other users can join, and then create _topics_ within a party to send messages to each other.

<!-- The application is live on AWS and can be found at https://chatterbox.abhithube.com.

_IMPORTANT: To minimize server costs, the underlying EC2 instances running the backend microservices are only running from 9 am to 5 pm. The frontend is delivered via the Cloudfront CDN, so the client website will be available 24/7._ -->

## Tech Stack

- JavaScript/TypeScript
- Node.js
- React
- Express
- MongoDB
- PostgreSQL
- Kafka
- Docker
- AWS
- Terraform

## Features

- Register and login using your Google or GitHub account
- Create parties to connect with other users
- View which party members are currently online
- Join or share parties via an invite link
- Create topics within parties to partition your conversations
- Send real-time messages in topics and view entire message history

## Project Structure

This repo contains all of the code for the application. Each service has its own directory. The _client_ directory contains the frontend React application. The _common_ directory contains several reusable TypeScript modules that were published as NPM packages and made available for the microservices to use, in an effort to reduce code duplication. The _infra_ directory contains the Terraform configuration to manage the state of cloud infrastructure on AWS.

## Frontend Design

The client application is a fairly straightforward React application boostrapped by Create React App. The code is written using functional components and React hooks. State management is taken care of by Redux. Redux Toolkit in particular reduces a lot of the boilerplate code with configuring the store, defining actions and action creators, and adding middleware such as Redux Thunk. In addition, a custom middleware handles the WebSockets connection and event logic. React Router is used for routing and Chakra UI for styling.

## Backend Design

The backend of this application is broken into several components, following the event-driven microservices architecture. The services are built using the Express web framework for Node.js. The _Accounts Service_ connects to a MongoDB database, which was chosen for the ease of use and the lack of relational data. The _Messages Service_, on the other hand, has quite a bit of relational data, so PostgreSQL was the database of choice. The services communicate asynchronously via a Kafka broker. Details below.

### Microservices

- _Accounts Service_ is responsible for user management and authentication. It supports social login via your Google or Github accounts. Upon successful authentication, users are issued a JSON web token, which is used to authorize users across all microservices in the application.
- _Messages Service_ handles the real-time messaging functionality of the application by receiving incoming WebSocket connections. It also provides a CRUD RESTful API for managing parties and topics.

### Asynchronous Communication

These microservices are designed to be completely self-sufficient, meaning that they contain all of the data necessary to handle client requests without having to reach out to other services. This is where the "event-driven" aspect comes into play. Any write operation to a service's database is followed by a event published to a Kafka topic, containing the particular event type (e.g. 'user:created', 'party:deleted') and the resource data such as the newly created user or the ID of the deleted party. Other services subscribe to topics to receive these events, and extract whatever data is needed to maintain its own "version" of the resource in the database. This makes the microservices more decoupled, as each one can function properly regardless of whether another service is available or not. This design pattern is also more fault-tolerant than synchronous communication because unavailable services can simply process the data when they become available again, rather than losing it forever in the case of REST. Furthermore, new services can be introduced and they simply have to subscribe to the data they care about. Existing services don't have to accomodate for them.

### Shared Library

Because all of the services are written in the same language and framework, a shared library of code was necessary in order to avoid a lot of duplicate code for things such as authorizing JWTs and subscribing to Kafka topics. All of the modules are available as NPM packages, allowing the microservices to install and import them for use. In addition to reducing code duplication, this also helps to keep the services more focused.

### Scalability

This microservices architecture allows for painless scalability. RESTful APIs ensure that any instance of a microservice can handle subsequent communications by a particular user, as all of the data necessary to process a request is stored in the request itself. In particular, the use of JWTs means that all of the data necessary to authorize a user to access an API endpoint is stored within the token. One tricky aspect of scaling up a microservice has to do with WebSockets, specifically the case in which users that want to communicate with each other are connected to different WebSocket servers. The Socket.io Redis adapter handles this by sending any WebSocket communication across a Redis "channel" to other connected servers. Essentially, it allows the Socket.io concept of "rooms" to extend across multiple servers by connecting these servers via a single Redis instance.

## Deployment

The client application is deployed on an S3 bucket as a static site, behind a Cloudfront distribution. The microservices are deployed onto a ECS cluster behind an ELB load balancer.

### CI/CD

Each service is tested and deployed independently. GitHub Actions is the CI/CD tool of choice. The CI process begins with a pull request to the main branch, where changes to a particular microservice directory will trigger its corresponding GitHub workflow. The workflow will compile the TypeScript and ES6+ code to production JavaScript. The pull request can be merged if all workflows succeed, which will trigger the same workflow on the main branch in order to ensure that the final version of the code that will be pushed into production has been verified. Once these workflows pass, the CD workflows will take over. The deployment workflow will build a Docker image for each microservice, push it to the AWS image repository, and update the appropriate ECS deployment.
