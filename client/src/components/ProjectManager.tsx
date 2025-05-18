import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, Window } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

interface ProjectManagerProps {
  currentProject: Project | null;
  projectWindows: Window[];
  onProjectChanged: (project: Project, windows: Window[]) => void;
}

const newProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

type NewProjectValues = z.infer<typeof newProjectSchema>;

export function ProjectManager({ currentProject, projectWindows, onProjectChanged }: ProjectManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form for creating new projects
  const form = useForm<NewProjectValues>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Get all projects
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    select: (data) => data as Project[],
  });

  // Create new project mutation
  const createProject = useMutation({
    mutationFn: async (values: NewProjectValues) => {
      const newProject = {
        ...values,
        userId: 1, // Default user ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const response = await apiRequest('POST', '/api/projects', newProject);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
      
      // Reset form and close dialog
      form.reset();
      setIsCreateDialogOpen(false);
      
      // Set the new project as current
      onProjectChanged(data, []);
    },
    onError: (error) => {
      toast({
        title: "Error creating project",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Save windows to project mutation
  const saveWindows = useMutation({
    mutationFn: async ({ projectId, windows }: { projectId: number, windows: Window[] }) => {
      // We need to save each window with the project ID
      const savePromises = windows.map(async (window) => {
        const windowToSave = { ...window, projectId };
        
        if (window.id) {
          // Update existing window
          const response = await apiRequest('PUT', `/api/windows/${window.id}`, windowToSave);
          return response.json();
        } else {
          // Create new window
          const response = await apiRequest('POST', '/api/windows', windowToSave);
          return response.json();
        }
      });
      
      return Promise.all(savePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/windows'] });
      toast({
        title: "Project saved",
        description: "Your windows have been saved to the project.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving project",
        description: "There was an error saving your windows. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Load windows from project
  const loadProject = async (projectId: number) => {
    try {
      // Get project details
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        toast({
          title: "Error loading project",
          description: "Project not found.",
          variant: "destructive",
        });
        return;
      }
      
      // Get windows for the project
      const response = await apiRequest('GET', `/api/windows?projectId=${projectId}`);
      const projectWindows = await response.json();
      
      // Update current project and windows
      onProjectChanged(project, projectWindows);
      
      toast({
        title: "Project loaded",
        description: `Project "${project.name}" loaded successfully.`,
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error loading project",
        description: "There was an error loading the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle project selection
  const handleProjectChange = (projectId: string) => {
    loadProject(parseInt(projectId));
  };

  // Handle save current project
  const handleSaveProject = () => {
    if (!currentProject) {
      toast({
        title: "No project selected",
        description: "Please create or select a project first.",
        variant: "destructive",
      });
      return;
    }
    
    saveWindows.mutate({ projectId: currentProject.id, windows: projectWindows });
  };

  // Handle create project form submission
  const onSubmit = (values: NewProjectValues) => {
    createProject.mutate(values);
  };

  return (
    <div className="project-manager">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold">
          {currentProject ? `Project: ${currentProject.name}` : 'No Project Selected'}
        </h2>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Load Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Load Project</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">Select a project to load:</p>
              
              <Select onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Projects</SelectLabel>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={createProject.isPending}>
                    {createProject.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="default" 
          onClick={handleSaveProject} 
          disabled={!currentProject || saveWindows.isPending}
        >
          {saveWindows.isPending ? "Saving..." : "Save Project"}
        </Button>
      </div>
    </div>
  );
}