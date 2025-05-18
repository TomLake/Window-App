import { db } from './db';
import { eq } from 'drizzle-orm';
import { users, windows, projects, type User, type InsertUser, type Window, type InsertWindow, type Project, type InsertProject } from "@shared/schema";

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

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Window methods
  async getWindow(id: number): Promise<Window | undefined> {
    const [window] = await db.select().from(windows).where(eq(windows.id, id));
    return window || undefined;
  }

  async getAllWindows(): Promise<Window[]> {
    return await db.select().from(windows);
  }

  async createWindow(insertWindow: InsertWindow): Promise<Window> {
    const [window] = await db.insert(windows).values(insertWindow).returning();
    return window;
  }

  async updateWindow(window: Window): Promise<Window> {
    const [updatedWindow] = await db
      .update(windows)
      .set(window)
      .where(eq(windows.id, window.id))
      .returning();
    return updatedWindow;
  }

  async deleteWindow(id: number): Promise<void> {
    await db.delete(windows).where(eq(windows.id, id));
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(project: Project): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, project.id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    // First delete all windows in the project
    await db.delete(windows).where(eq(windows.projectId, id));
    
    // Then delete the project
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getWindowsByProject(projectId: number): Promise<Window[]> {
    return await db.select().from(windows).where(eq(windows.projectId, projectId));
  }
}

export const storage = new DatabaseStorage();
