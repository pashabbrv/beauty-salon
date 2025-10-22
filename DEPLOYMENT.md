# Deployment Guide for Beauty Salon Application

This guide will help you deploy the Beauty Salon application to your production server with the domain beauty-manager.app and IP 188.240.213.225.

## Prerequisites

1. A server with Docker and Docker Compose installed
2. A domain name (beauty-manager.app) pointing to your server IP (188.240.213.225)
3. SSH access to your server

## Using the Release Branch

We've created a dedicated `release` branch for deployment purposes. This branch contains stable versions of the application ready for production. To deploy using this branch:

```bash
git checkout release
git pull origin release
```

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd beauty-salon
git checkout release
```

### 2. Configure Environment Variables

Update the [.env](file:///c%3A/Users/SiT/Desktop/beauty-salon/.env) file with your production values:

```bash
# Database configuration
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_NAME=beauty_salon

# Backend security token
BACKEND_TOKEN=your_very_secure_backend_token_here

# Frontend API URL (for production)
VITE_API_URL=https://beauty-manager.app/api
VITE_ADMIN_TOKEN=your_very_secure_backend_token_here

# WhatsApp API configuration (if using)
GREENAPI_INSTANCE_ID=your_instance_id
GREENAPI_API_TOKEN=your_api_token

# RabbitMQ Configuration
RMQ_HOST=rabbitmq
RMQ_PORT=5672
RMQ_USERNAME=guest
RMQ_PASSWORD=guest
```

### 3. SSL Certificate Setup

The deployment is configured to use Let's Encrypt SSL certificates. When you first run the application, Certbot will automatically obtain certificates for your domain.

### 4. Start the Application

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Initialize the Database

The database tables will be automatically created when the backend starts.

### 6. Access the Application

Once deployed, you can access:
- Frontend: https://beauty-manager.app
- Backend API: https://beauty-manager.app/api/
- Admin Panel: https://beauty-manager.app/admin
- RabbitMQ Management: http://188.240.213.225:15672

## SSL Certificate Management

SSL certificates are automatically renewed by Certbot. The renewal check runs daily.

If you need to manually renew certificates:

```bash
docker-compose -f docker-compose.prod.yml run --rm certbot renew
```

## Updating the Application

To update the application:

1. Pull the latest code:
   ```bash
   git pull origin release
   ```

2. Rebuild and restart the containers:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

## Troubleshooting

### Check container logs

```bash
docker-compose -f docker-compose.prod.yml logs <service-name>
```

### Check if all services are running

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Common issues

1. **SSL Certificate Issues**: Make sure your domain points to the correct IP address and port 80 is accessible.
2. **Database Connection Issues**: Check the database credentials in the [.env](file:///c%3A/Users/SiT/Desktop/beauty-salon/.env) file.
3. **Permission Issues**: Ensure Docker has the necessary permissions to access the files.