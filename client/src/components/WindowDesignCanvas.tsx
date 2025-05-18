import { forwardRef, useRef } from "react";
import WindowDrawing from "@/components/WindowDrawing";
import type { Window } from "@shared/schema";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface WindowDesignCanvasProps {
  windows: Window[];
  projectName: string;
}

const WindowDesignCanvas = forwardRef<HTMLDivElement, WindowDesignCanvasProps>(
  ({ windows, projectName }, ref) => {
    const { toast } = useToast();
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    
    // Handle PDF export of all windows
    const handleExportPDF = async () => {
      if (!canvasContainerRef.current || windows.length === 0) return;
      
      try {
        // Create a new PDF document in landscape orientation
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15; // 15mm margin
        
        // Add a title to the PDF
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text(`Window Design - ${projectName}`, pageWidth / 2, margin, { align: 'center' });
        
        // Get the drawing area element
        const drawingArea = canvasContainerRef.current;
        if (!drawingArea) return;
        
        // Capture the drawing area
        const canvas = await html2canvas(drawingArea, {
          backgroundColor: '#FFFFFF',
          scale: 2, // Higher resolution
          logging: false,
          useCORS: true,
          // Remove any UI elements from the capture
          onclone: (document) => {
            const clonedEl = document.querySelector('.border.border-gray-200.bg-gray-50') as HTMLElement;
            if (clonedEl) {
              // Make background white for PDF
              clonedEl.style.backgroundColor = 'white';
            }
          }
        });
        
        // Calculate scaling to fit on the page
        const contentWidth = pageWidth - (margin * 2);
        const contentHeight = pageHeight - (margin * 2) - 15; // 15mm for the title
        
        const imageRatio = canvas.width / canvas.height;
        const pageRatio = contentWidth / contentHeight;
        
        let finalWidth, finalHeight;
        
        if (imageRatio > pageRatio) {
          // Image is wider than the page ratio
          finalWidth = contentWidth;
          finalHeight = contentWidth / imageRatio;
        } else {
          // Image is taller than the page ratio
          finalHeight = contentHeight;
          finalWidth = contentHeight * imageRatio;
        }
        
        // Center the image on the page
        const xPosition = margin + (contentWidth - finalWidth) / 2;
        const yPosition = margin + 15; // Below the title
        
        // Add the image to the PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', xPosition, yPosition, finalWidth, finalHeight);
        
        // Add timestamp at the bottom
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        const dateStr = new Date().toLocaleString();
        pdf.text(`Generated on ${dateStr}`, margin, pageHeight - 5);
        
        // Save the PDF
        pdf.save(`${projectName.replace(/\s+/g, '_')}_windows.pdf`);
        
        toast({
          title: "PDF Exported",
          description: "All windows have been exported to PDF",
        });
      } catch (error) {
        console.error('Error exporting PDF:', error);
        toast({
          title: "Export Failed",
          description: "Failed to export windows to PDF",
          variant: "destructive"
        });
      }
    };
    
    return (
      <main className="flex-1 bg-background overflow-auto relative p-6" ref={ref}>
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">Window Design - {projectName}</h2>
            <div className="flex space-x-2">
              {windows.length > 0 && (
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-700 rounded-md flex items-center space-x-1 hover:bg-blue-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <span>Export PDF</span>
                </button>
              )}
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md flex items-center space-x-1 hover:bg-gray-50">
                <span className="material-icons text-sm">zoom_in</span>
                <span>Zoom</span>
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md flex items-center space-x-1 hover:bg-gray-50">
                <span className="material-icons text-sm">grid_on</span>
                <span>Grid</span>
              </button>
            </div>
          </div>
          
          <div 
            ref={canvasContainerRef}
            className="border border-gray-200 bg-gray-50 rounded-md min-h-[800px] p-8 relative"
          >
            {windows.map((window) => (
              <WindowDrawing key={window.id} window={window} />
            ))}
            
            {windows.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-8 flex items-center justify-center mt-4" style={{ height: '240px' }}>
                <div className="text-center text-gray-500">
                  <span className="material-icons text-4xl mb-2">add_box</span>
                  <p>Add a window using the form on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }
);

WindowDesignCanvas.displayName = "WindowDesignCanvas";

export default WindowDesignCanvas;
