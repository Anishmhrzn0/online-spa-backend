# AquaLux Spa Backend API

A Node.js/Express REST API for the AquaLux Spa booking system with PostgreSQL database and Prisma ORM.

## Features

- User authentication with JWT tokens
- User registration and login
- Service management
- Booking system with appointment scheduling
- User profile management
- Admin functionality
- PostgreSQL database with Prisma ORM
- RESTful API design

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for frontend integration

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Quick Start

### 1. Install Dependencies

   ```bash
   npm install
   ```

### 2. Environment Setup

Copy the environment example file and configure it:

   ```bash
   cp env.example .env
   ```

Update `.env` with your database credentials:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql:"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Database Setup

Generate Prisma client:
```bash
npm run db:generate
```

Push database schema:
```bash
npm run db:push
```

Seed database with sample data:
   ```bash
npm run db:seed
   ```

### 4. Start Development Server

   ```bash
   npm run dev
   ```

The API will be running on `http://localhost:5000`

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Prisma Studio for database management
- `npm run db:seed` - Seed database with sample data

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "birthDate": "1990-01-01"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Services

#### Get All Services
```
GET /api/services
```

#### Get Service by ID
```
GET /api/services/:id
```

#### Create Service (Admin Only)
```
POST /api/services
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Swedish Massage",
  "description": "Relaxing massage therapy",
  "price": 80.00,
  "duration": 60,
  "features": ["Relaxation", "Stress Relief"],
  "category": "Massage"
}
```

### Bookings

#### Create Booking
```
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceId": 1,
  "appointmentDate": "2024-01-15",
  "appointmentTime": "2:00 PM",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "specialRequests": "Please use lavender oil"
}
```

#### Get User's Bookings
```
GET /api/bookings/my
Authorization: Bearer <token>
```

#### Get All Bookings (Admin Only)
```
GET /api/bookings
Authorization: Bearer <admin_token>
```

#### Update Booking
```
PUT /api/bookings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointmentDate": "2024-01-16",
  "appointmentTime": "3:00 PM",
  "status": "confirmed"
}
```

### Users

#### Get User Profile
```
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

## Database Schema

### User Model
```prisma
model User {
  id              Int       @id @default(autoincrement())
  firstName       String    @db.VarChar(50)
  lastName        String    @db.VarChar(50)
  email           String    @unique @db.VarChar(100)
  phone           String    @db.VarChar(20)
  password        String    @db.VarChar(255)
  birthDate       DateTime  @db.Date
  memberSince     DateTime  @default(now())
  points          Int       @default(0)
  membershipStatus MembershipStatus @default(Basic)
  isAdmin         Boolean   @default(false)
  preferences     Json      @default("{\"newsletter\": true, \"smsNotifications\": false}")
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  bookings        Booking[]
}
```

### Service Model
```prisma
model Service {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(100)
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  duration    Int      // in minutes
  features    Json     @default("[]")
  category    ServiceCategory
  isActive    Boolean  @default(true)
  imageUrl    String?  @db.VarChar(255)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  bookings    Booking[]
}
```

### Booking Model
```prisma
model Booking {
  id              Int           @id @default(autoincrement())
  userId          Int
  serviceId       Int
  appointmentDate DateTime      @db.Date
  appointmentTime String        @db.VarChar(10)
  customerName    String        @db.VarChar(100)
  customerEmail   String        @db.VarChar(100)
  customerPhone   String        @db.VarChar(20)
  specialRequests String?       @db.Text
  status          BookingStatus @default(pending)
  totalAmount     Decimal       @db.Decimal(10, 2)
  paymentStatus   PaymentStatus @default(pending)
  notes           String?       @db.Text
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  service         Service       @relation(fields: [serviceId], references: [id], onDelete: Cascade)
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Registration**: Creates a new user account and returns a JWT token
2. **Login**: Validates credentials and returns a JWT token
3. **Protected Routes**: Require a valid JWT token in the Authorization header

### Token Format
```
Authorization: Bearer <jwt_token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Middleware

### Authentication Middleware
- `protect` - Verifies JWT token and adds user to request
- `admin` - Checks if user has admin privileges

### CORS Configuration
- Allows requests from `http://localhost:5173` (frontend)
- Configurable for production

## Development

### Database Management

Open Prisma Studio for visual database management:
```bash
npm run db:studio
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |

### Logging

The API includes comprehensive logging:
- Database connection status
- Request/response logging
- Error logging with stack traces

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure production database URL
4. Set up proper CORS settings
5. Use environment variables for sensitive data
6. Consider using PM2 or similar process manager

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists
- Run `npm run db:push` to sync schema

### Authentication Issues
- Check JWT_SECRET in `.env`
- Verify token format in requests
- Clear browser localStorage if needed

### CORS Issues
- Verify frontend URL in CORS configuration
- Check if frontend is running on correct port

## API Testing

You can test the API using tools like:
- Postman
- Insomnia
- curl commands
- Thunder Client (VS Code extension)

### Health Check
```
GET /api/health
```

Returns server status and timestamp.

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write clear commit messages
5. Test all endpoints before submitting

## License

MIT License - see LICENSE file for details. 
