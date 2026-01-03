# Project: POZOS_DRT (Flood Well Inspection App)

## Overview
This project is a web-based application designed for managing daily safety and environmental inspections of flood wells (Pozos de Inundación). It features a bilingual interface (Chinese/Spanish) and allows users to fill out checklists, record shift personnel details, and generate PDF reports.

## Architecture
*   **Backend:** Python (Flask). Currently acts primarily as a static file server for the frontend, though it contains legacy/alternative API endpoints.
*   **Frontend:** HTML5, Bootstrap 5, Vanilla JavaScript.
*   **Database:** PostgreSQL hosted on Supabase.
*   **Data Access:** The frontend interacts **directly** with Supabase using the `@supabase/supabase-js` client for authentication and data CRUD operations.
*   **Authentication:** Custom login implemented via Supabase (checking against a `users` table).

## Key Files
*   `app.py`: Main Flask application entry point. Serves `index.html` and contains backend API routes (currently bypassed by frontend direct DB calls).
*   `index.html`: The complete frontend application. Contains:
    *   UI layout (Bootstrap).
    *   Application Logic (JavaScript): Supabase integration, form handling, and PDF generation.
    *   Styles (CSS).
*   `setup_db.py`: Python script to initialize the PostgreSQL database schema (`inspections` table).
*   `setup_users.py`: Python script to manage or seed user credentials.
*   `script.js`: (Likely legacy or supplementary) External JavaScript file.
*   `supabase_policy.sql`: SQL file containing database policies (RLS).

## Setup & Running
1.  **Prerequisites:** Python 3.x installed.
2.  **Install Dependencies:**
    ```bash
    pip install flask psycopg2
    ```
3.  **Database Setup:**
    Run the setup script to ensure tables exist (if not already set up):
    ```bash
    python setup_db.py
    ```
4.  **Run Application:**
    ```bash
    python app.py
    ```
5.  **Access:** Open a browser and navigate to `http://localhost:5000`.

## Development Notes
*   **Supabase Client:** The frontend uses a direct connection to Supabase. Configuration (URL and Anon Key) is embedded in `index.html`.
*   **PDF Generation:** Uses `html2pdf.js` to render the DOM as a PDF.
*   **Localization:** The UI is hardcoded with Chinese and Spanish text side-by-side.
*   **Authentication:** Passwords currently appear to be stored/checked as plain text in the `users` table logic within `index.html`.

## Common Tasks
*   **Updating Checklist:** Edit the `checklistItems` array in `index.html`.
*   **Database Schema Changes:** Modify `setup_db.py` or execute SQL directly via Supabase dashboard.
