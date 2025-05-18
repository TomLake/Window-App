import { pgTable, text, serial, integer, boolean, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base schema for all users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Window schema definition
export const windows = pgTable("windows", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // single, double, triple, patio
  width: integer("width").notNull(), // in mm
  height: integer("height").notNull(), // in mm
  // location field removed as requested
  glassType: text("glass_type").notNull(), // clear, obscure, etc.
  hasGeorgianBars: boolean("has_georgian_bars").default(false), // whether to display Georgian bars
  georgianBarsHorizontal: integer("georgian_bars_horizontal").default(1), // number of horizontal bars
  georgianBarsVertical: integer("georgian_bars_vertical").default(1), // number of vertical bars
  openableCasements: varchar("openable_casements", { length: 50 }).default("left"), // which casements can open: "left", "right", "both", "none"
  transomHeight: integer("transom_height").default(400), // height of transom from top in mm (for transom window types)
  topCasementsOpenable: varchar("top_casements_openable", { length: 50 }).default("none"), // which top casements can open: "left", "right", "both", "none"
  
  positionX: integer("position_x").default(0), // position in canvas
  positionY: integer("position_y").default(0), // position in canvas
});

export const insertWindowSchema = createInsertSchema(windows).omit({
  id: true,
});

export type Window = typeof windows.$inferSelect;
export type InsertWindow = z.infer<typeof insertWindowSchema>;

// Project schema definition
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
