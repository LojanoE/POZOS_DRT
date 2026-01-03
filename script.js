async function generarPDF() {
    const { jsPDF } = window.jspdf;

    // 1. Sincronizar datos del formulario a la "Hoja PDF"
    document.getElementById('out-nombre').innerText = document.getElementById('nombre').value;
    document.getElementById('out-fecha').innerText = document.getElementById('fecha').value;
    document.getElementById('out-descripcion').innerText = document.getElementById('descripcion').value;

    // 2. Capturar el div como imagen
    const elemento = document.getElementById('pdf-content');
    
    const canvas = await html2canvas(elemento, {
        scale: 2, // Mejor resolución
    });

    const imgData = canvas.toDataURL('image/png');
    
    // 3. Crear el PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("Hoja_Uno_Completada.pdf");
}