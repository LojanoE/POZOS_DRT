// --- APPLICATION VERSIONING ---
const APP_VERSION = '1.5.1'; // Fixed PDF filename error

function initVersion() {
    document.querySelectorAll('.app-version-text').forEach(el => {
        el.innerText = APP_VERSION;
    });
}

function forceUpdate() {
    if (confirm("Se forzará la recarga de la aplicación para obtener la última versión. ¿Continuar?")) {
        // Hard reload, clearing cache where possible
        window.location.reload(true);
    }
}

// Call on load
window.addEventListener('DOMContentLoaded', initVersion);

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://krkoacewzhigjjybgzng.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtya29hY2V3emhpZ2pqeWJnem5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTMwMDgsImV4cCI6MjA4MzAyOTAwOH0.XeNiavBsXx3Q6HOVw_btjqmXoYB1ux22lo5muy330Yw';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- LOGIN LOGIC ---
async function performLogin() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    const errorMsg = document.getElementById('loginError');
    const btn = document.querySelector('#loginOverlay button');

    errorMsg.style.display = 'none';
    btn.disabled = true;
    btn.innerText = 'Verificando...';

    try {
        // Check credentials in 'users' table
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('username', user)
            .maybeSingle();

        if (error) throw error;

        // Simple plain text password check (as requested/setup)
        if (data && data.password === pass) {
            // Success
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            // Trigger initial load
            loadDataByDate();
        } else {
            // Fail
            errorMsg.innerText = "Usuario o contraseña incorrectos";
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        errorMsg.innerText = "Error de conexión";
        errorMsg.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerText = 'Entrar';
    }
}

// Allow Enter key to login
// Note: This needs to be called after DOM is ready or handled globally
document.addEventListener('DOMContentLoaded', () => {
    const loginPass = document.getElementById('loginPass');
    if (loginPass) {
        loginPass.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performLogin();
            }
        });
    }
});

// Checklist Items Data
const checklistItems = [
    {
        zh: "柴油发电机，油罐，油管是否是否有柴油溢出，柴油机内部是否漏油，油罐阀门是否关闭",
        es: "Si el motor diesel, el tanque de aceite y la tubería de aceite tienen fugas de aceite, Si la válvula del tanque diesel está cerrada",
        id: "q1"
    },
    {
        zh: "柴油漏油槽，发电机周围是否有油渍，油渍是否清理",
        es: "Tanque de fugas de aceite diesel, si hay manchas de aceite alrededor del generador and si las manchas de aceite se limpian",
        id: "q2"
    },
    {
        zh: "浮船是否牢靠，是否有浮块散架",
        es: "Si el pontón es confiable and si hay bloques flotantes que se desmoronan",
        id: "q3"
    },
    {
        zh: "2台水泵是否运行正常",
        es: "Funcionan normalmente las 2 bombas",
        id: "q4"
    },
    {
        zh: "道路及边坡是否正常，是否有滑坡现象",
        es: "Si los caminos and pendientes son normales and si hay algún fenómeno de derrumbe",
        id: "q5"
    },
    {
        zh: "垃圾是否进袋，每班次是否带走当班垃圾",
        es: "Si la basura se pone en la bolsa and si la basura de turno se retira en cada turno.",
        id: "q6"
    },
    {
        zh: "排洪井安全设施是否正常（安全网，安全钢绳）",
        es: "Si las instalaciones de seguridad de los pozos de descarga de inundación son normales (red segura, cuerda de acero de seguridad)",
        id: "q7"
    }
];

// Global variable to store current records for the date
let currentDayRecords = [];

// Initialize application components
document.addEventListener('DOMContentLoaded', () => {
    // Render Checklist
    const tbody = document.getElementById('checklistBody');
    if (tbody) {
        checklistItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="zh-text">${index + 1}. ${item.zh}</span>
                    <span class="es-text">${item.es}</span>
                </td>
                <td>
                    <select class="form-select form-select-sm" name="day_${item.id}">
                        <option value="">-</option>
                        <option value="OK">SI</option>
                        <option value="X">NO</option>
                    </select>
                    <input type="text" class="form-control form-control-sm mt-1" placeholder="Nota..." name="day_note_${item.id}">
                </td>
                <td>
                    <select class="form-select form-select-sm" name="night_${item.id}">
                        <option value="">-</option>
                        <option value="OK">SI</option>
                        <option value="X">NO</option>
                    </select>
                    <input type="text" class="form-control form-control-sm mt-1" placeholder="Nota..." name="night_note_${item.id}">
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Set today's date
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
        dateInput.addEventListener('change', loadDataByDate);
    }
});

