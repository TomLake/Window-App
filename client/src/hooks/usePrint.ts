import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Window } from '@shared/schema';

export function usePrint() {
  // Create a reference to the element containing the windows
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!printRef.current) return;

    try {
      // Create a new PDF document in landscape orientation
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15; // 15mm margin
      
      // Get project name from page
      const projectNameElement = document.querySelector('.text-lg.font-medium');
      const projectName = projectNameElement?.textContent?.replace('Window Design - ', '') || 'Window Design';
      
      // Add a title to the PDF
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text(projectName, pageWidth / 2, margin, { align: 'center' });
      
      // Get all individual window divs
      const windowContainers = document.querySelectorAll('.mb-16.inline-block');
      
      if (windowContainers.length === 0) {
        alert('No windows found to export. Please add at least one window to your project.');
        return;
      }

      // Calculate layout
      const numWindows = windowContainers.length;
      let rows = 1, cols = 1;
      
      if (numWindows === 2) {
        cols = 2;
      } else if (numWindows <= 4) {
        rows = 2;
        cols = 2;
      } else if (numWindows <= 6) {
        rows = 2;
        cols = 3;
      } else {
        rows = 3;
        cols = 3;
      }
      
      // Set up pagination if needed
      const windowsPerPage = rows * cols;
      const totalPages = Math.ceil(numWindows / windowsPerPage);
      
      // Available space calculations
      const titleHeight = 20;
      const footerHeight = 10;
      const windowSpacing = 10;
      const windowLabelHeight = 10;
      
      const availableContentWidth = pageWidth - (margin * 2);
      const availableContentHeight = pageHeight - margin - titleHeight - footerHeight - margin;
      
      const maxWindowWidth = (availableContentWidth - ((cols-1) * windowSpacing)) / cols;
      const maxWindowHeight = (availableContentHeight - ((rows-1) * windowSpacing) - (rows * windowLabelHeight)) / rows;
      
      // Process windows page by page
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        // Add a new page if not the first page
        if (pageNum > 0) {
          pdf.addPage('landscape');
          // Add title to new page
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(16);
          pdf.text(`${projectName} (${pageNum + 1}/${totalPages})`, pageWidth / 2, margin, { align: 'center' });
        } else if (totalPages > 1) {
          // Update first page title with page count
          pdf.text(`${projectName} (1/${totalPages})`, pageWidth / 2, margin, { align: 'center' });
        }
        
        // Process windows for this page
        for (let i = 0; i < windowsPerPage; i++) {
          const windowIndex = pageNum * windowsPerPage + i;
          if (windowIndex >= numWindows) break;
          
          const windowContainer = windowContainers[windowIndex] as HTMLElement;
          const windowSvg = windowContainer.querySelector('.window-drawing-svg');
          
          if (!windowSvg) continue;
          
          // Get window name
          const windowName = windowContainer.querySelector('.dimension-text[font-weight="bold"]')?.textContent || `Window ${windowIndex + 1}`;
          
          // Calculate position in grid
          const row = Math.floor(i / cols);
          const col = i % cols;
          
          // Calculate position on page
          const xPos = margin + (col * (maxWindowWidth + windowSpacing));
          const yPos = margin + titleHeight + (row * (maxWindowHeight + windowSpacing + windowLabelHeight));

          // Capture the SVG as canvas
          const canvas = await html2canvas(windowSvg as HTMLElement, {
            backgroundColor: '#FFFFFF',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
          });
          
          // Calculate scaling to fit within grid cell
          const originalWidth = canvas.width;
          const originalHeight = canvas.height;
          const widthRatio = maxWindowWidth / originalWidth;
          const heightRatio = maxWindowHeight / originalHeight;
          const scale = Math.min(widthRatio, heightRatio);
          
          const scaledWidth = originalWidth * scale;
          const scaledHeight = originalHeight * scale;
          
          // Center in grid cell
          const centeredX = xPos + ((maxWindowWidth - scaledWidth) / 2);
          const centeredY = yPos + ((maxWindowHeight - scaledHeight) / 2);
          
          // Add image to PDF
          pdf.addImage(
            canvas.toDataURL('image/png'), 
            'PNG', 
            centeredX, 
            centeredY, 
            scaledWidth, 
            scaledHeight
          );
          
          // Add window name below image
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.text(
            windowName, 
            xPos + maxWindowWidth / 2, 
            centeredY + scaledHeight + 7, 
            { align: 'center' }
          );
        }
        
        // Add footer with date
        const today = new Date();
        const dateStr = today.toLocaleDateString();
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(`Generated on ${dateStr}`, margin, pageHeight - 5);
      }
      
      // Save the PDF
      pdf.save(`${projectName.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return { printRef, handlePrint };
}
