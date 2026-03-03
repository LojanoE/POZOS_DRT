# Project: POZOS_DRT (Flood Well Inspection App)

## Overview
This project is a web-based application designed for managing daily safety and environmental inspections of flood wells (Pozos de Inundación). It features a bilingual interface (Chinese/Spanish) and allows users to fill out checklists, record shift personnel details, track technical pump data, and generate reports/visualizations.

## Architecture
*   **Frontend:** Single Page Application (SPA) using HTML5, Bootstrap 5, and Vanilla JavaScript.
    *   Interacts **directly** with Supabase using the `@supabase/supabase-js` client.
    *   Uses `html2pdf.js` for PDF generation.
    *   Uses `Chart.js` for level trend visualization.
    *   Uses `JSZip` for batch report packaging.
*   **Backend:** Python (Flask) in `app.py`.
*   **Database:** PostgreSQL hosted on Supabase.

## Database Schema

### Table: `inspections`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | SERIAL (PK) | Unique record ID |
| `inspection_date` | DATE | Date of the inspection |
| `day_shift_person` | TEXT | Name of the person on day shift |
| `night_shift_person`| TEXT | Name of the person on night shift |
| `day_remarks` | TEXT | Observations/Remarks for the day shift |
| `night_remarks` | TEXT | Observations/Remarks for the night shift |
| `checklist_data` | JSONB | Array of objects (Question ID, status SI/NO, notes) |
| `version` | INTEGER | Version number per date |

### Table: `pump_records`
Technical data for the single pump and elevation levels (stored per date).
| Column | Type | Description |
| :--- | :--- | :--- |
| `inspection_date` | DATE (Unique) | Date link |
| `day_pump_open` | TIME | Pump opening time (Day) |
| `day_pump_close` | TIME | Pump closing time (Day) |
| `day_water_level_before` | NUMERIC | Water level before shift (Day) |
| `day_water_level_after` | NUMERIC | Water level after shift (Day) |
| `day_mud_level` | NUMERIC | Mud level (Day) |
| `night_pump_open` | TIME | Pump opening time (Night) |
| `night_pump_close` | TIME | Pump closing time (Night) |
| `night_water_level_before`| NUMERIC | Water level before shift (Night) |
| `night_water_level_after` | NUMERIC | Water level after shift (Night) |
| `night_mud_level` | NUMERIC | Mud level (Night) |

### Table: `users`
| Column | Type | Description |
| :--- | :--- | :--- |
| `username` | TEXT | Login username |
| `password` | TEXT | Password (plain text) |

## Key Features
*   **Bilingual Support:** Chinese/Spanish for all checklist items and labels.
*   **5-Tab Navigation:**
    1.  **Verificación:** Main form for checklist and technical data.
    2.  **Reportes (ZIP):** Quick date range ZIP export.
    3.  **Consulta y Lote:** Historical search, viewing past records, and selective ZIP export.
    4.  **Información de Bombas:** Tabular view of all technical pump/level data.
    5.  **Gráfica de Niveles:** Visual trend curves for water levels (Day vs Night).
*   **PDF Export:** Professional A4 report generation (Technical data is stored but excluded from PDF).
*   **Versioning:** Automatic version incrementing for multiple entries on the same date.

## Version History
*   **v1.8.0:** Added "Gráfica de Niveles" tab using Chart.js.
*   **v1.7.0:** Added "Información de Bombas" tab with tabular technical reports.
*   **v1.6.1:** Consolidated to a single pump with Day/Night shift fields.
*   **v1.6.0:** Initial integration of technical records (pumps/levels).
*   **v1.5.2:** Changed status labels in PDF to SI/NO.
