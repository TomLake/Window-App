import { useState, useRef } from "react";
import Header from "@/components/Header";
import WindowForm from "@/components/WindowForm";
import WindowDesignCanvas from "@/components/WindowDesignCanvas";
import ProjectWindowsList from "@/components/ProjectWindowsList";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Window } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [selectedWindow, setSelectedWindow] = useState<Window | null>(null);
  const [projectName, setProjectName] = useState("Untitled Project");
  const designCanvasRef = useRef<HTMLDivElement>(null);

  // Fetch windows from the server
  const { data: windows = [], refetch: refetchWindows } = useQuery({
    queryKey: ['/api/windows'],
  });

  // Create window mutation
  const createWindow = useMutation({
    mutationFn: async (windowData: Omit<Window, 'id'>) => {
      const res = await apiRequest('POST', '/api/windows', windowData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Window created",
        description: "The window has been added to your project",
      });
      refetchWindows();
    },
  });

  // Update window mutation
  const updateWindow = useMutation({
    mutationFn: async (windowData: Window) => {
      const res = await apiRequest('PUT', `/api/windows/${windowData.id}`, windowData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Window updated",
        description: "The window has been updated",
      });
      refetchWindows();
      setSelectedWindow(null);
    },
  });

  // Delete window mutation
  const deleteWindow = useMutation({
    mutationFn: async (windowId: number) => {
      await apiRequest('DELETE', `/api/windows/${windowId}`);
    },
    onSuccess: () => {
      toast({
        title: "Window deleted",
        description: "The window has been removed from your project",
      });
      refetchWindows();
    },
  });

  // Handle adding or updating a window
  const handleSaveWindow = (windowData: Omit<Window, 'id'> & { id?: number }) => {
    if (windowData.id) {
      updateWindow.mutate(windowData as Window);
    } else {
      createWindow.mutate(windowData);
    }
  };

  // Handle editing a window
  const handleEditWindow = (window: Window) => {
    setSelectedWindow(window);
  };

  // Handle deleting a window
  const handleDeleteWindow = (windowId: number) => {
    deleteWindow.mutate(windowId);
  };
  
  // Handle PDF export of all windows
  const handleExportPDF = async () => {
    if (!canvasRef.current || windows.length === 0) return;
    
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
      const drawingArea = canvasRef.current.querySelector('.border.border-gray-200.bg-gray-50');
      if (!drawingArea) return;
      
      // Capture the drawing area
      const canvas = await html2canvas(drawingArea as HTMLElement, {
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
    <div className="h-screen flex flex-col">
      <Header 
        projectName={projectName} 
        onProjectNameChange={setProjectName} 
        onExportPDF={handleExportPDF}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
          {/* Make this section scrollable independently */}
          <div className="p-4 border-b border-gray-200 overflow-y-auto flex-1">
            <h2 className="font-medium text-lg text-textPrimary mb-4 sticky top-0 bg-white pt-1">Window Parameters</h2>
            <WindowForm 
              selectedWindow={selectedWindow} 
              onSave={handleSaveWindow} 
              onReset={() => setSelectedWindow(null)} 
            />
          </div>
          
          {/* Current project section */}
          <div className="p-4 border-t border-gray-200 overflow-y-auto max-h-[25vh]">
            <h2 className="font-medium text-lg text-textPrimary mb-4 sticky top-0 bg-white">Current Project</h2>
            <ProjectWindowsList 
              windows={windows} 
              onEdit={handleEditWindow} 
              onDelete={handleDeleteWindow} 
            />
          </div>
        </aside>
        
        {/* Main content area */}
        <WindowDesignCanvas 
          ref={printRef}
          windows={windows} 
          projectName={projectName}
        />
      </div>
    </div>
  );
}
