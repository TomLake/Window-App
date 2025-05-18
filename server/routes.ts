import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertWindowSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Get all windows
  app.get('/api/windows', async (req, res) => {
    try {
      // Get project ID from query parameter if it exists
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      if (projectId) {
        // Get windows for specific project
        const windows = await storage.getWindowsByProject(projectId);
        return res.json(windows);
      } else {
        // Get all windows
        const windows = await storage.getAllWindows();
        return res.json(windows);
      }
    } catch (error) {
      console.error('Error getting windows:', error);
      return res.status(500).json({ error: 'Failed to get windows' });
    }
  });

  // Get window by ID
  app.get('/api/windows/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid window ID' });
      }
      
      const window = await storage.getWindow(id);
      if (!window) {
        return res.status(404).json({ error: 'Window not found' });
      }
      
      return res.json(window);
    } catch (error) {
      console.error('Error getting window:', error);
      return res.status(500).json({ error: 'Failed to get window' });
    }
  });

  // Create a new window
  app.post('/api/windows', async (req, res) => {
    try {
      // Validate request body
      const result = insertWindowSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      
      const newWindow = await storage.createWindow(result.data);
      return res.status(201).json(newWindow);
    } catch (error) {
      console.error('Error creating window:', error);
      return res.status(500).json({ error: 'Failed to create window' });
    }
  });

  // Update a window
  app.put('/api/windows/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid window ID' });
      }
      
      // Validate request body
      const updateSchema = insertWindowSchema.extend({
        id: z.number(),
      });
      const result = updateSchema.safeParse({ ...req.body, id });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      
      const existingWindow = await storage.getWindow(id);
      if (!existingWindow) {
        return res.status(404).json({ error: 'Window not found' });
      }
      
      const updatedWindow = await storage.updateWindow(result.data);
      return res.json(updatedWindow);
    } catch (error) {
      console.error('Error updating window:', error);
      return res.status(500).json({ error: 'Failed to update window' });
    }
  });

  // Delete a window
  app.delete('/api/windows/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid window ID' });
      }
      
      const existingWindow = await storage.getWindow(id);
      if (!existingWindow) {
        return res.status(404).json({ error: 'Window not found' });
      }
      
      await storage.deleteWindow(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting window:', error);
      return res.status(500).json({ error: 'Failed to delete window' });
    }
  });

  // Get all projects
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      return res.json(projects);
    } catch (error) {
      console.error('Error getting projects:', error);
      return res.status(500).json({ error: 'Failed to get projects' });
    }
  });
  
  // Get project by ID
  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      return res.json(project);
    } catch (error) {
      console.error('Error getting project:', error);
      return res.status(500).json({ error: 'Failed to get project' });
    }
  });
  
  // Create a new project
  app.post('/api/projects', async (req, res) => {
    try {
      const { name, description = '' } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      
      const newProject = await storage.createProject({
        userId: 1, // Using default user ID for now
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return res.status(201).json(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({ error: 'Failed to create project' });
    }
  });
  
  // Update a project
  app.put('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      
      const existingProject = await storage.getProject(id);
      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const updatedProject = await storage.updateProject({
        ...existingProject,
        name,
        description: description || existingProject.description,
        updatedAt: new Date().toISOString()
      });
      
      return res.json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      return res.status(500).json({ error: 'Failed to update project' });
    }
  });
  
  // Delete a project and all associated windows
  app.delete('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const existingProject = await storage.getProject(id);
      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      await storage.deleteProject(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting project:', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  return httpServer;
}
