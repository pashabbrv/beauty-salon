# Beauty Salon API Documentation

## Overview

This document provides comprehensive documentation for the Beauty Salon backend API. The API is built with FastAPI and provides endpoints for managing customers, masters, services, appointments, products, and cash register operations.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## API Endpoints

### 1. Customers

#### Get All Customers
```
GET /customers/
```
Retrieve all customers who have made appointments.

**Response:**
```json
[
  {
    "id": 1,
    "phone": "+996123456789",
    "name": "John Doe",
    "status": "new",
    "created_at": "2023-01-01T10:00:00"
  }
]
```

#### Get Available Customer Statuses
```
GET /customers/statuses/
```
Retrieve all available customer status values.

**Response:**
```json
{
  "statuses": ["new", "regular", "capricious"]
}
```

#### Update Customer Status
```
PATCH /customers/{phone}/status/
```
Update a customer's status by phone number.

**Request Body:**
```json
{
  "status": "regular"
}
```

**Response:**
```json
{
  "id": 1,
  "phone": "+996123456789",
  "name": "John Doe",
  "status": "regular",
  "created_at": "2023-01-01T10:00:00"
}
```

#### Set Customer Status to "new"
```
POST /customers/{phone}/status/new/
```
Set a customer's status to "new" by phone number.

**Response:**
```json
{
  "id": 1,
  "phone": "+996123456789",
  "name": "John Doe",
  "status": "new",
  "created_at": "2023-01-01T10:00:00"
}
```

#### Set Customer Status to "regular"
```
POST /customers/{phone}/status/regular/
```
Set a customer's status to "regular" by phone number.

**Response:**
```json
{
  "id": 1,
  "phone": "+996123456789",
  "name": "John Doe",
  "status": "regular",
  "created_at": "2023-01-01T10:00:00"
}
```

#### Set Customer Status to "capricious"
```
POST /customers/{phone}/status/capricious/
```
Set a customer's status to "capricious" by phone number.

**Response:**
```json
{
  "id": 1,
  "phone": "+996123456789",
  "name": "John Doe",
  "status": "capricious",
  "created_at": "2023-01-01T10:00:00"
}
```

### 2. Masters

#### Get All Masters
```
GET /masters/
```
Retrieve all registered masters.

**Response:**
```json
[
  {
    "id": 1,
    "phone": "+996123456789",
    "name": "Alice Smith"
  }
]
```

#### Create New Master
```
POST /masters/
```
Create a new master.

**Request Body:**
```json
{
  "phone": "+996123456789",
  "name": "Alice Smith"
}
```

**Response:**
```json
{
  "id": 1,
  "phone": "+996123456789",
  "name": "Alice Smith"
}
```

#### Update Master
```
PUT /masters/{master_id}/
```
Update an existing master's information.

**Request Body:**
```json
{
  "phone": "+996123456789",
  "name": "Alice Johnson"
}
```

**Response:**
```json
{
  "id": 1,
  "phone": "+996123456789",
  "name": "Alice Johnson"
}
```

#### Delete Master
```
DELETE /masters/{master_id}/
```
Delete an existing master.

#### Upload Master Photo
```
POST /masters/{master_id}/photo/
```
Upload or update a master's photo and optionally update their description.

**Request Format:** `multipart/form-data`

**Form Parameters:**
- `file` (required): The image file to upload (allowed formats: .jpg, .jpeg, .png, .webp)
- `description` (optional): Updated description for the master

**Response:**
```json
{
  "id": 1,
  "phone": "+996123456789",
  "name": "Alice Smith",
  "photo_url": "/media/masters/master_1_a1b2c3d4e5f6.jpg",
  "description": "Experienced hair stylist"
}
```

### 3. Services

