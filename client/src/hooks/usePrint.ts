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
      // Create a new PDF document, A4 size in portrait
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20; // 20mm margin
      const contentWidth = pageWidth - (margin * 2);
      
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

      let yPosition = margin + 10; // Start position after title
      
      // Process each window drawing and add it to the PDF
      for (let i = 0; i < windowElements.length; i++) {
        const element = windowElements[i] as HTMLElement;
        
        // Use html2canvas to capture the SVG
        const canvas = await html2canvas(element, {
          backgroundColor: '#FFFFFF',
          scale: 2, // Higher scale for better quality
          logging: false,
          useCORS: true
        });
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions to fit within the page width
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if this window will fit on the current page, otherwise add a new page
        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        
        // Update position for the next window with some spacing
        yPosition += imgHeight + 15;
      }
      
      // Add creation date at the bottom of the last page
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Generated on ${dateStr}`, margin, pageHeight - 10);
      
      // Save the PDF
      pdf.save(`${projectName.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return { printRef, handlePrint };
}
