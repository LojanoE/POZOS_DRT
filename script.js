// --- APPLICATION VERSIONING ---
const APP_VERSION = '1.8.1'; // Added 'Gráfica de Niveles' tab with Chart.js

let levelChartInstance = null;

function initVersion() {
    document.querySelectorAll('.app-version-text').forEach(el => {
        el.innerText = APP_VERSION;
    });
}

function forceUpdate() {
    if (confirm("Se forzará la recarga de la aplicación para obtener la última versión. ¿Continuar?")) {
        window.location.reload(true);
    }
}

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
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('username', user)
            .maybeSingle();

        if (error) throw error;

        if (data && data.password === pass) {
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            loadDataByDate();
        } else {
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

document.addEventListener('DOMContentLoaded', () => {
    const loginPass = document.getElementById('loginPass');
    if (loginPass) {
        loginPass.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') performLogin();
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
        es: "Si la basura se pone in la bolsa and si la basura de turno se retira en cada turno.",
        id: "q6"
    },
    {
        zh: "排洪井安全设施是否正常（安全网，安全钢绳）",
        es: "Si las instalaciones de seguridad de los pozos de descarga de inundación son normales (red segura, cuerda de acero de seguridad)",
        id: "q7"
    }
];

let currentDayRecords = [];

document.addEventListener('DOMContentLoaded', () => {
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

    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
        dateInput.addEventListener('change', loadDataByDate);
    }
});

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

        if (error) throw error;
        currentDayRecords = data || [];

        const { data: pumpData, error: pumpError } = await supabaseClient
            .from('pump_records')
            .select('*')
            .eq('inspection_date', date)
            .maybeSingle();

        if (pumpError) console.error(pumpError);
        else loadPumpFields(pumpData);

        if (currentDayRecords.length > 0) loadSpecificVersion(currentDayRecords[0].id);
        else clearFormDataOnly();
    } catch (err) {
        console.error(err);
    }
}

function loadPumpFields(data) {
    const fields = ['day_pump_open', 'day_pump_close', 'day_water_level_before', 'day_water_level_after', 'day_mud_level',
                  'night_pump_open', 'night_pump_close', 'night_water_level_before', 'night_water_level_after', 'night_mud_level'];
    fields.forEach(f => {
        const el = document.getElementById(f);
        if (el) el.value = (data && data[f]) ? data[f] : '';
    });
}

function loadSpecificVersion(id) {
    const data = currentDayRecords.find(r => r.id == id);
    if (!data) return;
    document.getElementById('currentRecordId').value = data.id;
    document.getElementById('dayShiftPerson').value = data.day_shift_person || '';
    document.getElementById('nightShiftPerson').value = data.night_shift_person || '';
    document.getElementById('dayRemarks').value = data.day_remarks || '';
    document.getElementById('nightRemarks').value = data.night_remarks || '';

    const checklist = data.checklist_data || [];
    checklist.forEach(item => {
        const ds = document.querySelector(`[name="day_${item.id}"]`);
        const dn = document.querySelector(`[name="day_note_${item.id}"]`);
        const ns = document.querySelector(`[name="night_${item.id}"]`);
        const nn = document.querySelector(`[name="night_note_${item.id}"]`);
        if (ds) ds.value = item.day_status || '';
        if (dn) dn.value = item.day_note || '';
        if (ns) ns.value = item.night_status || '';
        if (nn) nn.value = item.night_note || '';
    });
}

function clearFormDataOnly() {
    const crId = document.getElementById('currentRecordId');
    if (crId) crId.value = '';
    document.getElementById('dayShiftPerson').value = '';
    document.getElementById('nightShiftPerson').value = '';
    document.getElementById('dayRemarks').value = '';
    document.getElementById('nightRemarks').value = '';
    document.querySelectorAll('#checklistBody select, #checklistBody input').forEach(el => el.value = '');
    loadPumpFields(null);
}

function clearForm() {
    if(confirm('¿Borrar todo el formulario?')) {
        const form = document.getElementById('inspectionForm');
        if (form) form.reset();
        document.getElementById('date').valueAsDate = new Date();
        loadDataByDate();
    }
}

