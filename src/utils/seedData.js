require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const User = require('../models/User');
const Task = require('../models/Task');

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_management';
    await mongoose.connect(mongoURI);
    console.log('[Seeder] Connected to MongoDB Atlas...');

    // Clear existing collections
    await User.deleteMany();
    await Task.deleteMany();
    console.log('[Seeder] Cleared existing users and tasks collections...');

    // -------------------------------------------------------------------------
    // 1. Seed 15 Diverse Users (1 Super Admin, 2 Admins, 12 Regular Users)
    // -------------------------------------------------------------------------
    const usersData = [
      { name: 'Super Administrator', email: 'superadmin@example.com', password: 'SuperAdmin123!', role: 'super-admin', isActive: true },
      { name: 'Operations Admin', email: 'admin@example.com', password: 'Admin123!', role: 'admin', isActive: true },
      { name: 'DevOps Administrator', email: 'devops.admin@example.com', password: 'Admin123!', role: 'admin', isActive: true },
      { name: 'Sundaram Verma', email: 'sundaram@example.com', password: 'User123!', role: 'user', isActive: true },
      { name: 'Jane Smith', email: 'jane.smith@example.com', password: 'User123!', role: 'user', isActive: true },
      { name: 'Rahul Sharma', email: 'rahul.sharma@example.com', password: 'User123!', role: 'user', isActive: true },
      { name: 'Priya Patel', email: 'priya.patel@example.com', password: 'User123!', role: 'user', isActive: true },
      { name: 'Alex Turner', email: 'alex.turner@example.com', password: 'User123!', role: 'user', isActive: true },
      { name: 'Emma Watson', email: 'emma.watson@example.com', password: 'User123!', role: 'user', isActive: true },
      { name: 'Rohit Verma', email: 'rohit.verma@example.com', password: 'User123!', role: 'user', isActive: true },
      { name: 'Ananya Singh', email: 'ananya.singh@example.com', password: 'User123!', role: 'user', isActive: true },
      { name: 'Michael Scott', email: 'michael.scott@example.com', password: 'User123!', role: 'user', isActive: true },
      { name: 'Dwight Schrute', email: 'dwight.schrute@example.com', password: 'User123!', role: 'user', isActive: true },
      { name: 'Pam Beesly', email: 'pam.beesly@example.com', password: 'User123!', role: 'user', isActive: false }, // Deactivated user for edge case testing
      { name: 'Jim Halpert', email: 'jim.halpert@example.com', password: 'User123!', role: 'user', isActive: true },
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const userDoc = await User.create(u);
      createdUsers.push(userDoc);
    }
    console.log(`[Seeder] Successfully created ${createdUsers.length} users (1 Super-Admin, 2 Admins, 12 Users).`);

    // Helper to pick a random user or cycle through users
    const getUser = (idx) => createdUsers[idx % createdUsers.length]._id;
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // -------------------------------------------------------------------------
    // 2. Seed 75 Realistic Tasks with diverse statuses, priorities, and dates
    // -------------------------------------------------------------------------
    const tasksData = [
      // 1-10
      {
        title: 'Design Scalable MongoDB Schema Architecture',
        description: 'Define relational document schema, foreign keys, compound indexes, and validation rules for multi-tenant users and tasks.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 3 * day),
        userId: getUser(3), // Sundaram
      },
      {
        title: 'Implement JWT Authentication & RBAC Middleware',
        description: 'Set up signed Bearer token generation, authorization hooks, dynamic DB lookup, and hierarchical permission guards.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 2 * day),
        userId: getUser(3),
      },
      {
        title: 'Create Task CRUD REST API Endpoints',
        description: 'Develop POST, GET, PUT, and DELETE routes with strict ownership validation and express-validator request sanitization.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 1 * day),
        userId: getUser(3),
      },
      {
        title: 'Build Search, Filter, and Pagination Pipeline',
        description: 'Implement regex search for titles and descriptions with multi-field status and priority filters and metadata.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(now + 2 * day),
        userId: getUser(3),
      },
      {
        title: 'Configure Centralized Error Handling Middleware',
        description: 'Format custom error responses for Mongoose CastErrors, duplicate key constraints, validation failures, and 404s.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(now + 1 * day),
        userId: getUser(3),
      },
      {
        title: 'Set up Redis Cache for Frequent Queries',
        description: 'Implement caching layer for user profile data and admin task lookups with 15-minute TTL invalidation strategy.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 5 * day),
        userId: getUser(4), // Jane
      },
      {
        title: 'Dockerize Node.js and Express Application',
        description: 'Create multi-stage Dockerfile optimizing image size with non-root security user and docker-compose orchestration.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(now + 3 * day),
        userId: getUser(2), // DevOps Admin
      },
      {
        title: 'Configure GitHub Actions CI/CD Pipeline',
        description: 'Automate linting, unit test execution, code coverage reporting, and container registry publishing on merge.',
        status: 'Pending',
        priority: 'High',
        dueDate: new Date(now + 6 * day),
        userId: getUser(2),
      },
      {
        title: 'Conduct OWASP Security Vulnerability Audit',
        description: 'Test API against injection attacks, broken object level authorization (BOLA), rate limit bypass, and CORS vulnerabilities.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(now + 4 * day),
        userId: getUser(1), // Operations Admin
      },
      {
        title: 'Implement Express Rate Limiting & Helmet Security Headers',
        description: 'Add IP-based sliding window rate limiter (100 req/15min) and configure CSP, HSTS, and XSS protection headers.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(now - 1 * day),
        userId: getUser(4),
      },

      // 11-20
      {
        title: 'Prepare Comprehensive Postman API Collection',
        description: 'Export Postman v2.1 collection with automated environment variables, test assertions, and role-based test cases.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 2 * day),
        userId: getUser(5), // Rahul
      },
      {
        title: 'Write Jest Unit Tests for Auth Controller',
        description: 'Cover registration validation, password hashing, incorrect credential rejections, and expired JWT scenarios.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(now + 2 * day),
        userId: getUser(5),
      },
      {
        title: 'Write Supertest Integration Tests for Task Endpoints',
        description: 'Verify 401 unauthorized, 403 forbidden access attempts across different users, and pagination boundaries.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 7 * day),
        userId: getUser(5),
      },
      {
        title: 'Integrate Winston and Morgan Logging Pipeline',
        description: 'Setup structured daily rotating JSON logs with correlation IDs for distributed request tracing.',
        status: 'Completed',
        priority: 'Low',
        dueDate: new Date(now - 4 * day),
        userId: getUser(6), // Priya
      },
      {
        title: 'Implement BullMQ Background Job Queue',
        description: 'Offload email dispatch and heavy report generation to Redis-backed BullMQ worker processes.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 8 * day),
        userId: getUser(6),
      },
      {
        title: 'Build User Avatar Upload via AWS S3 Presigned URLs',
        description: 'Allow authenticated users to request short-lived presigned S3 upload URLs with client-side file type and size checks.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(now + 12 * day),
        userId: getUser(6),
      },
      {
        title: 'Design React Admin Dashboard UI Prototype',
        description: 'Create responsive dashboard layout using Tailwind CSS, showcasing system metrics, task graphs, and user tables.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: new Date(now + 3 * day),
        userId: getUser(7), // Alex
      },
      {
        title: 'Implement Client-Side JWT Refresh Mechanism',
        description: 'Handle Axios response interceptors to automatically refresh access tokens using HTTP-only refresh cookies.',
        status: 'Pending',
        priority: 'High',
        dueDate: new Date(now + 5 * day),
        userId: getUser(7),
      },
      {
        title: 'Optimize MongoDB Compound Indexes',
        description: 'Analyze query execution plans using explain() and add indexes on { userId: 1, status: 1, createdAt: -1 }.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 1 * day),
        userId: getUser(8), // Emma
      },
      {
        title: 'Configure MongoDB Atlas Automated Backups',
        description: 'Schedule daily cluster snapshots, point-in-time recovery testing, and offsite cross-region backup replication.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(now - 5 * day),
        userId: getUser(2),
      },

      // 21-30
      {
        title: 'Draft API Documentation with Swagger / OpenAPI 3.0',
        description: 'Document request parameters, request body schemas, response statuses, and JWT Bearer security schemes.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: new Date(now + 4 * day),
        userId: getUser(8),
      },
      {
        title: 'Implement Account Activation / Deactivation Workflow',
        description: 'Ensure deactivated accounts immediately fail authentication and token verification across all routes.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 2 * day),
        userId: getUser(9), // Rohit
      },
      {
        title: 'Conduct Load Testing using k6 and Artillery',
        description: 'Benchmark task search and pagination endpoints under 500 concurrent virtual users to detect latency spikes.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 9 * day),
        userId: getUser(9),
      },
      {
        title: 'Implement Prometheus Metrics and Grafana Dashboard',
        description: 'Expose Prometheus /metrics endpoint tracking HTTP request durations, memory utilization, and active connections.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(now + 14 * day),
        userId: getUser(2),
      },
      {
        title: 'Refactor Task Controller with Service Layer Pattern',
        description: 'Decouple database query logic into dedicated taskService modules for better unit testability.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(now + 11 * day),
        userId: getUser(10), // Ananya
      },
      {
        title: 'Add Bulk Task Import via CSV Parser',
        description: 'Allow users to upload CSV files to batch insert tasks with stream processing and individual row validation.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 10 * day),
        userId: getUser(10),
      },
      {
        title: 'Implement Email Notification for Upcoming Due Dates',
        description: 'Create scheduled node-cron job checking tasks due in 24 hours and queueing friendly reminder emails.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: new Date(now + 3 * day),
        userId: getUser(10),
      },
      {
        title: 'Sanitize Incoming Request Inputs Against NoSQL Injection',
        description: 'Incorporate express-mongo-sanitize middleware to strip dollar signs and dot notation from query payloads.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 3 * day),
        userId: getUser(11), // Michael
      },
      {
        title: 'Setup Sentry Error Tracking and Alerting',
        description: 'Integrate Sentry SDK in Express error handler to capture unhandled exceptions with breadcrumb traces.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: new Date(now + 2 * day),
        userId: getUser(11),
      },
      {
        title: 'Review Task Prioritization Algorithm for Sprint Planning',
        description: 'Calculate weighted score based on due dates, priority tiers, and completion velocity for team dashboard.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(now + 7 * day),
        userId: getUser(12), // Dwight
      },

      // 31-40
      {
        title: 'Enforce Password Complexity Requirements in Auth Validator',
        description: 'Require at least 8 characters, one uppercase letter, one number, and one special character in registration passwords.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(now - 4 * day),
        userId: getUser(12),
      },
      {
        title: 'Audit User Role Demotion Safeguards',
        description: 'Verify that Super Admins cannot demote their own account or delete their own credentials via API.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 1 * day),
        userId: getUser(0), // Super Admin
      },
      {
        title: 'Create System Analytics Aggregation Pipeline',
        description: 'Use MongoDB aggregation framework to compute task completion rate, average duration, and user activity stats.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(now + 3 * day),
        userId: getUser(0),
      },
      {
        title: 'Implement Soft Delete with Restore Functionality',
        description: 'Add deletedAt timestamp to task schema and allow users to restore mistakenly deleted items within 30 days.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(now + 15 * day),
        userId: getUser(14), // Jim
      },
      {
        title: 'Implement Dark Mode Theme Support in Frontend UI',
        description: 'Integrate Tailwind dark mode class strategy with local storage theme preference persistence.',
        status: 'In Progress',
        priority: 'Low',
        dueDate: new Date(now + 4 * day),
        userId: getUser(14),
      },
      {
        title: 'Configure Cross-Origin Resource Sharing (CORS) Whitelist',
        description: 'Restrict allowed API origins strictly to trusted frontend domain URLs in staging and production configs.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 2 * day),
        userId: getUser(1),
      },
      {
        title: 'Perform Database Index Defragmentation & Health Check',
        description: 'Inspect index sizes on MongoDB Atlas and remove obsolete single-field indexes superseding compound indexes.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(now - 6 * day),
        userId: getUser(2),
      },
      {
        title: 'Implement Task Due Date Calendar View Endpoint',
        description: 'Build endpoint aggregating tasks grouped by calendar day for monthly dashboard timeline view.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 8 * day),
        userId: getUser(4),
      },
      {
        title: 'Add Activity Log Audit Trail for Administrative Actions',
        description: 'Log every role change, status toggle, and administrative task deletion into an immutable audit_logs collection.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(now + 3 * day),
        userId: getUser(0),
      },
      {
        title: 'Implement Multi-Factor Authentication (TOTP)',
        description: 'Provide two-factor QR code generation using speakeasy and verify 6-digit authenticator codes upon login.',
        status: 'Pending',
        priority: 'High',
        dueDate: new Date(now + 13 * day),
        userId: getUser(3),
      },

      // 41-50
      {
        title: 'Fix Task Sorting Bug by CreatedAt Ascending/Descending',
        description: 'Support sort query parameter in GET /api/tasks supporting createdAt:desc, dueDate:asc, and priority:desc.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(now - 1 * day),
        userId: getUser(5),
      },
      {
        title: 'Implement Webhook Notifications for Task Status Updates',
        description: 'Dispatch outgoing HTTP POST webhooks with HMAC signatures whenever high priority tasks reach Completed status.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 9 * day),
        userId: getUser(6),
      },
      {
        title: 'Setup Automated Dependency Vulnerability Scans',
        description: 'Configure Dependabot and npm audit automated checks in repository settings to patch outdated libraries.',
        status: 'Completed',
        priority: 'Low',
        dueDate: new Date(now - 5 * day),
        userId: getUser(2),
      },
      {
        title: 'Optimize Node.js Garbage Collection for High Throughput',
        description: 'Tune V8 flags --max-old-space-size and evaluate memory leak profiles using clinic.js flame graphs.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(now + 16 * day),
        userId: getUser(2),
      },
      {
        title: 'Build Drag-and-Drop Kanban Board Component',
        description: 'Create interactive column-based board syncing task status changes automatically with PUT /api/tasks/:id.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(now + 2 * day),
        userId: getUser(7),
      },
      {
        title: 'Implement Export Tasks to PDF Report',
        description: 'Generate formatted PDF summary reports of completed sprint tasks using pdfkit with download stream.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 11 * day),
        userId: getUser(8),
      },
      {
        title: 'Create User Profile Update Form with Avatar Preview',
        description: 'Validate name length and email pattern in real-time with instant client-side validation feedback.',
        status: 'Completed',
        priority: 'Low',
        dueDate: new Date(now - 3 * day),
        userId: getUser(9),
      },
      {
        title: 'Validate Due Date Cannot Be In Past during Task Creation',
        description: 'Add custom express-validator rule rejecting task creations with due dates earlier than current timestamp.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(now - 2 * day),
        userId: getUser(10),
      },
      {
        title: 'Implement Graceful Server Shutdown Handling',
        description: 'Listen for SIGTERM and SIGINT signals, closing existing HTTP connections and disconnecting MongoDB safely.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 4 * day),
        userId: getUser(3),
      },
      {
        title: 'Add Pagination Jump to Last Page and Page Boundaries Check',
        description: 'Handle edge cases where page requested exceeds totalPages by returning empty dataset with accurate metadata.',
        status: 'Completed',
        priority: 'Low',
        dueDate: new Date(now - 1 * day),
        userId: getUser(11),
      },

      // 51-60
      {
        title: 'Implement Collaborative Task Comments System',
        description: 'Design comment subdocument schema allowing team members to discuss and leave feedback on specific tasks.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 10 * day),
        userId: getUser(12),
      },
      {
        title: 'Setup ESLint and Prettier Automated Formatting Rules',
        description: 'Define code quality guidelines, Airbnb style rules, and commit-msg husky git hooks for consistency.',
        status: 'Completed',
        priority: 'Low',
        dueDate: new Date(now - 7 * day),
        userId: getUser(5),
      },
      {
        title: 'Implement Tagging and Category Labels for Tasks',
        description: 'Add array of strings for task tags (e.g. backend, bug, feature, docs) with indexed multikey lookups.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: new Date(now + 4 * day),
        userId: getUser(6),
      },
      {
        title: 'Audit User Account Deactivation Behavior on Active Tokens',
        description: 'Confirm that deactivated users with valid unexpired JWT tokens receive immediate 403 Forbidden errors.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 1 * day),
        userId: getUser(1),
      },
      {
        title: 'Build Search Autocomplete Suggestions API',
        description: 'Create fast lightweight endpoint returning top 5 matching task titles for search bar dropdowns.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(now + 12 * day),
        userId: getUser(7),
      },
      {
        title: 'Implement Task Duplication / Clone Endpoint',
        description: 'Allow users to clone recurring tasks copying title, description, and priority with reset status to Pending.',
        status: 'In Progress',
        priority: 'Low',
        dueDate: new Date(now + 3 * day),
        userId: getUser(8),
      },
      {
        title: 'Configure Cloudflare CDN and Edge Caching Layer',
        description: 'Setup DNS proxy, SSL/TLS full encryption, and DDoS attack mitigation rules on production API domain.',
        status: 'Pending',
        priority: 'High',
        dueDate: new Date(now + 14 * day),
        userId: getUser(2),
      },
      {
        title: 'Add Password Reset via Secure Email Token',
        description: 'Generate cryptographically random crypto token saved in DB with 10-minute expiry for password recovery.',
        status: 'Pending',
        priority: 'High',
        dueDate: new Date(now + 8 * day),
        userId: getUser(3),
      },
      {
        title: 'Refactor Express Router Modular Mounting',
        description: 'Organize router tree into distinct auth, task, user, and admin sub-routers for maximum readability.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(now - 2 * day),
        userId: getUser(4),
      },
      {
        title: 'Review MongoDB Atlas Connection Pooling Settings',
        description: 'Configure maxPoolSize: 50, minPoolSize: 10, and serverSelectionTimeoutMS: 5000 in mongoose connection options.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 3 * day),
        userId: getUser(3),
      },

      // 61-70
      {
        title: 'Create Weekly Sprint Burn-down Chart Endpoint',
        description: 'Aggregate completed story points per day across current 2-week sprint cycle for project managers.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 9 * day),
        userId: getUser(1),
      },
      {
        title: 'Add Real-time Task Updates via Socket.io',
        description: 'Broadcast task status updates across connected browser clients in real time when status changes occur.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(now + 5 * day),
        userId: getUser(14),
      },
      {
        title: 'Implement Subtasks / Checklist Items in Task Schema',
        description: 'Support checklist items [{ title: String, isCompleted: Boolean }] embedded within each task document.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 11 * day),
        userId: getUser(10),
      },
      {
        title: 'Conduct Database Schema Migration Testing',
        description: 'Write rollback-safe migration scripts handling field renames and default value populations for existing records.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(now - 4 * day),
        userId: getUser(2),
      },
      {
        title: 'Implement Task Archival Policy for Old Completed Tasks',
        description: 'Move tasks completed over 6 months ago into cold archive collection to maintain query speed on active tables.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(now + 18 * day),
        userId: getUser(1),
      },
      {
        title: 'Build Notification Badge Count API Endpoint',
        description: 'Return unread notification counts and high priority tasks nearing due dates in single lightweight query.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: new Date(now + 2 * day),
        userId: getUser(5),
      },
      {
        title: 'Perform Cross-Browser Compatibility Testing',
        description: 'Verify layout rendering and API interaction across Chrome, Firefox, Safari, and Edge on mobile and desktop.',
        status: 'Completed',
        priority: 'Low',
        dueDate: new Date(now - 1 * day),
        userId: getUser(7),
      },
      {
        title: 'Implement Task Time Tracking and Logged Hours',
        description: 'Allow team members to record spent hours and estimated completion effort against active tasks.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date(now + 12 * day),
        userId: getUser(6),
      },
      {
        title: 'Configure Automated Health Check Alerts on Slack',
        description: 'Send Slack webhook alerts if /api/health returns non-200 status code during consecutive 60-second pings.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 2 * day),
        userId: getUser(2),
      },
      {
        title: 'Audit All API Response Status Codes for RESTful Compliance',
        description: 'Verify 201 Created for POST, 200 OK for GET/PUT, 204 or 200 for DELETE, 400 for validation, and 403 for RBAC.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 1 * day),
        userId: getUser(3),
      },

      // 71-75
      {
        title: 'Prepare Final Technical Assignment Submission Documentation',
        description: 'Review README.md, environment variables, Postman collection test scripts, and deployment instructions.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now),
        userId: getUser(3),
      },
      {
        title: 'Record Video Walkthrough of REST API and RBAC Architecture',
        description: 'Demonstrate user registration, JWT login, task filtering, admin hierarchy guards, and Postman execution.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: new Date(now + 1 * day),
        userId: getUser(3),
      },
      {
        title: 'Verify Environment Variables Isolation in Git',
        description: 'Double check .gitignore to ensure real credentials and .env secrets are strictly excluded from git tracking.',
        status: 'Completed',
        priority: 'High',
        dueDate: new Date(now - 3 * day),
        userId: getUser(3),
      },
      {
        title: 'Design Scalable Microservices Roadmap for Future Expansion',
        description: 'Document potential transition from modular monolith to decoupled authentication, task, and notification services.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date(now + 20 * day),
        userId: getUser(0),
      },
      {
        title: 'Conduct Final Peer Code Review & Clean Commit History',
        description: 'Review controller error handling, validate naming conventions, and prepare clean branch merge for GitHub.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(now + 1 * day),
        userId: getUser(0),
      },
    ];

    await Task.insertMany(tasksData);
    console.log(`[Seeder] Successfully seeded ${tasksData.length} tasks!`);

    // -------------------------------------------------------------------------
    // Summary Metrics
    // -------------------------------------------------------------------------
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const highPriorityTasks = await Task.countDocuments({ priority: 'High' });
    const mediumPriorityTasks = await Task.countDocuments({ priority: 'Medium' });
    const lowPriorityTasks = await Task.countDocuments({ priority: 'Low' });

    console.log('\n================ DATABASE SEEDING SUMMARY ================');
    console.log(`Total Users in DB:    ${totalUsers}`);
    console.log(` - Super-Admin:       ${await User.countDocuments({ role: 'super-admin' })}`);
    console.log(` - Admins:            ${await User.countDocuments({ role: 'admin' })}`);
    console.log(` - Regular Users:     ${await User.countDocuments({ role: 'user' })}`);
    console.log(` - Active Users:      ${await User.countDocuments({ isActive: true })}`);
    console.log(` - Inactive Users:    ${await User.countDocuments({ isActive: false })}`);
    console.log(`----------------------------------------------------------`);
    console.log(`Total Tasks in DB:    ${totalTasks}`);
    console.log(` - Pending:           ${pendingTasks}`);
    console.log(` - In Progress:       ${inProgressTasks}`);
    console.log(` - Completed:         ${completedTasks}`);
    console.log(` - High Priority:     ${highPriorityTasks}`);
    console.log(` - Medium Priority:   ${mediumPriorityTasks}`);
    console.log(` - Low Priority:      ${lowPriorityTasks}`);
    console.log('==========================================================\n');

    console.log('[Seeder] Database seeding finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
