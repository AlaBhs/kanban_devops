# Kanban Task Management App

This project is developed for **internship and educational purposes**. It is a full-stack Kanban task management application built with a modern web stack and deployed using Docker and Kubernetes.

## 🧩 Technologies Used

- **Frontend**: React, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (K8s)
- **DevOps**: kubectl, k9s

## 🛠 Features

- Multi-column Kanban board
- Drag & drop tasks
- Create, edit, delete tasks and columns
- Real-time syncing between frontend and backend
- Environment configuration via `.env` files
- Fully containerized and orchestrated for scalability

## 📁 Project Structure
- kanban-app/
- ├── kanban-frontend/ # React frontend
- ├── kanban-backend/ # Express backend
- ├── k8s/ # Kubernetes manifests
- ├── docker-compose.yml # Docker Compose file for local dev
- ├── README.md

## ⚙️ Environment Setup

You must create the following environment files manually before starting the project (they are included in `.gitignore`):

- `kanban-frontend/public/env.js`
- `kanban-backend/.env`

Make sure these contain your MongoDB URI and other relevant config.

## 🐳 Docker Compose

Created `docker-compose.yml` file with:

- Backend service
- Frontend service
- MongoDB service

Configured with volumes, ports, restart policies, dependencies.

## ☸️ Kubernetes Deployment

Created Kubernetes manifests:

- **Namespaces**: Frontend, Backend, Database
- **ConfigMaps**:
  - Frontend ConfigMap for env vars
  - Backend ConfigMap for config values
- **Secrets**:
  - Backend Secret for MongoDB URI
- **Deployments** and **Services**:
  - MongoDB Deployment & ClusterIP Service
  - Backend Deployment & ClusterIP Service
  - Frontend Deployment & NodePort Service

## 🔧 Testing & Validation

- Applied all K8s manifests using `kubectl apply -f ./k8s`
- Used `kubectl exec` with `wget` and `curl` to test service connectivity inside the cluster
- Verified:
  - Frontend can access backend API
  - Backend connects to MongoDB

## 🚀 Getting Started

### 1. Install dependencies

```bash
cd kanban-frontend && npm install
cd ../kanban-backend && npm install
```

### 2. Add environment files
- Make sure you create:

  - kanban-frontend/public/env.js

  - kanban-backend/.env
- Example values:
- kanban-backend/.env
  - MONGO_URI=mongodb://mongo-service:27017/kanban
  - PORT=4000
  - JWT_SECRET= secretKeyExemple

- kanban-frontend/public/env.js
  - window.REACT_APP_API_BASE = "http://localhost:5000/api";

### 3. Start with Docker Compose (for local dev)
```bash
docker-compose up --build
```

### 4. Deploy with Kubernetes
```bash
kubectl apply -f k8s/
```
Use k9s or kubectl get pods to track deployment status.