async function saveToDatabase(silent = false) {
    const btn = document.querySelector('button[onclick="saveToDatabase()"]');
    const originalText = btn ? btn.innerText : '';
    if(btn) { btn.innerText = "Guardando..."; btn.disabled = true; }

    try {
        const checklistData = checklistItems.map(item => ({
            id: item.id,
            question_zh: item.zh,
            question_es: item.es,
            day_status: document.querySelector(`[name="day_${item.id}"]`).value,
            day_note: document.querySelector(`[name="day_note_${item.id}"]`).value,
            night_status: document.querySelector(`[name="night_${item.id}"]`).value,
            night_note: document.querySelector(`[name="night_note_${item.id}"]`).value
        }));

        const inspectionDate = document.getElementById('date').value;
        const currentRecordId = document.getElementById('currentRecordId').value;

        const payload = {
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

        const pumpPayload = { inspection_date: inspectionDate };
        ['day_pump_open', 'day_pump_close', 'day_water_level_before', 'day_water_level_after', 'day_mud_level',
         'night_pump_open', 'night_pump_close', 'night_water_level_before', 'night_water_level_after', 'night_mud_level'].forEach(f => {
            const el = document.getElementById(f);
            if (el) {
                const val = el.value;
                pumpPayload[f] = val === '' ? null : val;
            }
        });

        const { error: pumpError } = await supabaseClient.from('pump_records').upsert(pumpPayload, { onConflict: 'inspection_date' });
        if (pumpError) throw pumpError;

        if(!silent) alert('¡Datos guardados exitosamente!');
        await loadDataByDate();
        return true;
    } catch (error) {
        console.error(error);
        alert('Error: ' + error.message);
        return false;
    } finally {
        if(btn) { btn.innerText = originalText; btn.disabled = false; }
    }
}

async function exportToPDF() {
    const saved = await saveToDatabase(true); 
    if (!saved && !confirm("No se pudo guardar. ¿Generar PDF de todos modos?")) return;

    const date = document.getElementById('date').value;
    const dayPerson = document.getElementById('dayShiftPerson').value || '-';
    const nightPerson = document.getElementById('nightShiftPerson').value || '-';
    const dayRemarks = document.getElementById('dayRemarks').value || '-';
    const nightRemarks = document.getElementById('nightRemarks').value || '-';

    let tableRows = '';
    checklistItems.forEach(item => {
        const ds = document.querySelector(`[name="day_${item.id}"]`).value;
        const dn = document.querySelector(`[name="day_note_${item.id}"]`).value;
        const ns = document.querySelector(`[name="night_${item.id}"]`).value;
        const nn = document.querySelector(`[name="night_note_${item.id}"]`).value;

        const fmt = (v) => v === 'OK' ? '√ (SI)' : (v === 'X' ? 'X (NO)' : (v === 'NA' ? 'N/A' : '-'));
        tableRows += `
            <tr>
                <td style="border: 1px solid black; padding: 5px;">
                    <div style="font-size: 10px;">${item.zh}</div>
                    <div style="font-weight: bold; font-size: 11px;">${item.es}</div>
                </td>
                <td style="border: 1px solid black; padding: 5px; text-align: center;">
                    <div style="font-weight: bold;">${fmt(ds)}</div>
                    ${dn ? `<div style="font-size: 9px; margin-top: 2px;">${dn}</div>` : ''}
                </td>
                <td style="border: 1px solid black; padding: 5px; text-align: center;">
                    <div style="font-weight: bold;">${fmt(ns)}</div>
                    ${nn ? `<div style="font-size: 9px; margin-top: 2px;">${nn}</div>` : ''}
                </td>
            </tr>`;
    });

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 45px; background: white; width: 210mm; box-sizing: border-box;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0; font-size: 18px;">排洪井安全、环境、排水生产检查表</h2>
                <h3 style="margin: 0; font-size: 16px;">Lista de verificación ambiental y de seguridad de pozos de inundación</h3>
            </div>
            <div style="margin-bottom: 20px; border: 1px solid black; padding: 10px;">
                <table style="width: 100%; font-size: 12px;">
                    <tr><td><strong>Fecha:</strong> ${date}</td><td><strong>Día:</strong> ${dayPerson}</td><td><strong>Noche:</strong> ${nightPerson}</td></tr>
                </table>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;">
                <thead style="background: #eee;">
                    <tr><th style="border: 1px solid black; padding: 8px;">Artículos</th><th style="border: 1px solid black;">Día</th><th style="border: 1px solid black;">Noche</th></tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            <div style="font-size: 11px;">
                <div style="margin-bottom: 10px; border: 1px solid black; padding: 5px;"><strong>Obs. Día:</strong> ${dayRemarks}</div>
                <div style="border: 1px solid black; padding: 5px;"><strong>Obs. Noche:</strong> ${nightRemarks}</div>
            </div>
        </div>`;

    const opt = { margin: 0, filename: `Inspeccion_${date}.pdf`, image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    html2pdf().set(opt).from(html).save();
}

async function exportRangeToZip() {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const statusDiv = document.getElementById('exportStatus');
    const progressBar = document.getElementById('exportProgressBar');
    const statusText = document.getElementById('exportStatusText');

    if (!start || !end) return alert("Seleccione fechas.");
    
    statusDiv.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.innerText = "Consultando...";

    try {
        const { data, error } = await supabaseClient.from('inspections').select('*').gte('inspection_date', start).lte('inspection_date', end).order('inspection_date', { ascending: true });
        if (error) throw error;
        if (!data.length) {
            alert("Sin registros.");
            statusDiv.style.display = 'none';
            return;
        }

        const zip = new JSZip();
        for (let i = 0; i < data.length; i++) {
            const progress = Math.round(((i) / data.length) * 100);
            progressBar.style.width = `${progress}%`;
            statusText.innerText = `Procesando: ${data[i].inspection_date} (${i+1}/${data.length})`;
            const pdfBlob = await generatePDFBlob(data[i]);
            zip.file(`Inspeccion_${data[i].inspection_date}_v${data[i].version}.pdf`, pdfBlob);
        }
        
        statusText.innerText = "Empaquetando ZIP...";
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Inspecciones_${start}_${end}.zip`);
        statusText.innerText = "¡Listo!";
        setTimeout(() => { statusDiv.style.display = 'none'; }, 2000);
    } catch (err) { console.error(err); alert(err.message); statusDiv.style.display = 'none'; }
}

