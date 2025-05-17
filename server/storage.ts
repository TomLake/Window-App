import { users, type User, type InsertUser, type Window, type InsertWindow, type Project, type InsertProject } from "@shared/schema";

// Storage interface with CRUD methods for all entities
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Window methods
  getWindow(id: number): Promise<Window | undefined>;
  getAllWindows(): Promise<Window[]>;
  createWindow(window: InsertWindow): Promise<Window>;
  updateWindow(window: Window): Promise<Window>;
  deleteWindow(id: number): Promise<void>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(project: Project): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  getWindowsByProject(projectId: number): Promise<Window[]>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private windows: Map<number, Window>;
  private projects: Map<number, Project>;
  
  private userIdCounter: number;
  private windowIdCounter: number;
  private projectIdCounter: number;

  constructor() {
    this.users = new Map();
    this.windows = new Map();
    this.projects = new Map();
    
    this.userIdCounter = 1;
    this.windowIdCounter = 1;
    this.projectIdCounter = 1;
    
    // Create default project
    this.createProject({
      userId: 1, // Default user
      name: "Untitled Project",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Create some sample windows
    this.createWindow({
      projectId: 1,
      name: "Bedroom Window",
      type: "double",
      width: 1110,
      height: 1130,
      location: "Bedroom",
      glassType: "Clear",
      positionX: 0,
      positionY: 0,
    });
    
    this.createWindow({
      projectId: 1,
      name: "Kitchen Window",
      type: "triple",
      width: 1470,
      height: 970,
      location: "Kitchen",
      glassType: "Clear",
      positionX: 0,
      positionY: 0,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Window methods
  async getWindow(id: number): Promise<Window | undefined> {
    return this.windows.get(id);
  }

  async getAllWindows(): Promise<Window[]> {
    return Array.from(this.windows.values());
  }

  async createWindow(insertWindow: InsertWindow): Promise<Window> {
    const id = this.windowIdCounter++;
    const window: Window = { ...insertWindow, id };
    this.windows.set(id, window);
    return window;
  }

  async updateWindow(window: Window): Promise<Window> {
    this.windows.set(window.id, window);
    return window;
  }

  async deleteWindow(id: number): Promise<void> {
    this.windows.delete(id);
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(project: Project): Promise<Project> {
    this.projects.set(project.id, project);
    return project;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
    
    // Delete all windows associated with this project
    for (const [windowId, window] of this.windows.entries()) {
      if (window.projectId === id) {
        this.windows.delete(windowId);
      }
    }
  }

  async getWindowsByProject(projectId: number): Promise<Window[]> {
    return Array.from(this.windows.values()).filter(
      (window) => window.projectId === projectId
    );
  }
}

export const storage = new MemStorage();
