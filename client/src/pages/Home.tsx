import { useState } from "react";
import Header from "@/components/Header";
import WindowForm from "@/components/WindowForm";
import WindowDesignCanvas from "@/components/WindowDesignCanvas";
import ProjectWindowsList from "@/components/ProjectWindowsList";
import { ProjectManager } from "@/components/ProjectManager";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Window, Project } from "@shared/schema";
import { usePrint } from "@/hooks/usePrint";

export default function Home() {
  const { toast } = useToast();
  const [selectedWindow, setSelectedWindow] = useState<Window | null>(null);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Fetch windows from the server, filtered by project if one is selected
  const { data: windowsData } = useQuery({
    queryKey: ['/api/windows', currentProject?.id],
    queryFn: async () => {
      const url = currentProject 
        ? `/api/windows?projectId=${currentProject.id}` 
        : '/api/windows';
      const response = await apiRequest('GET', url);
      return response.json();
    },
  });
  
  // Ensure windows is always an array
  const windows = Array.isArray(windowsData) ? windowsData : [];

  // Create window mutation
  const createWindow = useMutation({
    mutationFn: async (windowData: Omit<Window, 'id'>) => {
      // If we have a current project, assign windows to it
      const windowToCreate = {
        ...windowData,
        projectId: currentProject?.id || 1, // Default to project ID 1 if none is selected
      };
      
      const response = await apiRequest('POST', '/api/windows', windowToCreate);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Window created",
        description: "The window has been added to your project",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/windows'] });
    },
  });

  // Update window mutation
  const updateWindow = useMutation({
    mutationFn: async (windowData: Window) => {
      const response = await apiRequest('PUT', `/api/windows/${windowData.id}`, windowData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Window updated",
        description: "The window has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/windows'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/windows'] });
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
  
  // Handle project selection and changes
  const handleProjectChanged = (project: Project, projectWindows: Window[]) => {
    setCurrentProject(project);
    setProjectName(project.name);
    
    // We don't need to manually update windows as the query will re-run
  };

  // Setup printing functionality
  const { printRef, handlePrint } = usePrint();

  return (
    <div className="h-screen flex flex-col">
      <Header 
        projectName={projectName} 
        onProjectNameChange={(name) => {
          setProjectName(name);
          if (currentProject) {
            // Update the project name if we're in a project
            const updatedProject = { 
              ...currentProject, 
              name, 
              updatedAt: new Date().toISOString()
            };
            apiRequest('PUT', `/api/projects/${currentProject.id}`, updatedProject)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
            });
          }
        }} 
        onExportPDF={handlePrint}
      />
      
      {/* Project Manager */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <ProjectManager 
          currentProject={currentProject}
          projectWindows={windows}
          onProjectChanged={handleProjectChanged}
        />
      </div>
      
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
            <h2 className="font-medium text-lg text-textPrimary mb-4 sticky top-0 bg-white">Project Windows</h2>
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
