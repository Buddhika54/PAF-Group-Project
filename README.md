# Smart Campus Management System - Backend API

A comprehensive Spring Boot backend application for managing campus resources, bookings, and maintenance tickets with role-based access control and OAuth2 authentication.

## Overview

The Smart Campus Management System provides a robust backend for managing university campus operations including resource booking, maintenance ticketing, and user management. The system supports both traditional JWT authentication and Google OAuth2 login with fine-grained role-based access control.

## Tech Stack

- **Spring Boot 3.x** - Main application framework
- **Spring Security** - Authentication and authorization
- **JWT (JSON Web Tokens)** - Stateless authentication
- **OAuth2 (Google Login)** - Third-party authentication
- **PostgreSQL/MySQL** - Database persistence
- **Maven** - Build and dependency management
- **Spring Data JPA** - Database ORM

## Features

### Authentication & Authorization
- JWT-based stateless authentication
- Google OAuth2 integration
- Role-based access control (USER, ADMIN, TECHNICIAN)
- Automatic user creation for OAuth login

### Core Functionality
1. **User Management** - Registration, login, profile management
2. **Resource Management** - CRUD operations for campus resources
3. **Booking System** - Create, approve, reject, cancel bookings
4. **Ticket System** - Maintenance tickets with status tracking and technician assignment
5. **Notifications** - Real-time system notifications and alerts
6. **Technician Management** - Admin-only technician management

## Prerequisites

- **Java 17** or higher
- **Maven 3.6** or higher
- **PostgreSQL 13+** or **MySQL 8+**
- **Git** for version control

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/PAF-Group-Project.git
PAF-Group-Project
```

### 2. Configure Database
Set up your PostgreSQL/MySQL database and create a database for the application.

### 3. Configure Application Properties
Copy and modify the application properties file:

```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/smart_campus
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration
jwt.secret=your_super_secret_jwt_key_here
jwt.expiration=18000000

# OAuth2 Configuration
spring.security.oauth2.client.registration.google.client-id=your_google_client_id
spring.security.oauth2.client.registration.google.client-secret=your_google_client_secret
spring.security.oauth2.client.registration.google.scope=profile,email

# Frontend URL
frontend.url=http://localhost:5173
```

### 4. Build and Run
```bash
# Clean and build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SPRING_DATASOURCE_URL` | Database connection URL | Yes |
| `SPRING_DATASOURCE_USERNAME` | Database username | Yes |
| `SPRING_DATASOURCE_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |

## API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login with email/password | No |
| POST | `/api/auth/register` | User registration | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| GET | `/api/auth/check-email` | Check if email exists | No |
| GET | `/api/auth/check-username` | Check if username exists | No |

### Resource Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/resources` | Get all resources | No |
| POST | `/api/resources` | Create new resource | Yes (Admin) |
| GET | `/api/resources/{id}` | Get resource by ID | No |
| PUT | `/api/resources/{id}` | Update resource | Yes (Admin) |
| DELETE | `/api/resources/{id}` | Delete resource | Yes (Admin) |

### Booking System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bookings` | Get all bookings | No |
| POST | `/api/bookings` | Create new booking | Yes |
| GET | `/api/bookings/my` | Get user's bookings | Yes |
| GET | `/api/bookings/{id}` | Get booking by ID | No |
| PUT | `/api/bookings/{id}/approve` | Approve booking | Yes (Admin) |
| PUT | `/api/bookings/{id}/reject` | Reject booking | Yes (Admin) |
| PUT | `/api/bookings/{id}/cancel` | Cancel booking | Yes |

### Ticket System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets` | Get all tickets | Yes (Admin) |
| POST | `/api/tickets` | Create new ticket | Yes |
| GET | `/api/tickets/my` | Get user's tickets | Yes |
| GET | `/api/tickets/{id}` | Get ticket by ID | Yes |
| PUT | `/api/tickets/{id}/status` | Update ticket status | Yes |
| PUT | `/api/tickets/{id}/assign` | Assign ticket to technician | Yes (Admin) |
| DELETE | `/api/tickets/{id}` | Delete ticket | Yes (Admin) |
| POST | `/api/tickets/{id}/comments` | Add comment to ticket | Yes |
| POST | `/api/tickets/{id}/attachments` | Upload attachment | Yes |