// --- DATA LOADING & SAVING ---

async function loadDataByDate() {
    const dateInput = document.getElementById('date');
    const date = dateInput.value;
    if (!date) return;

    try {
        const { data, error } = await supabaseClient
            .from('inspections')
            .select('*')
            .eq('inspection_date', date)
            .order('version', { ascending: false });

        if (error) {
            console.error('Error loading data:', error);
            return;
        }

        currentDayRecords = data || [];

        if (currentDayRecords.length > 0) {
            // Load latest version by default
            loadSpecificVersion(currentDayRecords[0].id);
        } else {
            clearFormDataOnly();
        }
    } catch (error) {
        console.error('Error in loadDataByDate:', error);
    }
}

function loadSpecificVersion(id) {
    const data = currentDayRecords.find(r => r.id == id);
    if (!data) return;

    const currentRecordId = document.getElementById('currentRecordId');
    if (currentRecordId) currentRecordId.value = data.id;
    
    document.getElementById('dayShiftPerson').value = data.day_shift_person || '';
    document.getElementById('nightShiftPerson').value = data.night_shift_person || '';
    document.getElementById('dayRemarks').value = data.day_remarks || '';
    document.getElementById('nightRemarks').value = data.night_remarks || '';

    const checklist = data.checklist_data || [];
    
    checklist.forEach(item => {
        const daySelect = document.querySelector(`[name="day_${item.id}"]`);
        const dayNote = document.querySelector(`[name="day_note_${item.id}"]`);
        const nightSelect = document.querySelector(`[name="night_${item.id}"]`);
        const nightNote = document.querySelector(`[name="night_note_${item.id}"]`);

        if (daySelect) daySelect.value = item.day_status || '';
        if (dayNote) dayNote.value = item.day_note || '';
        if (nightSelect) nightSelect.value = item.night_status || '';
        if (nightNote) nightNote.value = item.night_note || '';
    });
    console.log("Registro ID " + data.id + " cargado para " + data.inspection_date);
}

function clearFormDataOnly() {
    const currentRecordId = document.getElementById('currentRecordId');
    if (currentRecordId) currentRecordId.value = '';
    
    document.getElementById('dayShiftPerson').value = '';
    document.getElementById('nightShiftPerson').value = '';
    document.getElementById('dayRemarks').value = '';
    document.getElementById('nightRemarks').value = '';
    
    document.querySelectorAll('#checklistBody select').forEach(el => el.value = '');
    document.querySelectorAll('#checklistBody input').forEach(el => el.value = '');
}

function clearForm() {
    if(confirm('¿Borrar todo el formulario?')) {
        const form = document.getElementById('inspectionForm');
        if (form) form.reset();
        const dateInput = document.getElementById('date');
        if (dateInput) dateInput.valueAsDate = new Date();
        loadDataByDate();
    }
}

