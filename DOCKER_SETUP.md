# Docker Setup Instructions

## Running the Beauty Salon Application with Docker

### Prerequisites
- Docker and Docker Compose installed on your system

### Starting the Application

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd beauty-salon
   ```

2. **Start all services with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the applications:**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Database**: PostgreSQL on port 5432

### Services Overview

- **Frontend** (`beauty-salon-frontend`): React + Vite development server
- **Backend** (`beauty-salon-backend`): FastAPI server with live reload
- **Database** (`beauty-salon-db`): PostgreSQL 15
- **WhatsApp Bot** (`whatsapp-bot`): Bot service for notifications

### Development Features

- **Live Reload**: Both frontend and backend support live code updates
- **Volume Mounting**: Source code is mounted for development
- **Environment Variables**: Configured for Docker environment

### Testing API Connection

After starting the services, visit the frontend at http://localhost:5173 and look for the "API Connection Test" component on the main page. Click "Test API Connection" to verify the frontend can communicate with the backend.

### Environment Configuration

The frontend is configured to use the backend API at `http://localhost:8000` when running in Docker.

### Stopping the Application

```bash
docker-compose down
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Rebuilding Services

If you make changes to Dockerfiles or package.json:

```bash
docker-compose up --build
```