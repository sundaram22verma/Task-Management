# Task Management REST API with Role-Based Access Control (RBAC)

A secure, scalable, and production-ready RESTful API for a Task Management System built with **Node.js**, **Express.js**, **MongoDB**, and **JWT Authentication**.

---

## 🚀 Features

* **Authentication & Security**:
  * User registration and login with JWT (JSON Web Tokens).
  * Secure password hashing using `bcryptjs` with high salt rounds.
  * Passwords strictly stripped from responses (`select: false` and custom `toJSON`).
  * Account activation/deactivation support (`isActive` flag).
* **Role-Based Access Control (RBAC)**:
  * Strict three-tier role hierarchy: `super-admin`, `admin`, `user`.
  * Middleware-based authorization checks (`authorizeRoles(...)`).
  * Public registrations strictly restricted to `user` role to prevent privilege escalation.
  * Multi-tenancy task isolation: regular users can only read, update, and delete their own tasks.
* **Task Management (CRUD)**:
  * Full CRUD support: Create, Read, Update, and Delete tasks.
  * Task statuses: `Pending`, `In Progress`, `Completed`.
  * Task priorities: `Low`, `Medium`, `High`.
  * Due date and automatic timestamp tracking (`createdAt`, `updatedAt`).
* **Search, Filtering & Pagination**:
  * Case-insensitive search on task `title` and `description`.
  * Filter tasks by `status` and `priority`.
  * Pagination with `page` and `limit`, returning rich pagination metadata.
* **Architecture & Code Quality**:
  * Modular MVC structure (`controllers`, `models`, `routes`, `middleware`, `validators`, `utils`).
  * Centralized error handling catching Mongoose CastErrors, duplicate key errors, validation errors, and JWT errors.
  * Request payload validation using `express-validator`.
  * Database seeder script (`npm run seed`) for instant local testing.

---

## 🛡️ RBAC Permissions Matrix

| Feature / Action | Super Admin | Admin | User |
| :--- | :---: | :---: | :---: |
| Register Account (Public) | ✅ | ✅ | ✅ |
| Login / Authenticate | ✅ | ✅ | ✅ |
| View Own Profile | ✅ | ✅ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ |
| Create Own Tasks | ✅ | ✅ | ✅ |
| View Own Tasks | ✅ | ✅ | ✅ |
| View Single Own Task | ✅ | ✅ | ✅ |
| Update Own Tasks | ✅ | ✅ | ✅ |
| Delete Own Tasks | ✅ | ✅ | ✅ |
| View All Users | ✅ | ✅ | ❌ |
| View Single User | ✅ | ✅ | ❌ |
| Create Users | ✅ | ✅ *(cannot create super-admin)* | ❌ |
| Update Users | ✅ | ✅ *(cannot edit super-admin)* | ❌ |
| Delete Users | ✅ | ❌ | ❌ |
| Change User Roles | ✅ | ❌ | ❌ |
| Activate / Deactivate Users | ✅ | ✅ *(cannot deactivate super-admin)* | ❌ |
| View All Tasks (across users) | ✅ | ✅ | ❌ |
| Update Any User's Task | ✅ | ❌ | ❌ |
| Delete Any User's Task | ✅ | ❌ | ❌ |
| Access Admin Dashboard | ✅ | ✅ | ❌ |
| Access Super-Admin Dashboard | ✅ | ❌ | ❌ |

---

## 📂 Project Structure

