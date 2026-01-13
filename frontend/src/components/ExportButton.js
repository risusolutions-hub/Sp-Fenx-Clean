import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { exportToCSV, exportToJSON, exportToExcel, exportToPDF, generateFileName } from '../utils/exportUtils';

export default function ExportButton({ 
  data = [], 
  filename = 'export',
  title = 'Export Data',
  columns = null,
  compact = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const fileName = generateFileName(filename);
      
      switch (format) {
        case 'csv':
          exportToCSV(data, `${fileName}.csv`, columns);
          break;
        case 'json':
          exportToJSON(data, `${fileName}.json`);
          break;
        case 'excel':
          await exportToExcel(data, `${fileName}.xlsx`);
          break;
        case 'pdf':
          await exportToPDF(data, `${fileName}.pdf`, title);
          break;
        default:
          break;
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 first:rounded-t last:rounded-b"
            >
              <FileText className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <File className="w-4 h-4" /> JSON
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 last:rounded-b"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Download className="w-5 h-5" />
        Export Options
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleExport('csv')}
          disabled={isExporting || data.length === 0}
          className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
        >
          <FileText className="w-6 h-6 text-blue-600 mb-2" />
          <span className="text-xs font-medium text-slate-900">CSV</span>
          <span className="text-[10px] text-slate-500 mt-1">Spreadsheet</span>
        </button>

        <button
          onClick={() => handleExport('excel')}
          disabled={isExporting || data.length === 0}
          className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
        >
          <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-2" />
          <span className="text-xs font-medium text-slate-900">Excel</span>
          <span className="text-[10px] text-slate-500 mt-1">XLSX Format</span>
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={isExporting || data.length === 0}
          className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
        >
          <File className="w-6 h-6 text-amber-600 mb-2" />
          <span className="text-xs font-medium text-slate-900">JSON</span>
          <span className="text-[10px] text-slate-500 mt-1">Data Format</span>
        </button>

        <button
          onClick={() => handleExport('pdf')}
          disabled={isExporting || data.length === 0}
          className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
        >
          <FileText className="w-6 h-6 text-rose-600 mb-2" />
          <span className="text-xs font-medium text-slate-900">PDF</span>
          <span className="text-[10px] text-slate-500 mt-1">Document</span>
        </button>
      </div>

      {data.length === 0 && (
        <p className="text-xs text-slate-500 text-center mt-4">No data available to export</p>
      )}
    </div>
  );
}
