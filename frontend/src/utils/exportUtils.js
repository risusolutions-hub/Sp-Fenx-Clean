// Export utilities for CSV, Excel, and PDF
export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Use provided columns or extract from first object
  const keys = columns || Object.keys(data[0]);
  
  // Create CSV header
  const csvContent = [
    keys.join(','),
    ...data.map(row =>
      keys.map(key => {
        const value = key.split('.').reduce((obj, k) => obj?.[k], row) || '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
};

export const exportToJSON = (data, filename = 'export.json') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadFile(blob, filename);
};

export const exportToExcel = async (data, filename = 'export.xlsx', sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    // Dynamically import xlsx library if not already loaded
    const XLSX = await import('xlsx');
    
    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Write file
    XLSX.writeFile(wb, filename);
  } catch (error) {
    alert('Please install xlsx library: npm install xlsx');
    console.error('Excel export error:', error);
  }
};

export const exportToPDF = async (data, filename = 'export.pdf', title = 'Report') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    const jsPDF = await import('jspdf');
    const autoTable = await import('jspdf-autotable');

    const doc = new jsPDF.jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

    // Get table columns
    const columns = Object.keys(data[0]);
    const rows = data.map(row =>
      columns.map(col => {
        const value = col.split('.').reduce((obj, k) => obj?.[k], row) || '';
        return String(value).substring(0, 50); // Limit cell content
      })
    );

    // Add table
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 35,
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 20 } }
    });

    // Save
    doc.save(filename);
  } catch (error) {
    alert('Please install PDF libraries: npm install jspdf jspdf-autotable');
    console.error('PDF export error:', error);
  }
};

const downloadFile = (blob, filename) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateFileName = (prefix = 'export') => {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${prefix}-${timestamp}`;
};
