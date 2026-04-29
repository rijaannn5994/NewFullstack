# InvenSystem - Full Stack Inventory Management
A robust, full-stack inventory management system featuring a Flask (Python) backend and an Angular 17+ frontend. The application includes role-based access control (RBAC), a point-of-sale (POS) interface, and automated technical documentation.

### Features
Authentication & RBAC: Secure login with distinct views and permissions for Admin and Staff roles.

Inventory Management: Full CRUD operations for stock items, including categories, reorder levels, and specifications.

Supplier Tracking: Management of supplier contact details and linked inventory items.

POS System: Dynamic point-of-sale interface with real-time stock filtering.

Automated Documentation: Technical code documentation generated via Compodoc.

Unit Testing: Automated frontend testing suite using Jasmine and Karma.

### Tech Stack
#### Frontend
Framework: Angular (Standalone Components)

Styling: Tailwind CSS

State Management: RxJS BehaviorSubjects

Testing: Jasmine & Karma

Documentation: Compodoc

Backend
Framework: Flask (Python)

Database: MongoDB

Authentication: Custom Middleware (Headers & Cookies)

Tools: Flask-CORS

## Installation & Setup
### 1. Prerequisites
Node.js (v18+)

Python (3.9+)

MongoDB (Running locally or via Atlas)

### 2. Backend Setup (Flask)
Bash
cd backend

# Install dependencies
pip install flask flask-cors pymongo

### Run the server (default: http://localhost:5001)
python app.py
### 3. Frontend Setup (Angular)
Bash
cd frontend
# Install dependencies
npm install

# Start the development server
ng serve
Navigate to http://localhost:4200/.

## Testing & Documentation
Running Frontend Tests
To run the Jasmine unit tests and generate a coverage report:

Bash
ng test --code-coverage
The report will be available in the /coverage folder.

Generating Documentation
To regenerate the Compodoc technical documentation:

Bash
npx compodoc -p tsconfig.app.json -d documentation
Open documentation/index.html to view the structure of the application.

## Credentials (Development)
Admin: admin / admin

Staff: staff / staff

## License
This project was developed as part of a technical assignment. All rights reserved.
