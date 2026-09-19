# CampusNest — Hostel Room Allotment & Mess Management System

> **🌐 Live Deployment:** [https://webassignment2-peach.vercel.app](https://webassignment2-peach.vercel.app)  
> **📂 GitHub Repository:** [https://github.com/namangoyal176-10/webassignment2](https://github.com/namangoyal176-10/webassignment2)

---

### 🔑 Live Evaluation Credentials
* **Warden / Admin:** `admin@hostel.com` &bull; Password: `Admin@1234`
* **Resident Student:** `aarav.sharma@hostel.edu` &bull; Password: `student123`  
*(One-click demo credentials fill buttons are also available on the Login page)*

---

## Key Features

### 1. User Roles & Security
* **Role-Based Access Control (RBAC):** Distinct `student` and `admin` portals with role-enforced route middleware.
* **Bcrypt Password Security:** 10-round salted password hashing with secure sessions via MongoDB (`connect-mongo`).
* **Flash Notifications:** Toast alerts for instant success and error feedback without third-party library issues.

### 2. Room Allotment Engine & Capacity Enforcement
* **Strict Capacity Control:** Backend-enforced condition (`occupiedBeds < capacity`) guaranteed before any bed assignment.
* **Automated Status Transitions:** Rooms seamlessly transition between `Available` (0 occupied), `Partially Occupied` (1 to capacity - 1), and `Full` (capacity reached).
* **Room Vacate Action:** One-click vacate capability that safely decrements occupancy, removes resident references, and immediately frees the bed for new allotment.
* **Atomic Room Transfers:** Allows students to apply for room transfers to available rooms. On approval, the old bed is freed and the new bed is claimed atomically.

### 3. Maintenance Ticketing System
* **Categorized Complaints:** Electrical, Plumbing, Furniture, Cleaning, Internet / Wi-Fi, and General.
* **Priority Flags:** Urgent, High, Medium, and Low SLAs.
* **Status Lifecycle:** `Pending` &rarr; `In Progress` &rarr; `Resolved` / `Rejected` with warden remarks.

### 4. Mess & Dining Management
* **7-Day Weekly Timetable:** Full dining timetable for Monday through Sunday across 4 meals (Breakfast, Lunch, Evening Snacks, Dinner).
* **Active Day Highlight:** Automatic current day detection and highlight for quick student access.
* **Quality Assurance Feedback:** 1–5 star ratings and reviews with compound unique indexing preventing duplicate reviews for the same meal and day.
* **Daily Attendance Registry:** Daily check-ins used for tracking mess consumption.

### 5. Automated Monthly Mess Invoicing
* **Dynamic Cost Formula:** `Total = daysPresent × perDayRate`.
* **Batch Invoice Generation:** Warden can generate bills across all residents with attendance reconciliation and payment toggles.

### 6. Warden Analytics Dashboard
* **Real-time KPI Metrics:** Total Blocks, Total Rooms, Total Bed Capacity, Occupied Beds, Available Beds, and Occupancy %.
* **Interactive Chart Visualizations:** Block-wise capacity vs. occupancy bar chart and room status distribution doughnut chart powered by Chart.js.

---

## Technology Stack

| Layer | Mandatory Technology |
| :--- | :--- |
| **Backend Runtime** | Node.js (v18+) |
| **Server Framework** | Express.js |
| **Database** | MongoDB & Mongoose ODM |
| **Session Store** | `connect-mongo` (Serverless persistent session store) |
| **Templating Engine**| EJS (Embedded JavaScript) |
| **Styling** | Vanilla CSS3 (Custom Design System with Variables) |
| **Client Scripts** | Vanilla JavaScript & Chart.js |
| **Password Security**| bcryptjs |
| **Deployment Target**| Vercel (`api/index.js` + `vercel.json`) |

---

## Project Structure

```text
WEBASSIGMENT-02/
├── .env.example                 # Environment template
├── .gitignore                   # Ignored files (node_modules, .env)
├── package.json                 # Project dependencies & scripts
├── vercel.json                  # Vercel serverless routing
├── server.js                    # Local development server entry
├── app.js                       # Express configuration & middleware
├── api/
│   └── index.js                 # Vercel serverless function entry
├── config/
│   └── db.js                    # Cached Mongoose connection (serverless-friendly)
├── models/
│   ├── User.js                  # Student & Warden users
│   ├── HostelBlock.js           # Residential blocks
│   ├── Room.js                  # Room capacity & residents
│   ├── RoomRequest.js           # New room allotment requests
│   ├── RoomChangeRequest.js     # Transfer requests
│   ├── MaintenanceRequest.js    # Maintenance tickets
│   ├── MessMenu.js              # Weekly mess schedule
│   ├── MealFeedback.js          # Meal ratings (1-5) & reviews
│   ├── MealAttendance.js        # Daily meal check-ins
│   └── MessBill.js              # Monthly mess invoices
├── controllers/
│   ├── authController.js        # Auth & registration logic
│   ├── adminController.js       # Admin dashboard & student directory
│   ├── roomController.js        # Blocks, rooms, allotment & vacate logic
│   ├── studentController.js     # Student portal views & requests
│   ├── maintenanceController.js # Ticketing workflow
│   ├── messController.js        # Weekly menu & feedback
│   └── billController.js        # Monthly invoice calculations
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── adminRoutes.js
│   └── publicRoutes.js
├── middleware/
│   ├── auth.js                  # Route authentication gates
│   └── role.js                  # Role-based authorization & user locals
├── views/
│   ├── partials/                # Header, sidebar, topbar, flash, footer
│   ├── public/                  # Landing page & guidelines
│   ├── auth/                    # Login & student registration
│   ├── student/                 # Student dashboard, room, mess, bills, profile
│   ├── admin/                   # Warden dashboard, blocks, rooms, tickets, bills
│   └── errors/                  # 404 & 500 error pages
├── public/
│   ├── css/                     # main.css, components.css, dashboard.css
│   └── js/                      # main.js, charts.js
└── scripts/
    ├── seed.js                  # Database seeder with realistic demo data
    └── test-capacity.js         # Automated room capacity verification suite
```

---

## Installation & Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **MongoDB** (Local instance running on `localhost:27017` or MongoDB Atlas account)

### 1. Clone & Install Dependencies
```bash
git clone <YOUR_REPOSITORY_URL>
cd WEBASSIGMENT-02
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Review or edit `.env`:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/hostel_db
SESSION_SECRET=super_secret_hostel_session_key_987654321
ADMIN_EMAIL=admin@hostel.com
ADMIN_PASSWORD=Admin@1234
ADMIN_NAME=Chief Warden Dr. Rajesh Verma
ADMIN_PHONE=9876543210
```

---

## Database Seeding

Populate the database with blocks, rooms, students, maintenance tickets, a 7-day dining schedule, feedbacks, and invoices:
```bash
npm run seed
```

### Pre-configured Evaluation Accounts
| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Warden Admin** | `admin@hostel.com` | `Admin@1234` | Full administration permissions |
| **Student Resident** | `aarav.sharma@hostel.edu` | `student123` | Allotted to Room A-102 |
| **Student Resident** | `rohan.gupta@hostel.edu` | `student123` | Roommate in Room A-102 |
| **Unallotted Student**| `devansh.verma@hostel.edu` | `student123` | Has pending room request |

> **Pro Tip:** The login screen (`/login`) includes **1-Click Demo Buttons** to automatically autofill either Warden Admin or Student credentials for testing.

---

## Running Locally

To run with auto-restart during development:
```bash
npm run dev
```

To run in standard production mode:
```bash
npm start
```

Open your browser at:
```text
http://localhost:3001
```

---

## Running the Automated Room Capacity Test

To verify the backend capacity validation and vacancy logic:
```bash
npm run test:capacity
```

This automated test executes the following sequence:
1. Creates a 4-bed capacity room.
2. Allots Students 1, 2, 3, and 4 &rarr; verifies room reaches `Full` status.
3. Attempts to allot Student 5 &rarr; asserts backend rejects the request.
4. Vacates Student 2 &rarr; verifies occupancy drops to 3/4 and status transitions to `Partially Occupied`.
5. Re-allots Student 5 into the newly freed bed &rarr; verifies successful allotment and return to `Full` status.

---

## MongoDB Atlas Setup Walkthrough

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g. `hostel_admin`) and generate a secure password.
4. Under **Network Access**, click **Add IP Address** and add `0.0.0.0/0` (Allow Access from Anywhere) to permit connections from Vercel serverless functions.
5. In your cluster dashboard, click **Connect** &rarr; **Drivers (Node.js)**.
6. Copy the connection string and paste it into `.env` or Vercel Environment Variables:
   ```text
   MONGODB_URI=mongodb+srv://hostel_admin:<password>@cluster0.xxxxx.mongodb.net/hostel_db?retryWrites=true&w=majority
   ```

---

## Vercel Deployment Instructions

This project is pre-configured with `vercel.json` and `api/index.js` for serverless deployment on Vercel.

### Steps to Deploy:
1. Install the Vercel CLI (optional) or deploy directly via GitHub integration:
   ```bash
   npm install -g vercel
   vercel
   ```
2. In the Vercel Project Dashboard, navigate to **Settings** &rarr; **Environment Variables**.
3. Add the following production environment variables:
   * `NODE_ENV` = `production`
   * `MONGODB_URI` = `<YOUR_MONGODB_ATLAS_CONNECTION_STRING>`
   * `SESSION_SECRET` = `<STRONG_RANDOM_SECRET_KEY>`
   * `ADMIN_EMAIL` = `admin@hostel.com`
   * `ADMIN_PASSWORD` = `<YOUR_SECURE_ADMIN_PASSWORD>`
4. Redeploy the project on Vercel. The serverless functions will automatically cache database connections and maintain persistent sessions via MongoDB Atlas!

---

## Git & GitHub Commands

To commit and push to your GitHub repository:

```bash
# Initialize git repository
git init

# Add all files (excluding node_modules and .env per .gitignore)
git add .

# Commit project files
git commit -m "Initial hostel room allotment and mess management system"

# Rename default branch to main
git branch -M main

# Add your GitHub repository remote
git remote add origin YOUR_GITHUB_REPOSITORY_URL

# Push to GitHub
git push -u origin main
```

---

## License
MIT License. Created for the College Hostel Room Allotment & Mess Management assignment.
