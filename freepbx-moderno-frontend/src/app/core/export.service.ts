// src/app/core/export.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exporta datos a CSV
   */
  exportToCSV(data: any[], filename: string, headers: string[]) {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Crear contenido CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => this.escapeCSVRow(row))
    ].join('\n');

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta datos a JSON
   */
  exportToJSON(data: any[], filename: string) {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  /**
   * Exporta tabla HTML a Excel (formato compatible)
   */
  exportToExcel(data: any[], filename: string, headers: string[]) {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Crear HTML table
    let html = '<table>';
    
    // Headers
    html += '<thead><tr>';
    headers.forEach(header => {
      html += `<th>${header}</th>`;
    });
    html += '</tr></thead>';
    
    // Body
    html += '<tbody>';
    data.forEach(row => {
      html += '<tr>';
      row.forEach((cell: any) => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';

    this.downloadFile(html, `${filename}.xls`, 'application/vnd.ms-excel');
  }

  /**
   * Copia datos al clipboard
   */
  copyToClipboard(data: string): boolean {
    try {
      navigator.clipboard.writeText(data);
      return true;
    } catch (err) {
      console.error('Error al copiar al clipboard:', err);
      return false;
    }
  }

  /**
   * Helper: Escapar fila CSV
   */
  private escapeCSVRow(row: any[]): string {
    return row.map(cell => {
      if (cell === null || cell === undefined) return '';
      
      const cellStr = String(cell);
      
      // Si contiene coma, comilla o salto de línea, encerrar entre comillas
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      
      return cellStr;
    }).join(',');
  }

  /**
   * Helper: Descargar archivo
   */
  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Helper: Formatear fecha para export
   */
  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES');
  }

  /**
   * Helper: Formatear hora para export
   */
  formatTime(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('es-ES');
  }
}