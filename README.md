<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Product Catalog

API developed in NestJS for managing a product catalog. The API allows businesses, events, products, or services management using TypeORM and PostgreSQL, with JWT authentication and cookies, real-time notifications via Socket.IO, and Swagger documentation.

## 👋 Prerequisites

- Node.js (v18+)
- npm (v9+)
- PostgreSQL installed and running
- Docker Desktop
- Nest CLI installed globally (`npm install -g @nestjs/cli`)

## 🚀 Initial Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yaikelvl/catalog.git
   cd catalog
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment variables:**
   Create a `.env.template` file and rename it to `.env` in the root of the project with the following variables:
   ```bash
   PORT=3000
   DB_PASSWORD=R4nd0mP@ssw0rd
   DB_USER=randomuser
   DB_NAME=randomdb
   DB_HOST=127.0.0.1
   DB_PORT=5433
   JWT_SECRET=R4nd0mS3cr3t
   CLOUDINARY_CLOUD_NAME=<YOUR CLOUDINARY_CLOUD_NAME>
   CLOUDINARY_API_KEY=<YOUR CLOUDINARY_API_KEY>
   CLOUDINARY_API_SECRET=<YOUR CLOUDINARY_API_SECRET>

3. **Run Docker Compose:**

  ```bash
   docker-compose up -d
   ```

## 🏃‍♀️🛠️ Run the application

**Development mode:**
```bash
npm run start:dev
````

### 📚 API Documentation

Access Swagger UI at:

```bash
http://localhost:{PORT}/api
```

## 📝 License

#### MIT License - © 2025 Yaikel Valdes Luis