#### Get All Services
```
GET /services/
```
Retrieve all available services.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Haircut"
  }
]
```

#### Create New Service
```
POST /services/
```
Create a new service.

**Request Body:**
```json
{
  "name": "Hair Coloring"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Hair Coloring"
}
```

#### Update Service
```
PUT /services/{service_id}/
```
Update an existing service.

**Request Body:**
```json
{
  "name": "Full Hair Coloring"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Full Hair Coloring"
}
```

#### Delete Service
```
DELETE /services/{service_id}/
```
Delete an existing service.

#### Upload Service Photo
```
POST /services/{service_id}/photo/
```
Upload or update a service's photo.

**Request Format:** `multipart/form-data`

**Form Parameters:**
- `file` (required): The image file to upload (allowed formats: .jpg, .jpeg, .png, .webp)

**Response:**
```json
{
  "id": 1,
  "name": "Haircut",
  "photo_url": "/media/services/service_1_a1b2c3d4e5f6.jpg"
}
```

### 4. Offerings (Master-Service Combinations)

#### Get All Offerings
```
GET /offerings/
```
Retrieve all master-service combinations (offerings).

**Query Parameters:**
- `master_id` (optional): Filter by master ID
- `service_id` (optional): Filter by service ID

**Response:**
```json
[
  {
    "id": 1,
    "master": {
      "id": 1,
      "phone": "+996123456789",
      "name": "Alice Smith"
    },
    "service": {
      "id": 1,
      "name": "Haircut"
    },
    "price": 1000,
    "duration": "01:30:00"
  }
]
```

#### Create New Offering
```
POST /offerings/
```
Create a new master-service combination.

**Request Body:**
```json
{
  "master_id": 1,
  "service_id": 1,
  "price": 1000,
  "duration": "01:30:00"
}
```

**Response:**
```json
{
  "id": 1,
  "master": {
    "id": 1,
    "phone": "+996123456789",
    "name": "Alice Smith"
  },
  "service": {
    "id": 1,
    "name": "Haircut"
  },
  "price": 1000,
  "duration": "01:30:00"
}
```

#### Update Offering
```
PUT /offerings/{offering_id}/
```
Update an existing offering.

**Request Body:**
```json
{
  "master_id": 1,
  "service_id": 1,
  "price": 1200,
  "duration": "01:45:00"
}
```

**Response:**
```json
{
  "id": 1,
  "master": {
    "id": 1,
    "phone": "+996123456789",
    "name": "Alice Smith"
  },
  "service": {
    "id": 1,
    "name": "Haircut"
  },
  "price": 1200,
  "duration": "01:45:00"
}
```

#### Delete Offering
```
DELETE /offerings/{offering_id}/
```
Delete an existing offering.

#### Get Free Time Slots for Offering
```
GET /offerings/{offering_id}/slots/
```
Get all available time slots for a specific offering.

**Response:**
```json
[
  "2023-06-15T10:00:00",
  "2023-06-15T11:30:00",
  "2023-06-15T13:00:00"
]
```

### 5. Appointments

#### Get All Appointments
```
GET /appointments/
```
Retrieve all appointments.

**Query Parameters:**
- `date` (optional): Filter by appointment date (format: YYYY-MM-DD)
- `confirmed` (optional): Filter by confirmation status (true/false)

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "phone": "+996123456789",
    "offering": {
      "id": 1,
      "master": {
        "id": 1,
        "phone": "+996123456789",
        "name": "Alice Smith"
      },
      "service": {
        "id": 1,
        "name": "Haircut"
      },
      "price": 1000,
      "duration": "01:30:00"
    },
    "slot": {
      "start": "2023-06-15T10:00:00",
      "end": "2023-06-15T11:30:00"
    },
    "confirmed": false,
    "created_at": "2023-06-10T14:30:00"
  }
]
```

#### Create New Appointment
```
POST /appointments/
```
Create a new appointment (requires confirmation).

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+996123456789",
  "offering_id": 1,
  "datetime": "2023-06-15T10:00:00"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "phone": "+996123456789",
  "offering": {
    "id": 1,
    "master": {
      "id": 1,
      "phone": "+996123456789",
      "name": "Alice Smith"
    },
    "service": {
      "id": 1,
      "name": "Haircut"
    },
    "price": 1000,
    "duration": "01:30:00"
  },
  "slot": {
    "start": "2023-06-15T10:00:00",
    "end": "2023-06-15T11:30:00"
  },
  "confirmed": false,
  "created_at": "2023-06-10T14:30:00"
}
```

#### Admin Create Appointment
```
POST /appointments/admin_create/
```
Create a new appointment (pre-confirmed by admin).

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+996123456789",
  "offering_id": 1,
  "datetime": "2023-06-15T10:00:00"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "phone": "+996123456789",
  "offering": {
    "id": 1,
    "master": {
      "id": 1,
      "phone": "+996123456789",
      "name": "Alice Smith"
    },
    "service": {
      "id": 1,
      "name": "Haircut"
    },
    "price": 1000,
    "duration": "01:30:00"
  },
  "slot": {
    "start": "2023-06-15T10:00:00",
    "end": "2023-06-15T11:30:00"
  },
  "confirmed": true,
  "created_at": "2023-06-10T14:30:00"
}
```

