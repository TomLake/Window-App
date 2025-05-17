import { useState } from "react";
import Header from "@/components/Header";
import WindowForm from "@/components/WindowForm";
import WindowDesignCanvas from "@/components/WindowDesignCanvas";
import WindowTemplates from "@/components/WindowTemplates";
import ProjectWindowsList from "@/components/ProjectWindowsList";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Window } from "@shared/schema";
import { usePrint } from "@/hooks/usePrint";

export default function Home() {
  const { toast } = useToast();
  const [selectedWindow, setSelectedWindow] = useState<Window | null>(null);
  const [projectName, setProjectName] = useState("Untitled Project");

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

  // Setup printing functionality
  const { printRef, handlePrint } = usePrint();

  return (
    <div className="h-screen flex flex-col">
      <Header 
        projectName={projectName} 
        onProjectNameChange={setProjectName} 
        onExportPDF={handlePrint}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-medium text-lg text-textPrimary mb-4">Window Parameters</h2>
            <WindowForm 
              selectedWindow={selectedWindow} 
              onSave={handleSaveWindow} 
              onReset={() => setSelectedWindow(null)} 
            />
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="font-medium text-lg text-textPrimary mb-4">Window Templates</h2>
            <WindowTemplates onSelectTemplate={setSelectedWindow} />
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <h2 className="font-medium text-lg text-textPrimary mb-4">Current Project</h2>
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