async function generatePDFBlob(data) {
    const tableRows = (data.checklist_data || []).map(item => {
        const fmt = (v) => v === 'OK' ? '√ (SI)' : (v === 'X' ? 'X (NO)' : (v === 'NA' ? 'N/A' : '-'));
        return `
            <tr>
                <td style="border: 1px solid black; padding: 5px;">
                    <div style="font-size: 10px;">${item.question_zh}</div>
                    <div style="font-weight: bold; font-size: 11px;">${item.question_es}</div>
                </td>
                <td style="border: 1px solid black; padding: 5px; text-align: center;">
                    <div style="font-weight: bold;">${fmt(item.day_status)}</div>
                    ${item.day_note ? `<div style="font-size: 9px; margin-top: 2px;">${item.day_note}</div>` : ''}
                </td>
                <td style="border: 1px solid black; padding: 5px; text-align: center;">
                    <div style="font-weight: bold;">${fmt(item.night_status)}</div>
                    ${item.night_note ? `<div style="font-size: 9px; margin-top: 2px;">${item.night_note}</div>` : ''}
                </td>
            </tr>`;
    }).join('');

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 45px; background: white; width: 210mm; box-sizing: border-box;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0; font-size: 18px;">排洪井安全、环境、排水生产检查表</h2>
                <h3 style="margin: 0; font-size: 16px;">Lista de verificación ambiental y de seguridad de pozos de inundación</h3>
            </div>
            <div style="margin-bottom: 20px; border: 1px solid black; padding: 10px;">
                <table style="width: 100%; font-size: 12px;">
                    <tr><td><strong>Fecha:</strong> ${data.inspection_date}</td><td><strong>Día:</strong> ${data.day_shift_person || '-'}</td><td><strong>Noche:</strong> ${data.night_shift_person || '-'}</td></tr>
                </table>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;">
                <thead style="background: #eee;">
                    <tr><th style="border: 1px solid black; padding: 8px;">Artículos</th><th style="border: 1px solid black;">Día</th><th style="border: 1px solid black;">Noche</th></tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            <div style="font-size: 11px;">
                <div style="margin-bottom: 10px; border: 1px solid black; padding: 5px;"><strong>Obs. Día:</strong> ${data.day_remarks || '-'}</div>
                <div style="border: 1px solid black; padding: 5px;"><strong>Obs. Noche:</strong> ${data.night_remarks || '-'}</div>
            </div>
        </div>`;

    const worker = html2pdf().set({
        margin: 0,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    });
    return await worker.from(html).output('blob');
}

let queryResults = [];
async function performQuery() {
    const start = document.getElementById('queryStartDate').value;
    const end = document.getElementById('queryEndDate').value;
    if (!start || !end) return alert("Seleccione fechas.");

    try {
        const { data, error } = await supabaseClient.from('inspections').select('*').gte('inspection_date', start).lte('inspection_date', end).order('inspection_date', { ascending: false });
        if (error) throw error;
        queryResults = data || [];
        const body = document.getElementById('queryResultsBody');
        body.innerHTML = '';
        queryResults.forEach(r => {
            const row = document.createElement('tr');
            row.innerHTML = `<td><input type="checkbox" class="record-checkbox" value="${r.id}"></td><td>${r.inspection_date}</td><td>v${r.version}</td><td>${r.day_shift_person || '-'}</td><td>${r.night_shift_person || '-'}</td><td><button class="btn btn-sm btn-outline-primary" onclick="loadAndSwitchToVerificacion('${r.id}')">Ver</button></td>`;
            body.appendChild(row);
        });
    } catch (err) { alert(err.message); }
}

function toggleSelectAll() {
    const master = document.getElementById('selectAll');
    document.querySelectorAll('.record-checkbox').forEach(cb => cb.checked = master.checked);
}

function loadAndSwitchToVerificacion(id) {
    const r = queryResults.find(x => x.id == id);
    if (!r) return;
    document.getElementById('date').value = r.inspection_date;
    loadDataByDate().then(() => {
        loadSpecificVersion(r.id);
        const tabEl = document.querySelector('#verificacion-tab');
        const tab = new bootstrap.Tab(tabEl);
        tab.show();
    });
}

async function loadPumpRecordsReport() {
    const start = document.getElementById('pumpStartDate').value;
    const end = document.getElementById('pumpEndDate').value;
    const body = document.getElementById('pumpReportBody');
    if (!start || !end) return alert("Seleccione fechas.");

    body.innerHTML = '<tr><td colspan="11" class="text-center">Buscando...</td></tr>';
    try {
        const { data, error } = await supabaseClient.from('pump_records').select('*').gte('inspection_date', start).lte('inspection_date', end).order('inspection_date', { ascending: false });
        if (error) throw error;
        body.innerHTML = '';
        if (!data.length) body.innerHTML = '<tr><td colspan="11" class="text-center">Sin datos</td></tr>';
        else data.forEach(r => {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="text-center fw-bold">${r.inspection_date}</td><td>${r.day_pump_open || '-'}</td><td>${r.day_pump_close || '-'}</td><td>${r.day_water_level_before || '-'}</td><td>${r.day_water_level_after || '-'}</td><td>${r.day_mud_level || '-'}</td><td class="bg-dark text-white">${r.night_pump_open || '-'}</td><td class="bg-dark text-white">${r.night_pump_close || '-'}</td><td class="bg-dark text-white">${r.night_water_level_before || '-'}</td><td class="bg-dark text-white">${r.night_water_level_after || '-'}</td><td class="bg-dark text-white">${r.night_mud_level || '-'}</td>`;
            body.appendChild(row);
        });
    } catch (err) { alert(err.message); }
}