### Public Ticket Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets/public` | Get all tickets (public) | No |
| GET | `/api/tickets/public/{id}` | Get ticket by ID (public) | No |
| POST | `/api/tickets/public` | Create ticket (public) | No |

### System Notifications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/system-notifications` | Get all notifications | No |
| POST | `/api/system-notifications` | Create notification | Yes (Admin) |
| GET | `/api/system-notifications/{id}` | Get notification by ID | No |
| PUT | `/api/system-notifications/{id}` | Update notification | Yes (Admin) |
| DELETE | `/api/system-notifications/{id}` | Delete notification | Yes (Admin) |

### User Management (Admin Only)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/technicians` | Get all technicians | Yes (Admin) |
| POST | `/api/admin/technicians` | Create technician | Yes (Admin) |
| PUT | `/api/admin/technicians/{id}` | Update technician | Yes (Admin) |
| DELETE | `/api/admin/technicians/{id}` | Delete technician | Yes (Admin) |

## Database Schema Overview

### Core Entities
- **Users** - User accounts with roles (USER, ADMIN, TECHNICIAN)
- **CampusResources** - Physical resources (labs, rooms, equipment)
- **Bookings** - Resource reservations with time slots
- **Tickets** - Maintenance/support tickets with priority levels
- **SystemNotifications** - System-wide announcements
- **Notifications** - User-specific notifications

### Key Relationships
- Users can have multiple bookings and tickets
- Bookings belong to users and resources
- Tickets can be assigned to technicians (users with TECHNICIAN role)
- Resources can have multiple bookings

## Running Tests

### Unit Tests
```bash
# Run all unit tests
mvn test

# Run tests for specific class
mvn test -Dtest=UserServiceTest

# Run tests with coverage
mvn test jacoco:report
```

### Integration Tests
```bash
# Run integration tests
mvn verify

# Run specific integration test
mvn test -Dtest=AuthControllerIntegrationTest
```

## Troubleshooting

### Common Issues

#### 1. OAuth Login Not Working
**Problem**: Google OAuth login redirects but doesn't authenticate
**Solution**: 
- Verify Google Client ID and Secret are correct
- Ensure redirect URI is configured in Google Console
- Check that `frontend.url` matches your frontend URL

#### 2. JWT Token Not Validated
**Problem**: 401 Unauthorized errors despite valid login
**Solution**:
- Verify JWT secret is consistent across all configurations
- Check token expiration time
- Ensure Authorization header format: `Bearer <token>`

#### 3. Database Connection Issues
**Problem**: Application fails to start with database errors
**Solution**:
- Verify database is running and accessible
- Check connection URL, username, and password
- Ensure database exists and user has proper permissions

#### 4. CORS Issues
**Problem**: Frontend cannot access API endpoints
**Solution**:
- Verify frontend URL is in allowed origins list
- Check that frontend is running on correct port
- Ensure preflight OPTIONS requests are handled

#### 5. Role-Based Access Issues
**Problem**: Users cannot access endpoints despite authentication
**Solution**:
- Verify user has correct role assigned
- Check that OAuth users get proper role assignment
- Ensure `@PreAuthorize` annotations match role names

## Limitations

### Authentication Limitations
- **OAuth Username Assignment**: OAuth users automatically get username derived from email prefix
- **First User Admin Assignment**: Only the first user in database gets ADMIN role automatically
- **Role Changes**: Role changes require database restart to take effect for existing sessions

### API Limitations
- **Tickets Endpoint Authentication**: `/api/tickets` requires authentication (use `/api/tickets/public` for unauthenticated access)
- **File Upload Size**: Limited to standard Spring Boot defaults (1MB)
- **Rate Limiting**: No rate limiting implemented on endpoints

### Feature Limitations
- **AI Suggestions**: Rule-based suggestions only (no machine learning)
- **Real-time Notifications**: No WebSocket implementation (polling-based)
- **Email Notifications**: Not implemented (in-app notifications only)

## Development

### Adding New Endpoints
1. Create controller class with `@RestController` and `@RequestMapping`
2. Implement service layer logic
3. Add appropriate security annotations (`@PreAuthorize`)
4. Update security configuration if needed
5. Add unit and integration tests

### Database Migrations
The application uses `spring.jpa.hibernate.ddl-auto=update` for development. For production:
1. Consider using Flyway or Liquibase for versioned migrations
2. Set `ddl-auto=validate` for production
3. Create separate migration scripts for schema changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation for endpoint usage 
