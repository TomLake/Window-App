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
      const windows = await storage.getAllWindows();
      return res.json(windows);
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

  return httpServer;
}