async function renderWaterLevelChart() {
    const start = document.getElementById('chartStartDate').value;
    const end = document.getElementById('chartEndDate').value;
    const canvas = document.getElementById('waterLevelChart');
    if (!start || !end || !canvas) return alert("Seleccione fechas.");
    
    const ctx = canvas.getContext('2d');

    try {
        const { data, error } = await supabaseClient.from('pump_records').select('inspection_date, day_water_level_after, night_water_level_after').gte('inspection_date', start).lte('inspection_date', end).order('inspection_date', { ascending: true });
        if (error) throw error;
        if (!data.length) return alert("Sin datos.");

        const labels = data.map(r => r.inspection_date);
        const dayLevels = data.map(r => r.day_water_level_after);
        const nightLevels = data.map(r => r.night_water_level_after);

        if (levelChartInstance) levelChartInstance.destroy();

        levelChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Nivel Día (m)',
                        data: dayLevels,
                        borderColor: '#0dcaf0',
                        backgroundColor: 'rgba(13, 202, 240, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        spanGaps: true
                    },
                    {
                        label: 'Nivel Noche (m)',
                        data: nightLevels,
                        borderColor: '#212529',
                        backgroundColor: 'rgba(33, 37, 41, 0.05)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        spanGaps: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { title: { display: true, text: 'Elevación (m)' } },
                    x: { title: { display: true, text: 'Fecha' } }
                }
            }
        });
    } catch (err) { console.error(err); alert(err.message); }
}