async function saveToDatabase(silent = false) {
    const btn = document.querySelector('button[onclick="saveToDatabase()"]');
    const originalText = btn ? btn.innerText : '';
    if(btn) {
         btn.innerText = "Guardando...";
         btn.disabled = true;
    }

    try {
        const checklistData = checklistItems.map(item => {
            return {
                id: item.id,
                question_zh: item.zh,
                question_es: item.es,
                day_status: document.querySelector(`[name="day_${item.id}"]`).value,
                day_note: document.querySelector(`[name="day_note_${item.id}"]`).value,
                night_status: document.querySelector(`[name="night_${item.id}"]`).value,
                night_note: document.querySelector(`[name="night_note_${item.id}"]`).value
            };
        });

        const inspectionDate = document.getElementById('date').value;
        const currentRecordId = document.getElementById('currentRecordId').value;

        let payload = {
            inspection_date: inspectionDate,
            day_shift_person: document.getElementById('dayShiftPerson').value,
            night_shift_person: document.getElementById('nightShiftPerson').value,
            day_remarks: document.getElementById('dayRemarks').value,
            night_remarks: document.getElementById('nightRemarks').value,
            checklist_data: checklistData
        };

        let result;
        if (!currentRecordId) {
            const lastVersion = currentDayRecords.length > 0 ? Math.max(...currentDayRecords.map(r => r.version)) : 0;
            payload.version = lastVersion + 1;
            result = await supabaseClient.from('inspections').insert([payload]).select();
        } else {
            result = await supabaseClient.from('inspections').update(payload).eq('id', currentRecordId).select();
        }

        if (result.error) throw result.error;

        if(!silent) alert('¡Datos guardados exitosamente!');
        
        await loadDataByDate();
        
        if (!currentRecordId && result.data && result.data.length > 0) {
            document.getElementById('currentRecordId').value = result.data[0].id;
        }

        return true;

    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar: ' + error.message);
        return false;
    } finally {
        if(btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}

// --- PDF GENERATION ---

async function exportToPDF() {
    const saved = await saveToDatabase(true); 
    if (!saved) {
         if(!confirm("No se pudo guardar en la base de datos. ¿Generar PDF de todos modos?")) return;
    }

    const date = document.getElementById('date').value;
    const dayPerson = document.getElementById('dayShiftPerson').value || '-';
    const nightPerson = document.getElementById('nightShiftPerson').value || '-';
    const dayRemarks = document.getElementById('dayRemarks').value || '-';
    const nightRemarks = document.getElementById('nightRemarks').value || '-';

    let tableRows = '';
    checklistItems.forEach(item => {
        const daySelect = document.querySelector(`[name="day_${item.id}"]`);
        const dayNoteInput = document.querySelector(`[name="day_note_${item.id}"]`);
        const nightSelect = document.querySelector(`[name="night_${item.id}"]`);
        const nightNoteInput = document.querySelector(`[name="night_note_${item.id}"]`);

        const formatStatus = (val) => {
            if (val === 'OK') return '√ (Normal)';
            if (val === 'X') return 'X (Anormal)';
            if (val === 'NA') return 'N/A';
            return '-';
        };

        const dayStatus = formatStatus(daySelect.value);
        const dayNote = dayNoteInput.value;
        const nightStatus = formatStatus(nightSelect.value);
        const nightNote = nightNoteInput.value;

        tableRows += `
            <tr>
                <td style="border: 1px solid black; padding: 5px;">
                    <div style="color: #333; font-size: 10px;">${item.zh}</div>
                    <div style="font-weight: bold; font-size: 11px;">${item.es}</div>
                </td>
                <td style="border: 1px solid black; padding: 5px; text-align: center; vertical-align: middle;">
                    <div style="font-weight: bold;">${dayStatus}</div>
                    ${dayNote ? `<div style="font-style: italic; font-size: 9px; margin-top: 2px;">${dayNote}</div>` : ''}
                </td>
                <td style="border: 1px solid black; padding: 5px; text-align: center; vertical-align: middle;">
                    <div style="font-weight: bold;">${nightStatus}</div>
                    ${nightNote ? `<div style="font-style: italic; font-size: 9px; margin-top: 2px;">${nightNote}</div>` : ''}
                </td>
            </tr>
        `;
    });

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: black; padding: 45px; background: white; width: 100%; box-sizing: border-box;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0 0 8px 0; font-size: 20px;">排洪井安全、环境、排水生产检查表</h2>
                <h3 style="margin: 0; font-size: 18px;">Lista de verificación ambiental y de seguridad de pozos de inundación</h3>
            </div>
            <div style="margin-bottom: 20px; border: 1px solid black; padding: 12px; background-color: #f8f9fa;">
                <table style="width: 100%; font-size: 13px;">
                    <tr>
                        <td><strong>日期 Fecha:</strong> ${date}</td>
                        <td><strong>白班 Dia:</strong> ${dayPerson}</td>
                        <td><strong>夜班 Noche:</strong> ${nightPerson}</td>
                    </tr>
                </table>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 25px;">
                <thead>
                    <tr style="background-color: #e9ecef;">
                        <th style="border: 1px solid black; padding: 10px; width: 50%;">检查项目 Artículos Marcados</th>
                        <th style="border: 1px solid black; padding: 10px; width: 25%;">白班 Dia</th>
                        <th style="border: 1px solid black; padding: 10px; width: 25%;">夜班 Noche</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <div style="font-size: 12px;">
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; background-color: #e9ecef; padding: 6px; border: 1px solid black; border-bottom: none;">
                        白班备注 Observación:
                    </div>
                    <div style="border: 1px solid black; padding: 10px; min-height: 60px; white-space: pre-wrap;">${dayRemarks}</div>
                </div>
                <div>
                    <div style="font-weight: bold; background-color: #e9ecef; padding: 6px; border: 1px solid black; border-bottom: none;">
                        夜班备注 Observación:
                    </div>
                    <div style="border: 1px solid black; padding: 10px; min-height: 60px; white-space: pre-wrap;">${nightRemarks}</div>
                </div>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    window.scrollTo(0, 0);
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw'; 
    container.style.height = '100vh';
    container.style.zIndex = '9999';
    container.style.backgroundColor = 'rgba(0,0,0,0.8)';
    container.style.overflowY = 'auto'; 
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.paddingTop = '10px';
    
    const pageWrapper = document.createElement('div');
    pageWrapper.innerHTML = htmlContent;
    pageWrapper.style.width = '210mm'; 
    pageWrapper.style.background = 'white';
    pageWrapper.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    pageWrapper.style.height = 'fit-content'; 
    
    container.appendChild(pageWrapper);
    
    const message = document.createElement('div');
    message.textContent = "Generando PDF... / Generating PDF...";
    message.style.position = 'fixed';
    message.style.top = '10px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.background = '#28a745';
    message.style.color = 'white';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '10000';
    container.appendChild(message);

    document.body.appendChild(container);

    setTimeout(() => {
        const opt = {
            margin:       0,
            filename:     `Inspeccion_${date}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true,
                scrollY: 0,
                windowWidth: document.documentElement.offsetWidth
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(pageWrapper).save().then(() => {
            document.body.removeChild(container);
        });
    }, 800);
}

// --- QUERY & BATCH EXPORT ---

async function exportRangeToZip() {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const statusDiv = document.getElementById('exportStatus');
    const progressBar = document.getElementById('exportProgressBar');
    const statusText = document.getElementById('exportStatusText');

    if (!start || !end) {
        alert("Por favor seleccione ambas fechas.");
        return;
    }

    statusDiv.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.innerText = "Consultando base de datos...";

    try {
        const { data, error } = await supabaseClient
            .from('inspections')
            .select('*')
            .gte('inspection_date', start)
            .lte('inspection_date', end)
            .order('inspection_date', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            alert("No se encontraron registros en este rango de fechas.");
            statusDiv.style.display = 'none';
            return;
        }

        statusText.innerText = `Generando ${data.length} PDFs...`;
        const zip = new JSZip();
        
        for (let i = 0; i < data.length; i++) {
            const record = data[i];
            const progress = Math.round(((i) / data.length) * 100);
            progressBar.style.width = `${progress}%`;
            statusText.innerText = `Procesando: ${record.inspection_date} (${i+1}/${data.length})`;

            const pdfBlob = await generatePDFBlob(record);
            const fileName = `Inspeccion_${record.inspection_date}${record.version ? '_v' + record.version : ''}.pdf`;
            zip.file(fileName, pdfBlob);
        }

        progressBar.style.width = '100%';
        statusText.innerText = "Empaquetando ZIP...";

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Inspecciones_${start}_a_${end}.zip`);

        statusText.innerText = "¡Descarga completa!";
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);

    } catch (err) {
        console.error(err);
        alert("Error durante la exportación: " + err.message);
        statusDiv.style.display = 'none';
    }
}

async function generatePDFBlob(data) {
    const date = data.inspection_date;
    const dayPerson = data.day_shift_person || '-';
    const nightPerson = data.night_shift_person || '-';
    const dayRemarks = data.day_remarks || '-';
    const nightRemarks = data.night_remarks || '-';
    const checklist = data.checklist_data || [];

    let tableRows = '';
    checklist.forEach(item => {
        const formatStatus = (val) => {
            if (val === 'OK') return '√ (Normal)';
            if (val === 'X') return 'X (Anormal)';
            if (val === 'NA') return 'N/A';
            return '-';
        };

        const dayStatus = formatStatus(item.day_status);
        const nightStatus = formatStatus(item.night_status);

        tableRows += `
            <tr>
                <td style="border: 1px solid black; padding: 5px;">
                    <div style="color: #333; font-size: 10px;">${item.question_zh}</div>
                    <div style="font-weight: bold; font-size: 11px;">${item.question_es}</div>
                </td>
                <td style="border: 1px solid black; padding: 5px; text-align: center; vertical-align: middle;">
                    <div style="font-weight: bold;">${dayStatus}</div>
                    ${item.day_note ? `<div style="font-style: italic; font-size: 9px; margin-top: 2px;">${item.day_note}</div>` : ''}
                </td>
                <td style="border: 1px solid black; padding: 5px; text-align: center; vertical-align: middle;">
                    <div style="font-weight: bold;">${nightStatus}</div>
                    ${item.night_note ? `<div style="font-style: italic; font-size: 9px; margin-top: 2px;">${item.night_note}</div>` : ''}
                </td>
            </tr>
        `;
    });

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: black; padding: 45px; background: white; width: 210mm; box-sizing: border-box;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0 0 8px 0; font-size: 20px;">排洪井安全、环境、排水生产检查表</h2>
                <h3 style="margin: 0; font-size: 18px;">Lista de verificación ambiental y de seguridad de pozos de inundación</h3>
            </div>
            <div style="margin-bottom: 20px; border: 1px solid black; padding: 12px; background-color: #f8f9fa;">
                <table style="width: 100%; font-size: 13px;">
                    <tr>
                        <td><strong>日期 Fecha:</strong> ${date}</td>
                        <td><strong>白班 Dia:</strong> ${dayPerson}</td>
                        <td><strong>夜班 Noche:</strong> ${nightPerson}</td>
                    </tr>
                </table>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 25px;">
                <thead>
                    <tr style="background-color: #e9ecef;">
                        <th style="border: 1px solid black; padding: 10px; width: 50%;">检查项目 Artículos Marcados</th>
                        <th style="border: 1px solid black; padding: 10px; width: 25%;">白班 Dia</th>
                        <th style="border: 1px solid black; padding: 10px; width: 25%;">夜班 Noche</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <div style="font-size: 12px;">
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; background-color: #e9ecef; padding: 6px; border: 1px solid black; border-bottom: none;">
                        白班备注 Observación:
                    </div>
                    <div style="border: 1px solid black; padding: 10px; min-height: 60px; white-space: pre-wrap;">${dayRemarks}</div>
                </div>
                <div>
                    <div style="font-weight: bold; background-color: #e9ecef; padding: 6px; border: 1px solid black; border-bottom: none;">
                        夜班备注 Observación:
                    </div>
                    <div style="border: 1px solid black; padding: 10px; min-height: 60px; white-space: pre-wrap;">${nightRemarks}</div>
                </div>
            </div>
        </div>
    `;

    const worker = html2pdf().set({
        margin: 0,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    });

    return await worker.from(htmlContent).output('blob');
}

// --- CONSULTA TAB LOGIC ---
let queryResults = [];

async function performQuery() {
    const start = document.getElementById('queryStartDate').value;
    const end = document.getElementById('queryEndDate').value;
    const body = document.getElementById('queryResultsBody');
    const batchBtn = document.getElementById('batchPrintBtn');

    if (!start || !end) {
        alert("Por favor seleccione un rango de fechas.");
        return;
    }

    body.innerHTML = '<tr><td colspan="6" class="text-center">Buscando...</td></tr>';
    batchBtn.disabled = true;

    try {
        const { data, error } = await supabaseClient
            .from('inspections')
            .select('*')
            .gte('inspection_date', start)
            .lte('inspection_date', end)
            .order('inspection_date', { ascending: false })
            .order('version', { ascending: false });

        if (error) throw error;

        queryResults = data || [];
        
        if (queryResults.length === 0) {
            body.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron resultados.</td></tr>';
        } else {
            renderQueryResultTable();
        }
    } catch (err) {
        console.error(err);
        body.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${err.message}</td></tr>`;
    }
}

function renderQueryResultTable() {
    const body = document.getElementById('queryResultsBody');
    body.innerHTML = '';
    
    queryResults.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center"><input type="checkbox" class="record-checkbox" value="${record.id}" onchange="updateBatchButtonState()"></td>
            <td>${record.inspection_date}</td>
            <td>v${record.version}</td>
            <td>${record.day_shift_person || '-'}</td>
            <td>${record.night_shift_person || '-'}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger" onclick="downloadSinglePDF('${record.id}')">
                    PDF
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="loadAndSwitchToVerificacion('${record.id}')">
                    Ver
                </button>
            </td>
        `;
        body.appendChild(row);
    });
    updateBatchButtonState();
}

function toggleSelectAll() {
    const master = document.getElementById('selectAll');
    if (!master) return;
    const checkboxes = document.querySelectorAll('.record-checkbox');
    checkboxes.forEach(cb => cb.checked = master.checked);
    updateBatchButtonState();
}

function updateBatchButtonState() {
    const checkedCount = document.querySelectorAll('.record-checkbox:checked').length;
    const batchBtn = document.getElementById('batchPrintBtn');
    if (batchBtn) {
        batchBtn.disabled = checkedCount === 0;
        batchBtn.innerText = `Descargar Seleccionados (${checkedCount}) (ZIP)`;
    }
}

async function downloadSinglePDF(id) {
    const record = queryResults.find(r => r.id == id);
    if (!record) return;

    try {
        const blob = await generatePDFBlob(record);
        const fileName = `Inspeccion_${record.inspection_date}${record.version ? '_v' + record.version : ''}.pdf`;
        saveAs(blob, fileName);
    } catch (err) {
        console.error(err);
        alert("Error al generar PDF: " + err.message);
    }
}

async function downloadSelectedPDFs() {
    const selectedIds = Array.from(document.querySelectorAll('.record-checkbox:checked')).map(cb => cb.value);
    if (selectedIds.length === 0) return;

    const statusDiv = document.getElementById('queryStatus');
    const progressBar = document.getElementById('queryProgressBar');
    const statusText = document.getElementById('queryStatusText');

    if (statusDiv) statusDiv.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';
    
    try {
        const zip = new JSZip();
        for (let i = 0; i < selectedIds.length; i++) {
            const id = selectedIds[i];
            const record = queryResults.find(r => r.id == id);
            
            const progress = Math.round(((i) / selectedIds.length) * 100);
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (statusText) statusText.innerText = `Procesando: ${record.inspection_date} (${i+1}/${selectedIds.length})`;

            const pdfBlob = await generatePDFBlob(record);
            const fileName = `Inspeccion_${record.inspection_date}${record.version ? '_v' + record.version : ''}.pdf`;
            zip.file(fileName, pdfBlob);
        }

        if (progressBar) progressBar.style.width = '100%';
        if (statusText) statusText.innerText = "Creando ZIP...";
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Lote_Inspecciones_${new Date().toISOString().split('T')[0]}.zip`);
        
        if (statusText) statusText.innerText = "¡Descarga completa!";
        setTimeout(() => { if (statusDiv) statusDiv.style.display = 'none'; }, 2000);
    } catch (err) {
        console.error(err);
        alert("Error en proceso por lote: " + err.message);
        if (statusDiv) statusDiv.style.display = 'none';
    }
}

function loadAndSwitchToVerificacion(id) {
    const record = queryResults.find(r => r.id == id);
    if (!record) return;

    // 1. Set the date
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.value = record.inspection_date;
    
    // 2. Load the specific version for that date
    loadDataByDate().then(() => {
        loadSpecificVersion(record.id);
        
        // 3. Switch tab
        const tabEl = document.querySelector('#verificacion-tab');
        if (tabEl) {
            const tab = new bootstrap.Tab(tabEl);
            tab.show();
        }
    });
}