#### Delete Appointment
```
DELETE /appointments/{appointment_id}/
```
Delete an existing appointment.

#### Refresh Confirmation Code
```
POST /appointments/{appointment_id}/refresh/
```
Resend the confirmation code for an appointment.

**Response:**
```json
{
  "message": "OK"
}
```

#### Confirm Appointment with Code
```
POST /appointments/{appointment_id}/confirm/
```
Confirm an appointment using the confirmation code.

**Request Body:**
```json
{
  "confirmation_code": "12345"
}
```

**Response:**
```json
{
  "message": "OK"
}
```

#### Admin Confirm Appointment
```
POST /appointments/{appointment_id}/admin_confirm/
```
Confirm an appointment as an administrator.

**Response:**
```json
{
  "message": "OK"
}
```

### 6. Products

#### Get All Products
```
GET /products/
```
Retrieve all products.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Shampoo",
    "price": 500,
    "quantity": 1000,
    "unit": "milliliters",
    "created_at": "2023-01-01T10:00:00"
  }
]
```

#### Create New Product
```
POST /products/
```
Create a new product.

**Request Body:**
```json
{
  "name": "Hair Conditioner",
  "price": 600,
  "quantity": 500,
  "unit": "milliliters"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Hair Conditioner",
  "price": 600,
  "quantity": 500,
  "unit": "milliliters",
  "created_at": "2023-06-10T15:00:00"
}
```

#### Update Product
```
PUT /products/{product_id}/
```
Update an existing product.

**Request Body:**
```json
{
  "name": "Premium Hair Conditioner",
  "price": 700,
  "quantity": 300
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Premium Hair Conditioner",
  "price": 700,
  "quantity": 300,
  "unit": "milliliters",
  "created_at": "2023-06-10T15:00:00"
}
```

#### Delete Product
```
DELETE /products/{product_id}/
```
Delete an existing product.

### 7. Cash Register

#### Create Transaction
```
POST /cash-register/transactions/
```
Create a new cash register transaction.

**Request Body:**
```json
{
  "offering_id": 1,
  "product_id": 2,
  "product_quantity_used": 100,
  "overtime_amount": 500,
  "total_amount": 2000,
  "transaction_type": "income",
  "transaction_date": "2023-06-15"
}
```

**Response:**
```json
{
  "id": 1,
  "offering_id": 1,
  "product_id": 2,
  "product_quantity_used": 100,
  "overtime_amount": 500,
  "total_amount": 2000,
  "transaction_type": "income",
  "transaction_date": "2023-06-15",
  "created_at": "2023-06-15T10:00:00"
}
```

#### Get Transactions
```
GET /cash-register/transactions/
```
Retrieve cash register transaction history.

**Query Parameters:**
- `start_date` (optional): Filter by start date (format: YYYY-MM-DD)
- `end_date` (optional): Filter by end date (format: YYYY-MM-DD)
- `transaction_type` (optional): Filter by transaction type (income/expense/collection)

**Response:**
```json
[
  {
    "id": 1,
    "offering_id": 1,
    "product_id": 2,
    "product_quantity_used": 100,
    "overtime_amount": 500,
    "total_amount": 2000,
    "transaction_type": "income",
    "transaction_date": "2023-06-15",
    "created_at": "2023-06-15T10:00:00"
  }
]
```

#### Get Cash Summary for Date
```
GET /cash-register/summary/
```
Get cash register summary for a specific date.

**Query Parameters:**
- `summary_date` (optional): Date for summary (format: YYYY-MM-DD, defaults to today)

**Response:**
```json
{
  "date": "2023-06-15",
  "income": 5000,
  "expenses": 1000,
  "balance": 4000
}
```

#### Get Cash Summary for Date Range
```
GET /cash-register/summary-range/
```
Get cash register summary for a date range.

**Query Parameters:**
- `start_date` (required): Start date for summary (format: YYYY-MM-DD)
- `end_date` (required): End date for summary (format: YYYY-MM-DD)

**Response:**
```json
[
  {
    "date": "2023-06-14",
    "income": 3000,
    "expenses": 500,
    "balance": 2500
  },
  {
    "date": "2023-06-15",
    "income": 5000,
    "expenses": 1000,
    "balance": 4000
  }
]
```

#### Withdraw Money
```
POST /cash-register/withdraw/
```
Record a withdrawal (expense) from the cash register.

**Request Body:**
```json
{
  "amount": 1000,
  "transaction_date": "2023-06-15"
}
```

**Response:**
```json
{
  "id": 2,
  "offering_id": null,
  "product_id": null,
  "product_quantity_used": null,
  "overtime_amount": null,
  "total_amount": 1000,
  "transaction_type": "expense",
  "transaction_date": "2023-06-15",
  "created_at": "2023-06-15T11:00:00"
}
```

#### Deposit Money
```
POST /cash-register/deposit/
```
Record a deposit (income) to the cash register.

**Request Body:**
```json
{
  "amount": 5000,
  "transaction_date": "2023-06-15"
}
```

**Response:**
```json
{
  "id": 3,
  "offering_id": null,
  "product_id": null,
  "product_quantity_used": null,
  "overtime_amount": null,
  "total_amount": 5000,
  "transaction_type": "income",
  "transaction_date": "2023-06-15",
  "created_at": "2023-06-15T12:00:00"
}
```

#### Collect Money
```
POST /cash-register/collect/
```
Record money collection from the cash register (not counted as an expense).

**Request Body:**
```json
{
  "amount": 3000,
  "transaction_date": "2023-06-15",
  "notes": "End of day collection"
}
```

**Response:**
```json
{
  "id": 4,
  "offering_id": null,
  "product_id": null,
  "product_quantity_used": null,
  "overtime_amount": null,
  "total_amount": 3000,
  "transaction_type": "collection",
  "transaction_date": "2023-06-15",
  "created_at": "2023-06-15T18:00:00"
}
```

## Data Models

### Customer
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| phone | string | Customer's phone number |
| name | string | Customer's name |
| status | string | Customer status (new/regular/capricious) |
| created_at | datetime | Creation timestamp |

### Master
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| phone | string | Master's phone number (2-20 characters) |
| name | string | Master's name (2-100 characters) |
| photo_url | string (optional) | URL to master's photo (max 255 characters) |
| description | string (optional) | Master's description (max 500 characters) |

### Service
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| name | string | Service name |
| photo_url | string (optional) | URL to service's photo (max 255 characters) |

### Offering
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| master_id | integer | Foreign key to Master |
| service_id | integer | Foreign key to Service |
| price | integer | Price in som |
| duration | time | Service duration |

### Appointment
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| name | string | Customer's name |
| phone | string | Customer's phone number |
| offering_id | integer | Foreign key to Offering |
| confirmed | boolean | Confirmation status |
| secret_code | string | Confirmation code |
| attempts | integer | Remaining confirmation attempts |
| created_at | datetime | Creation timestamp |

### Product
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| name | string | Product name |
| price | integer | Price per unit in som |
| quantity | integer | Available quantity |
| unit | string | Unit of measurement |
| created_at | datetime | Creation timestamp |

### Transaction
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| offering_id | integer | Foreign key to Offering (optional) |
| product_id | integer | Foreign key to Product (optional) |
| product_quantity_used | integer | Quantity of product used (optional) |
| overtime_amount | integer | Overtime amount in som (optional) |
| total_amount | integer | Total transaction amount in som |
| transaction_type | string | Type (income/expense/collection) |
| transaction_date | date | Transaction date |
| created_at | datetime | Creation timestamp |

## Media Files

Master photos and other media files are served statically from the `/media` endpoint.

### Accessing Media Files
```
GET /media/masters/{filename}
```
Retrieve a master's photo by filename.

Example URL: `http://localhost:8000/media/masters/master_1_a1b2c3d4e5f6.jpg`

### Frontend Usage Examples

#### Uploading a Master Photo

To upload a master photo from the frontend, use a multipart/form-data POST request:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('description', 'Experienced hair stylist');

fetch(`${API_BASE_URL}/masters/${masterId}/photo/`, {
  method: 'POST',
  headers: {
    'Auth-Token': authToken
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Master updated:', data))
.catch(error => console.error('Error:', error));
```

#### Uploading a Service Photo

To upload a service photo from the frontend, use a multipart/form-data POST request:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch(`${API_BASE_URL}/services/${serviceId}/photo/`, {
  method: 'POST',
  headers: {
    'Auth-Token': authToken
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Service updated:', data))
.catch(error => console.error('Error:', error));
```

Note: Do not set the `Content-Type` header when uploading files, as the browser will automatically set it to `multipart/form-data` with the correct boundary.

## Error Responses

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (missing or invalid authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
- `503` - Service Unavailable

Error responses follow this format:
```json
{
  "detail": "Error message"
}
```