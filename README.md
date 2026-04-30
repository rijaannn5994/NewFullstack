# InvenSystem - Full Stack Inventory Management System

A robust full-stack inventory management application built with a **Flask (Python) backend** and an **Angular frontend**. The system provides secure authentication, role-based access control, inventory and supplier management, a point-of-sale (POS) interface, automated testing, and technical documentation.

---

## Features

### Authentication & Role-Based Access Control
- Secure login system
- Separate dashboards and permissions for:
  - **Admin**
  - **Staff**

### Inventory Management
- Full CRUD functionality for stock items
- Product categories
- Reorder level monitoring
- Item specifications and details
- Real-time stock updates

### Supplier Management
- Add, edit, view, and delete suppliers
- Supplier contact information tracking
- Supplier-linked inventory records

### Point of Sale (POS)
- Fast billing interface
- Dynamic product search/filtering
- Real-time stock deduction after sales

### Testing & Quality Assurance
- Frontend unit testing using **Jasmine** and **Karma**
- API integration testing
- Coverage reports supported

### Technical Documentation
- Auto-generated project documentation using **Compodoc**

---

## Tech Stack

## Frontend
- **Framework:** Angular (Standalone Components)
- **Styling:** Tailwind CSS
- **Reactive State:** RxJS BehaviorSubjects
- **Testing:** Jasmine & Karma
- **Documentation:** Compodoc

## Backend
- **Framework:** Flask (Python)
- **Database:** MongoDB
- **Authentication:** Custom Middleware (Headers & Cookies)
- **CORS Support:** Flask-CORS

---

# Installation & Setup

## 1. Prerequisites

Make sure the following are installed:

- Node.js (v18+)
- Python (v3.9+)
- MongoDB (Local or MongoDB Atlas)

---

## 2. Backend Setup (Flask)

```bash
cd backend
pip install flask flask-cors pymongo
python app.py
```

## Backend runs on:

```test
http://localhost:5001
```
## 3. Frontend Setup (Angular)
```bash
cd frontend
npm install
ng serve
```
## Frontend runs on:

```test
http://localhost:4200
```
## Running Tests
## Frontend Unit Tests
```bash
  ng test --code-coverage
```
And We can view our testing

```test
cd frontend
http://localhost:4200/home
```
to
```test
cd frontend
http://localhost:4200/test
```

## Coverage report generated in:

Generate Technical Documentation
```test
cd frontend
npx run compodoc 
```

## Report is generated in:

```bash
http://localhost:8080
http://127.0.0.1:8080
// in port 8080.
```  

## Project Structure
```text
NewFullstack/
├── NewFullstackProj/             # Flask Backend
│   ├── app.py                    # Main Flask application entry point
│   ├── config.py                 # Environment and DB configuration
│   ├── db.py                     # MongoDB connection setup
│   ├── dummydata.py              # Script to seed database
│   ├── routes/                   # API Endpoints (inventory_routes, supplier_routes)
│   └── utils/                    # Helper functions (auth decorators)
│
└── angular-invensystem/          # Angular Frontend
    ├── src/app/                  # Application Logic
    │   ├── auth.service.ts       # Authentication state management
    │   ├── auth.interceptor.ts   # HTTP Interceptor for headers/cookies
    │   ├── inventory/            # Inventory CRUD components
    │   ├── pos/                  # Point of Sale components
    │   └── supplier/             # Supplier management components
    ├── tailwind.config.js        # UI Styling configuration
    └── package.json              # Frontend dependencies

```
## Key Functional Modules
- Authentication System
- Inventory CRUD
- Supplier CRUD
- POS Billing
- Role-Based Dashboards
- Route Protection
- HTTP Interceptors
- Automated Testing
