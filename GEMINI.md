# Project: POZOS_DRT (Flood Well Inspection App)

## Overview
This project is a web-based application designed for managing daily safety and environmental inspections of flood wells (Pozos de Inundación). It features a bilingual interface (Chinese/Spanish) and allows users to fill out checklists, record shift personnel details, and generate PDF reports.

## Architecture
*   **Frontend:** Single Page Application (SPA) using HTML5, Bootstrap 5, and Vanilla JavaScript.
    *   Interacts **directly** with Supabase using the `@supabase/supabase-js` client for authentication and CRUD operations.
    *   Uses `html2pdf.js` for client-side report generation.
*   **Backend:** Python (Flask) in `app.py`. 
    *   Primarily serves `index.html`.
    *   Contains REST API endpoints (`/api/inspection/`, `/api/save`) as alternatives to direct Supabase access, though the frontend currently prioritizes the JS SDK.
*   **Database:** PostgreSQL hosted on Supabase.
    *   Table `inspections`: Stores checklist results and shift metadata.
    *   Table `users`: Stores credentials for custom login.
*   **Authentication:** Custom login overlay that verifies credentials against the `users` table via the Supabase client.

## Database Schema
### Table: `inspections`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | SERIAL (PK) | Unique record ID |
| `created_at` | TIMESTAMP | Auto-generated timestamp |
| `inspection_date` | DATE | Date of the inspection (Unique per record) |
| `day_shift_person` | TEXT | Name of the person on day shift |
| `night_shift_person`| TEXT | Name of the person on night shift |
| `day_remarks` | TEXT | Observations/Remarks for the day shift |
| `night_remarks` | TEXT | Observations/Remarks for the night shift |
| `checklist_data` | JSONB | Array of objects containing question IDs, statuses (OK/X/NA), and notes |

### Table: `users`
| Column | Type | Description |
| :--- | :--- | :--- |
| `username` | TEXT | Login username |
| `password` | TEXT | Password (currently stored in plain text) |

## Key Files
*   `app.py`: Flask server entry point.
*   `index.html`: The main application. Contains UI, CSS, and all JavaScript logic (Supabase client, PDF generation, UI rendering).
*   `setup_db.py`: Script to initialize the `inspections` table.
*   `setup_users.py`: Script to manage or seed the `users` table.
*   `style.css` & `script.js`: Supplementary files (most logic is currently in `index.html`).
*   `supabase_policy.sql`: RLS (Row Level Security) policies for the database.

## Features
*   **Bilingual Support:** All labels and checklist items are displayed in both Chinese and Spanish.
*   **Auto-Load:** Selecting a date automatically fetches existing records for that day.
*   **Auto-Save:** Generating a PDF triggers an automatic save to the database.
*   **PDF Export:** Generates a formatted A4 report using a temporary DOM overlay to ensure consistent rendering.

## Setup & Running
1.  **Prerequisites:** Python 3.x installed.
2.  **Install Dependencies:**
    ```bash
    pip install flask psycopg2
    ```
3.  **Database Setup:**
    ```bash
    python setup_db.py
    python setup_users.py
    ```
4.  **Run Application:**
    ```bash
    python app.py
    ```
5.  **Access:** Open a browser and navigate to `http://localhost:5000`.

## Development Notes
*   **Checklist Items:** Defined in the `checklistItems` array within `index.html`. Each item has a `zh` (Chinese) and `es` (Spanish) description.
*   **Supabase Credentials:** The `SUPABASE_URL` and `SUPABASE_KEY` (Anon Key) are hardcoded in the script section of `index.html`.
*   **PDF Layout:** The PDF layout is constructed dynamically as an HTML string within the `exportToPDF` function.