```text
Task-Management/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile logic
│   │   ├── taskController.js     # Task CRUD, search, filter, pagination
│   │   ├── userController.js     # User management & role administration
│   │   └── dashboardController.js# Admin & Super-Admin analytics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token validation
│   │   ├── roleMiddleware.js     # RBAC authorization middleware
│   │   ├── errorMiddleware.js    # 404 & Centralized error handler
│   │   └── validateMiddleware.js # express-validator error formatter
│   ├── models/
│   │   ├── User.js               # User schema & password hashing hooks
│   │   └── Task.js               # Task schema with enums & compound indexes
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── taskRoutes.js         # /api/tasks routes
│   │   ├── userRoutes.js         # /api/users routes
│   │   └── dashboardRoutes.js    # /api/dashboard routes
│   ├── validators/
│   │   ├── authValidator.js      # Auth request validation rules
│   │   ├── taskValidator.js      # Task request validation rules
│   │   └── userValidator.js      # User admin request validation rules
│   ├── utils/
│   │   ├── asyncHandler.js       # Asynchronous error wrapper
│   │   ├── generateToken.js      # JWT signing helper
│   │   └── seedData.js           # Database seeding script
│   └── app.js                    # Express app configuration & middleware
├── server.js                     # Application entry point
├── postman_collection.json       # Pre-configured Postman v2.1 collection
├── .env.example                  # Environment variable reference
├── .gitignore                    # Git ignore file
└── package.json                  # Dependencies & npm scripts
```

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
* **Node.js** (v18.x or later)
* **MongoDB** (Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` OR MongoDB Atlas connection string)
* **Git**

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd Task-Management
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to create a `.env` file:
```bash
cp .env.example .env
```
Edit `.env` if needed:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/task_management
JWT_SECRET=super_secret_jwt_key_task_management_2026_dev
JWT_EXPIRES_IN=7d
```

### 4. Seed the Database (Recommended)
Populate the database with pre-configured accounts for each role and sample tasks:
```bash
npm run seed
```

#### Pre-seeded Credentials:
| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@example.com` | `SuperAdmin123!` |
| **Admin** | `admin@example.com` | `Admin123!` |
| **User 1** | `sundaram@example.com` | `User123!` |
| **User 2** | `jane@example.com` | `User123!` |

### 5. Start the Server
* **Development mode (with auto-reload)**:
  ```bash
  npm run dev
  ```
* **Production mode**:
  ```bash
  npm start
  ```
The server will run on `http://localhost:5000`.

---

## 📡 API Reference & Endpoints

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register user account (enforces role `user`) |
| `POST` | `/api/auth/login` | Public | Login and receive JWT Bearer token |
| `GET` | `/api/auth/profile` | Protected | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Protected | Update own profile (name, password) |

#### Register Request Body:
```json
{
  "name": "Sundaram Verma",
  "email": "sundaram@example.com",
  "password": "User123!"
}
```

#### Login Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "673f1a2b3c4d5e6f7a8b9c0d",
      "name": "Sundaram Verma",
      "email": "sundaram@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2026-10-03T10:00:00.000Z",
      "updatedAt": "2026-10-03T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Task Management (`/api/tasks`)
All task endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks` | Authenticated | Create a new task (assigned to authenticated user) |
| `GET` | `/api/tasks` | Authenticated | Get own tasks (with pagination, status/priority filter, search) |
| `GET` | `/api/tasks/:id` | Owner Only | Get single own task details |
| `PUT` | `/api/tasks/:id` | Owner Only | Update own task |
| `DELETE` | `/api/tasks/:id` | Owner Only | Delete own task |

#### Create Task Request Body:
```json
{
  "title": "Implement REST API Endpoints",
  "description": "Build Express routes and controllers for task management",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2026-10-15T18:00:00.000Z"
}
```

#### Querying, Filtering & Pagination:
* **Filter by Status**: `GET /api/tasks?status=Completed`
* **Filter by Priority**: `GET /api/tasks?priority=High`
* **Search by Keyword**: `GET /api/tasks?search=database`
* **Pagination**: `GET /api/tasks?page=1&limit=5`
* **Combined Example**:
  ```http
  GET /api/tasks?status=In%20Progress&priority=High&search=API&page=1&limit=10
  ```

#### Paginated Response Example (`200 OK`):
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "_id": "673f1a2b3c4d5e6f7a8b9c0e",
        "title": "Implement REST API Endpoints",
        "description": "Build Express routes and controllers for task management",
        "status": "In Progress",
        "priority": "High",
        "dueDate": "2026-10-15T18:00:00.000Z",
        "userId": {
          "_id": "673f1a2b3c4d5e6f7a8b9c0d",
          "name": "Sundaram Verma",
          "email": "sundaram@example.com",
          "role": "user"
        },
        "createdAt": "2026-10-03T10:15:00.000Z",
        "updatedAt": "2026-10-03T10:15:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

### 3. Administrative Management (`/api/admin`)
All administrative routes require `Authorization: Bearer <adminToken|superAdminToken>`.

#### A. User Administration
| Method | Endpoint | Access | Description / Hierarchy Rules |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Admin, Super-Admin | List all users (supports `role`, `isActive`, `search`, `page`, `limit`) |
| `GET` | `/api/admin/users/:id` | Admin, Super-Admin | Get single user by ID |
| `POST` | `/api/admin/users` | Admin, Super-Admin | Create user (`admin` can only create `user` role; `super-admin` can create `admin`) |
| `PUT` | `/api/admin/users/:id` | Admin, Super-Admin | Update user details (**Admins CANNOT modify Admins or Super-Admins**) |
| `PATCH` | `/api/admin/users/:id/status` | Admin, Super-Admin | Toggle `isActive` (**Cannot deactivate self or Admins**) |
| `PATCH` | `/api/admin/users/:id/role` | Super-Admin only | Promote/Demote user role (**Super-Admin cannot demote self**) |
| `DELETE` | `/api/admin/users/:id` | Super-Admin only | Hard delete user & cascade tasks (**Super-Admin cannot delete self**) |

#### B. System-Wide Task Administration
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/tasks` | Admin, Super-Admin | View all tasks across all users (with search, status/priority filters, pagination) |
| `GET` | `/api/admin/tasks/:id` | Admin, Super-Admin | View any specific task by ID |
| `PUT` | `/api/admin/tasks/:id` | Admin, Super-Admin | Edit/update any user's task |
| `DELETE` | `/api/admin/tasks/:id` | Admin, Super-Admin | Delete any user's task |

---

### 4. Dashboards (`/api/dashboard`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/admin` | Admin, Super-Admin | Task and user summary statistics |
| `GET` | `/api/dashboard/super-admin` | Super-Admin only | Detailed system-wide analytics & role breakdowns |

---

## 🧪 Postman Collection Setup

The repository includes a ready-to-use Postman collection: `postman_collection.json`.

1. Open Postman.
2. Click **Import** in the upper left.
3. Select or drag-and-drop `postman_collection.json`.
4. The collection is pre-configured with **Tests scripts** that automatically capture and set:
   * `userToken` when calling **Login - Regular User**
   * `adminToken` when calling **Login - Admin**
   * `superAdminToken` when calling **Login - Super Admin**
   * `taskId` when calling **Create Task**
   * `targetUserId` when calling **Get All Users**
5. All subsequent requests automatically use the corresponding Bearer tokens!

---

## 🔒 Security & Validation Details

1. **Authentication Token**: Bearer JWT passed in `Authorization` header.
2. **Password Protection**: Passwords hashed with `bcryptjs` (10 rounds). Schema uses `select: false` and document transformation `toJSON` deletes `password` and `__v`.
3. **Data Isolation**: Users are prevented from viewing, updating, or deleting other users' tasks.
4. **Input Validation**: Express-validator enforces data types, length limits, and enum values (`Pending`, `In Progress`, `Completed`, `Low`, `Medium`, `High`).
5. **Centralized Error Handling**: Uniform JSON error responses across the application:
   ```json
   {
     "success": false,
     "message": "Validation failed",
     "errors": [
       { "field": "email", "message": "Please provide a valid email address" }
     ]
   }
   ```
