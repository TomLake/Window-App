import { forwardRef, useRef, useState } from "react";
import WindowDrawing from "@/components/WindowDrawing";
import CostEstimator from "@/components/CostEstimator";
import ProjectImportExport from "@/components/ProjectImportExport";
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
    const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh after import
    
    // Handle PDF export of all windows in a grid layout
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
        
        // Available content area dimensions (accounting for margins and title space)
        const contentWidth = pageWidth - (margin * 2);
        const contentHeight = pageHeight - (margin * 2) - 15; // 15mm for the title
        
        // Calculate optimal grid layout based on window count
        const windowCount = windows.length;
        
        // Determine the grid dimensions (columns and rows)
        let cols = Math.ceil(Math.sqrt(windowCount));
        let rows = Math.ceil(windowCount / cols);
        
        // Adjust grid if the aspect ratio is very different from the page
        if (pageWidth / pageHeight > 1.5) {
          // Landscape orientation - favor more columns
          cols = Math.min(Math.ceil(Math.sqrt(windowCount * 1.5)), 5);  
          rows = Math.ceil(windowCount / cols);
        }
        
        // Calculate individual window box dimensions
        const boxWidth = contentWidth / cols;
        const boxHeight = contentHeight / rows;
        
        // Title space at top
        const titleSpace = 15;
        
        // Capture and render each window individually
        for (let i = 0; i < windows.length; i++) {
          const window = windows[i];
          const windowElement = canvasContainerRef.current.querySelector(`.window-drawing-${window.id}`) as HTMLElement;
          
          if (!windowElement) continue;
          
          // Calculate grid position
          const col = i % cols;
          const row = Math.floor(i / cols);
          
          // Calculate position in PDF
          const xPos = margin + (col * boxWidth);
          const yPos = margin + titleSpace + (row * boxHeight);
          
          // Create a temporary div to isolate the window for capture
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.top = '0';
          tempDiv.style.left = '0';
          tempDiv.style.backgroundColor = 'white';
          tempDiv.style.zIndex = '-1';
          tempDiv.style.padding = '10px';
          tempDiv.appendChild(windowElement.cloneNode(true));
          document.body.appendChild(tempDiv);
          
          // Capture the individual window
          const canvas = await html2canvas(tempDiv, {
            backgroundColor: '#FFFFFF',
            scale: 2, // Higher resolution
            logging: false,
            useCORS: true
          });
          
          // Remove the temporary element
          document.body.removeChild(tempDiv);
          
          // Calculate scaling to fit in the grid cell with some padding
          const cellPadding = 5; // 5mm padding between cells
          const availableWidth = boxWidth - (cellPadding * 2);
          const availableHeight = boxHeight - (cellPadding * 2);
          
          const imageRatio = canvas.width / canvas.height;
          const cellRatio = availableWidth / availableHeight;
          
          let finalWidth, finalHeight;
          
          if (imageRatio > cellRatio) {
            // Image is wider than the cell ratio
            finalWidth = availableWidth;
            finalHeight = availableWidth / imageRatio;
          } else {
            // Image is taller than the cell ratio
            finalHeight = availableHeight;
            finalWidth = availableHeight * imageRatio;
          }
          
          // Center the image in its cell
          const cellXPos = xPos + cellPadding + (availableWidth - finalWidth) / 2;
          const cellYPos = yPos + cellPadding + (availableHeight - finalHeight) / 2;
          
          // Add the image to the PDF
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', cellXPos, cellYPos, finalWidth, finalHeight);
          
          // Add window name below the image
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          const nameYPos = cellYPos + finalHeight + 3;
          pdf.text(window.name || `Window ${i+1}`, cellXPos + finalWidth/2, nameYPos, { align: 'center' });
        }
        
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
              <div className="flex space-x-2">
                {windows.length > 0 && (
                  <>
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
                    
                    <CostEstimator windows={windows} projectName={projectName} />
                  </>
                )}
              </div>
              
              <div className="flex space-x-2">
                <ProjectImportExport 
                  windows={windows} 
                  projectName={projectName} 
                  onImportComplete={() => setRefreshKey(prev => prev + 1)} 
                />
              </div>
              
              <div className="flex space-x-2">
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
