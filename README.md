# Chat Application

A full-featured chat application built with **NestJS, Prisma, PostgreSQL, GraphQL, Redis** on the backend and **React, Zustand, Mantine UI** on the frontend. The project supports **real-time messaging**, **typing indicators**, **presence tracking**, **file uploads**, and is fully containerized with **Docker**.

---

## Features

- Real-time messaging with **GraphQL Subscriptions**
- Typing indicators & online presence tracking
- File/image upload in chat
- Responsive and modern UI built with Mantine
- Authentication & authorization with JWT
- Multi-room chat support
- State management with Zustand
- Fully containerized backend + frontend with Docker Compose
- PostgreSQL database with Prisma ORM
- Redis for Pub/Sub and presence management

## Technologies

### Backend

- **NestJS** – Node.js framework for building scalable APIs
- **GraphQL (Apollo Server)** – API layer with queries, mutations, subscriptions
- **Prisma ORM** – Database modeling and querying
- **PostgreSQL** – Relational database
- **Redis** – Real-time Pub/Sub and presence tracking
- **GraphQL Upload** – File uploads support
- **Docker** – Containerized backend

### Frontend

- **React** (Vite) – Modern frontend framework
- **Zustand** – Lightweight state management
- **Mantine UI** – Component library for UI
- **Apollo Client** – GraphQL client for queries, mutations, subscriptions
- **React Router** – Routing for single-page app
- **Dropzone** – File uploads support

## Getting started

1. Copy project, navigate to /frontend and /backend folders and install dependencies

```bash
git clone
cd ./frontend && npm install
cd ./backend && npm install
```

2. Configure your env files based on env.example

3. In the /backend, build docker image running

```bash
docker-compose up --build
```

4. Run backend in dev mode

```bash
npm run start:dev
```

5. Run frontend in dev mode

```bash
npm run dev
```
