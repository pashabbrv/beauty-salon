# Beauty Salon Project Documentation

## Overview

This project is a comprehensive beauty salon management system with integrated WhatsApp functionality. It consists of three main components:

1. **Frontend**: A React-based web application for customer appointments
2. **Backend**: A FastAPI server handling business logic and data management
3. **WhatsApp Bot**: A service for administrative tasks and notifications

## Project Structure

```
beauty-salon/
├── backend/                 # FastAPI backend service
│   ├── app/                 # Main application code
│   │   ├── api/             # API endpoints
│   │   ├── core/            # Core components (auth, schemas, exceptions)
│   │   ├── db/              # Database models and queries
│   │   ├── rabbitmq/        # RabbitMQ configuration
│   │   └── server.py        # Application entry point
│   ├── Dockerfile           # Backend Docker configuration
│   └── requirements.txt     # Python dependencies
├── frontend/                # React frontend application
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Entry point
│   ├── Dockerfile           # Frontend Docker configuration
│   └── package.json         # Node.js dependencies
├── bot/                     # WhatsApp bot service
│   ├── bot/                 # Bot implementation
│   │   ├── bot.py           # Main bot logic
│   │   ├── config.py        # Configuration
│   │   └── greenapi.py      # WhatsApp API integration
│   ├── Dockerfile           # Bot Docker configuration
│   └── requirements.txt     # Python dependencies
├── docker-compose.yml       # Docker services configuration
├── DOCKER_SETUP.md          # Docker setup instructions
├── README.md                # Project overview and setup
└── example.env              # Example environment variables
```

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Async Database Driver**: asyncpg
- **Message Broker**: RabbitMQ (via FastStream)
- **Authentication**: JWT-based custom implementation
- **Other**: python-dotenv for environment management

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Query (TanStack Query)
- **Date Handling**: date-fns
- **Icons**: Lucide React

### WhatsApp Bot
- **Framework**: Python with FastStream for RabbitMQ integration
- **HTTP Client**: requests
- **Environment Management**: python-dotenv

### Infrastructure
- **Containerization**: Docker and Docker Compose
- **Message Broker**: RabbitMQ
- **Database**: PostgreSQL

## Services Architecture

### 1. Frontend Service (`beauty-salon-frontend`)
- **Technology**: React + Vite
- **Port**: 5173
- **Purpose**: Customer-facing web application for booking appointments
- **Features**:
  - Service browsing
  - Master selection
  - Time slot selection
  - Appointment booking
  - Responsive design

### 2. Backend Service (`beauty-salon-backend`)
- **Technology**: FastAPI
- **Port**: 8000
- **Purpose**: API server handling all business logic and data management
- **Features**:
  - RESTful API endpoints
  - Database operations
  - Authentication and authorization
  - RabbitMQ message handling
  - Data validation

### 3. Database Service (`beauty-salon-db`)
- **Technology**: PostgreSQL 15
- **Port**: 5432
- **Purpose**: Persistent data storage
- **Entities**:
  - Customers
  - Masters
  - Services
  - Offerings (master-service combinations)
  - Appointments
  - Products
  - Transactions
  - Occupations (time slots)

### 4. RabbitMQ Service (`rabbitmq`)
- **Technology**: RabbitMQ 3.10.7 with Management plugin
- **Ports**: 5672 (AMQP), 15672 (Management UI)
- **Purpose**: Message broker for communication between services
- **Features**:
  - Message queuing
  - Notification system
  - Event-driven architecture

### 5. WhatsApp Bot Service (`whatsapp-bot`)
- **Technology**: Python with FastStream
- **Purpose**: Administrative interface via WhatsApp
- **Features**:
  - Appointment notifications
  - Administrative commands
  - Data export functionality

## Data Models

### Customer
Represents a client who books appointments.
- Phone number (primary identifier)
- Name
- Status (new, regular, capricious)
- Creation timestamp

### Master
Represents a beauty salon professional.
- Phone number
- Name
- Relationship to offerings

### Service
Represents a beauty service offered.
- Name
- Relationship to offerings

### Offering
Represents a master-service combination with pricing and duration.
- Master (foreign key)
- Service (foreign key)
- Price
- Duration

### Appointment
Represents a booked appointment.
- Customer name
- Phone number
- Offering (foreign key)
- Time slot (foreign key)
- Confirmation status
- Secret code for confirmation
- Attempt counter for confirmation

### Product
Represents products used in services.
- Name
- Price per unit
- Quantity
- Unit of measurement

### Transaction
Represents financial transactions in the cash register.
- Offering (optional foreign key)
- Product (optional foreign key)
- Product quantity used
- Overtime amount
- Total amount
- Transaction type (income, expense, collection)
- Transaction date

### Occupation
Represents booked time slots for masters.
- Master (foreign key)
- Start time
- End time

## API Structure

The backend provides RESTful APIs organized by resource:

1. **Customers**: Manage customer information and statuses
2. **Masters**: Manage beauty salon professionals
3. **Services**: Manage service types
4. **Offerings**: Manage master-service combinations
5. **Appointments**: Handle appointment booking and confirmation
6. **Products**: Manage inventory
7. **Cash Register**: Handle financial transactions

See `API_DOCUMENTATION.md` for detailed API endpoint documentation.

## Authentication

The system implements JWT-based authentication:
- Protected endpoints require a valid JWT token
- Tokens are included in the Authorization header
- Admin endpoints require special privileges

## WhatsApp Integration

The WhatsApp bot provides an alternative administrative interface:
- Appointment notifications sent to customers
- Administrative commands for managing the system
- Data export functionality
- Real-time communication with administrators

## Development Workflow

### Prerequisites
- Docker and Docker Compose
- Node.js (for frontend development)
- Python (for backend development)

### Running the Application
1. Clone the repository
2. Copy `example.env` to `.env` and configure variables
3. Run `docker-compose up --build` to start all services
4. Access the frontend at http://localhost:5173
5. Access the backend API at http://localhost:8000
6. Access the API documentation at http://localhost:8000/docs

### Development Features
- Live reload for both frontend and backend
- Volume mounting for code changes
- Environment variable configuration
- Service isolation via Docker networks

## Deployment

The application is designed for containerized deployment using Docker Compose:
- All services are containerized
- Environment variables for configuration
- Persistent volumes for data storage
- Network isolation for security

## Testing

### Backend Testing
- Unit tests for API endpoints
- Database query validation
- Authentication testing

### Frontend Testing
- Component testing
- Integration testing with backend
- End-to-end testing

## Environment Variables

The application uses environment variables for configuration:
- Database connection details
- JWT secret keys
- WhatsApp API credentials
- RabbitMQ connection details
- Port configurations

See `example.env` for required variables.

## Maintenance

### Database Management
- Automatic table creation on startup
- Data persistence through Docker volumes
- Backup and restore procedures

### Service Monitoring
- Health checks for all services
- Logging through Docker
- Performance monitoring

### Updates
- Dependency updates through package managers
- Database migration procedures
- Backward compatibility considerations