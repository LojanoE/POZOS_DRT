# POZOS_DRT (Flood Well Inspection App) - v1.8.0

## Descripción
Esta aplicación está diseñada para la gestión y seguimiento de las inspecciones diarias de seguridad y medio ambiente de los pozos de inundación (Pozos de Descarga de Inundación). Es una herramienta bilingüe (Chino/Español) que facilita el registro de listas de verificación, turnos de personal y datos técnicos críticos de bombeo y niveles de agua.

## Características Principales
*   **Interfaz Bilingüe:** Todos los campos y elementos de la lista de verificación se presentan en Chino y Español.
*   **Gestión de Inspecciones:** Registro detallado de cumplimiento de seguridad y observaciones por turno (Día/Noche).
*   **Datos Técnicos de Bombeo:** Registro de horas de apertura y cierre de bomba, niveles de agua (antes y después) y niveles de lodo por turno.
*   **Generación de Reportes PDF:** Exportación individual de reportes en formato A4 para archivo físico o digital.
*   **Exportación por Lote:** Descarga masiva de reportes en un archivo ZIP filtrado por rango de fechas.
*   **Gráfica de Tendencia:** Visualización interactiva de la evolución de los niveles de agua mediante curvas de tendencia (Chart.js).
*   **Control de Versiones:** Soporte para múltiples versiones de inspección por fecha, permitiendo correcciones y trazabilidad.
*   **Autenticación Personalizada:** Acceso controlado mediante credenciales verificadas en base de datos.

## Arquitectura del Sistema
*   **Frontend:** Single Page Application (SPA) construida con HTML5, Bootstrap 5 y Vanilla JavaScript.
    *   **Chart.js:** Generación de gráficas de niveles.
    *   **html2pdf.js:** Generación de PDFs en el cliente.
    *   **JSZip & FileSaver.js:** Empaquetado y descarga de archivos ZIP.
*   **Backend:** Servidor Flask (Python) encargado de servir la aplicación y endpoints complementarios.
*   **Base de Datos:** PostgreSQL alojado en **Supabase**.
    *   Conexión directa desde el frontend mediante el SDK `@supabase/supabase-js`.
    *   Políticas RLS (Row Level Security) configuradas para acceso controlado.

## Esquema de Base de Datos

### Tabla: `inspections`
Almacena los resultados de la lista de verificación y metadatos de los turnos.
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | SERIAL (PK) | ID único del registro |
| `inspection_date` | DATE | Fecha de la inspección |
| `day_shift_person` | TEXT | Personal del turno día |
| `night_shift_person`| TEXT | Personal del turno noche |
| `day_remarks` | TEXT | Observaciones del día |
| `night_remarks` | TEXT | Observaciones de la noche |
| `checklist_data` | JSONB | Datos de la lista (Estado SI/NO y notas) |
| `version` | INTEGER | Número de versión (auto-incremento por fecha) |

### Tabla: `pump_records`
Almacena datos técnicos de operación de bomba y niveles de reservorio.
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `inspection_date` | DATE (Unique) | Fecha (un solo registro técnico por día) |
| `day_pump_open` | TIME | Hora apertura bomba (Día) |
| `day_pump_close` | TIME | Hora cierre bomba (Día) |
| `day_water_level_after`| NUMERIC | Nivel de agua después del turno día |
| `night_pump_open` | TIME | Hora apertura bomba (Noche) |
| `night_pump_close` | TIME | Hora cierre bomba (Noche) |
| `night_water_level_after`| NUMERIC | Nivel de agua después del turno noche |
| *(Otros campos)* | NUMERIC | Niveles de agua antes y niveles de lodo |

## Estructura de Archivos
*   `index.html`: Estructura principal y contenedores de las 5 pestañas del sistema.
*   `script.js`: Lógica de negocio (Supabase, PDF, ZIP, Gráficas, Control de UI).
*   `style.css`: Estilos personalizados (Modo oscuro, layout de tablas).
*   `setup_db.py`: Script Python para inicializar las tablas en Supabase.
*   `setup_users.py`: Gestión de usuarios y contraseñas.
*   `app.py`: Servidor Flask para ejecución local.
*   `supabase_policy.sql`: Definición de políticas de seguridad para el editor SQL de Supabase.

## Configuración y Ejecución
1.  **Requisitos:** Python 3.x instalado.
2.  **Dependencias:** `pip install flask psycopg2`.
3.  **Base de Datos:**
    *   Configurar las credenciales en `setup_db.py` y `script.js`.
    *   Ejecutar `python setup_db.py` para crear las tablas.
4.  **Ejecutar:** `python app.py`.
5.  **Acceso:** Navegar a `http://localhost:5000`.

---
**Desarrollado para la gestión eficiente de Pozos de Inundación.**
