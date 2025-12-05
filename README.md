Vendor Payment & Bank Statement Manager (Excel Add-in + Web Mode):

This project is a dual-mode application that runs as:
A Microsoft Excel Task Pane Add-in, and A Standalone Web Application (same UI + functionality) It enables the Finance Team to manage vendors, perform payments, track account balances, and generate bank reports.

Project Overview:

This solution manages two bank accounts, vendor lists, payment processing, history tracking, and Excel-based reporting. Each account begins with $200,000, and payments reduce the balance in real time.

All data is stored using LocalStorage, and Excel integration is achieved using Office.js.

Core Features:

1. Authentication
Login/Logout system using mock credentials Secured access to task pane features User session persisted using LocalStorage

2. Vendor Management
Add vendor with:Vendor Name
Assigned Account (A / B)
View vendor list with auto-generated details
Vendor data persists locally

3. Payment Processing
Select vendor from dropdown
Enter payment amount
Auto-detect assigned account
Validate balance before deduction
Payment logs saved with:
Vendor Name
Amount
Account
Timestamp

4. Bank Account Simulation
Two accounts (A & B), starting at $200,000 each
Automatic balance deduction on payment
Live balance display in UI and Excel

5. Report Generation
Generate Current Bank Statement
Export to Excel sheet using:
Excel.run()
Office.js APIs
Report includes:
Account balances
Completed payments
Vendor names
Payment dates
Timestamp of report generation

6. Vendor Payment History
Filter payments by vendor
View complete history in UI and Excel

7. Dual Mode Execution
If Excel Add-in loads → Taskpane mode
If run in browser → Web mode
One single codebase supports both

Tech Stack:
TypeScript – Application logic
Office JavaScript API – Excel automation
HTML + CSS – UI design
LocalStorage – Data persistence
Webpack – Bundling
HTTPS Dev Server (required for Excel Add-ins)


Installation & Setup:
1. Clone Repository
git clone https://github.com/nitish2604/vendor-payment-excel-addin.git
cd vendor-payment-manager

2. Install dependencies
npm install

3. Start HTTPS Dev Server
Excel Add-ins require HTTPS.

npm start

This launches:

Web App → https://localhost:3000

Excel Add-in → Uses the same URL inside manifest

Loading the Add-in in Excel:
Option 1: Automated 
or
Open Excel
Go to Insert → Add-ins → My Add-ins
Select Upload My Add-in
Choose manifest.xml
Add-in appears in the right taskpane
All features fully functional

Option 2: Developer Mode
If Developer menu is enabled:
Developer → Add-ins → Upload Add-in
Select manifest.xml

Credentials:
Email: admin@company.com	
Password: admin123


Deliverables Included:
Full Source Code (TypeScript + HTML + CSS)
Excel Manifest
Web App + Excel Mode
Dual Execution System
README.md
Screenshot support
