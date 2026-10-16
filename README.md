# Shopaweholic Customer Portal

A full-stack customer registration and login application for a shopping portal. The project combines a Node.js/Express backend, a MongoDB database accessed through Mongoose, bcrypt password hashing, and session-based authentication with a Bootstrap-powered HTML frontend.

## Features

- Customer registration with username, email, and age validation.
- Password hashing with bcrypt before customer records are stored.
- Login and logout flows backed by Express sessions.
- MongoDB persistence through Mongoose.
- Static frontend pages for the home page, registration, and login.
- Centralized error handling for validation, authentication, and missing routes.
- Docker and Docker Compose configuration for running the application with MongoDB.

## Technology Stack

- Node.js 18+
- Express
- MongoDB and Mongoose
- Express Session
- bcrypt
- Bootstrap
- Docker and Docker Compose

## Prerequisites

- Node.js 18 or newer and npm, or Docker Desktop.
- A reachable MongoDB instance, MongoDB Atlas cluster, or the MongoDB service supplied by Docker Compose.

## Local Setup

1. Install dependencies from the repository root:

   ```bash
   npm install
   ```

2. Create a `.env` file in the repository root. The application currently reads the `MONGODB_URI_TEST` variable:

   ```env
   MONGODB_URI_TEST=mongodb+srv://<username>:<password>@<cluster>/<database>
   ```

   Do not commit `.env` or share database credentials. Mongoose connects to the `customerDB` database.

3. Start the application:

   ```bash
   node customer_app.js
   ```

4. Open [http://localhost:3001](http://localhost:3001).

## Docker Setup

To start the application and MongoDB together:

```bash
docker compose up --build
```

The application is available at [http://localhost:3001](http://localhost:3001), and MongoDB is exposed on port `27017`.

## Application Pages

| URL | Description |
| --- | --- |
| `/` | Serves the Shopaweholic home page. |
| `/static/login.html` | Displays the customer login form. |
| `/static/register.html` | Displays the customer registration form. |

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/register` | Validates and creates a customer with a bcrypt-hashed password. |
| `POST` | `/api/login` | Authenticates a customer and establishes a session. |
| `GET` | `/api/logout` | Destroys the current session and redirects to the home page. |

Customer records contain a username, password hash, email address, and age. The registration flow currently enforces an age of at least 21 on the server.

## Project Structure

```text
customer_app.js       Express server, authentication routes, sessions, and error handling
customer.js           Mongoose customer schema and model
errors/CustomError.js Custom validation and authentication error classes
frontend/             HTML pages and static assets
docker-compose.yml    Application and MongoDB services
Dockerfile            Container image definition
package.json          Dependencies and npm scripts
.env                  Local MongoDB configuration (not committed)
```

## Development Notes

- `npm test` is currently a placeholder and exits with an error because automated tests have not been added.
- The session uses an in-memory store and a hard-coded session secret, so the current configuration is intended for development rather than production.
- For production use, move the session secret to an environment variable, use a persistent session store, enforce HTTPS, and add stronger request validation and automated tests.
