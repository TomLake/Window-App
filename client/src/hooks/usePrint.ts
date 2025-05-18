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
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      // Add a title to the PDF
      const projectName = document.querySelector('.text-lg.font-medium')?.textContent || 'Window Design';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text(projectName, pageWidth / 2, margin, { align: 'center' });
      
      // Get all window drawing elements
      const windowElements = printRef.current.querySelectorAll('.mb-16.inline-block');
      
      if (windowElements.length === 0) {
        console.warn('No window elements found');
        return;
      }

      // Calculate optimal layout to fit all windows on one page
      const numWindows = windowElements.length;
      
      // Determine grid dimensions based on number of windows
      let cols = Math.ceil(Math.sqrt(numWindows));
      let rows = Math.ceil(numWindows / cols);
      
      // For better layout with few windows
      if (numWindows <= 2) cols = numWindows;
      if (numWindows <= 4) cols = 2;
      
      // Calculate available space for each window
      const titleSpace = 15; // Space for title
      const footerSpace = 10; // Space for footer
      const spacing = 10; // Space between windows
      
      const availableHeight = contentHeight - titleSpace - footerSpace;
      const availableWidth = contentWidth;
      
      const maxWindowWidth = (availableWidth - (spacing * (cols - 1))) / cols;
      const maxWindowHeight = (availableHeight - (spacing * (rows - 1))) / rows;
      
      // Capture all windows as canvases
      const windowCanvases = [];
      for (let i = 0; i < windowElements.length; i++) {
        const element = windowElements[i] as HTMLElement;
        const canvas = await html2canvas(element, {
          backgroundColor: '#FFFFFF',
          scale: 2, // Higher scale for better quality
          logging: false,
          useCORS: true
        });
        windowCanvases.push(canvas);
      }
      
      // Calculate scale factor for each window to fit in the grid
      const scaledWindows = windowCanvases.map(canvas => {
        const aspectRatio = canvas.width / canvas.height;
        
        let width, height;
        if (aspectRatio > maxWindowWidth / maxWindowHeight) {
          // Width constrained
          width = maxWindowWidth;
          height = width / aspectRatio;
        } else {
          // Height constrained
          height = maxWindowHeight;
          width = height * aspectRatio;
        }
        
        return {
          canvas,
          width,
          height
        };
      });
      
      // Place windows on the PDF
      let currentRow = 0;
      let currentCol = 0;
      
      scaledWindows.forEach((item, i) => {
        // Convert canvas to image
        const imgData = item.canvas.toDataURL('image/png');
        
        // Calculate position for this window
        const xPos = margin + (currentCol * (maxWindowWidth + spacing));
        const yPos = margin + titleSpace + (currentRow * (maxWindowHeight + spacing));
        
        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', xPos, yPos, item.width, item.height);
        
        // Get window info for label
        const windowName = (windowElements[i] as HTMLElement).querySelector('.dimension-text.font-medium')?.textContent || '';
        
        // Add window name under the drawing if there's space
        if (windowName) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(windowName, xPos + (item.width / 2), yPos + item.height + 5, { align: 'center' });
        }
        
        // Update position for next window
        currentCol++;
        if (currentCol >= cols) {
          currentCol = 0;
          currentRow++;
        }
      });
      
      // Add creation date at the bottom of the page
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(`Generated on ${dateStr}`, margin, pageHeight - 5);
      
      // Save the PDF
      pdf.save(`${projectName.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return { printRef, handlePrint };
}
