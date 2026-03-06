import { pgTable, text, serial, integer, boolean, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const physicians = pgTable("physicians", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  specialty: text("specialty").notNull(),
  licenseNumber: text("license_number").notNull(),
  npiNumber: text("npi_number").notNull(),
  department: text("department").notNull(),
  startDate: date("start_date").notNull(),
  status: text("status", { enum: ["onboarding", "review", "active", "rejected"] }).default("onboarding").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  physicianId: integer("physician_id").notNull().references(() => physicians.id),
  name: text("name").notNull(),
  type: text("type", { enum: ["license", "certification", "identification", "contract", "other"] }).notNull(),
  url: text("url").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const onboardingSteps = pgTable("onboarding_steps", {
  id: serial("id").primaryKey(),
  physicianId: integer("physician_id").notNull().references(() => physicians.id),
  stepName: text("step_name").notNull(),
  description: text("description"),
  isRequired: boolean("is_required").default(true),
  status: text("status", { enum: ["pending", "in_progress", "completed"] }).default("pending").notNull(),
  completedAt: timestamp("completed_at"),
});

// === RELATIONS ===

export const physiciansRelations = relations(physicians, ({ one, many }) => ({
  user: one(users, {
    fields: [physicians.userId],
    references: [users.id],
  }),
  documents: many(documents),
  onboardingSteps: many(onboardingSteps),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  physician: one(physicians, {
    fields: [documents.physicianId],
    references: [physicians.id],
  }),
}));

export const onboardingStepsRelations = relations(onboardingSteps, ({ one }) => ({
  physician: one(physicians, {
    fields: [onboardingSteps.physicianId],
    references: [physicians.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertPhysicianSchema = createInsertSchema(physicians).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ 
  id: true, 
  uploadedAt: true 
});

export const insertOnboardingStepSchema = createInsertSchema(onboardingSteps).omit({ 
  id: true 
});

// === EXPLICIT API CONTRACT TYPES ===

export type Physician = typeof physicians.$inferSelect;
export type InsertPhysician = z.infer<typeof insertPhysicianSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type OnboardingStep = typeof onboardingSteps.$inferSelect;
export type InsertOnboardingStep = z.infer<typeof insertOnboardingStepSchema>;

// Joined type for physician list
export type PhysicianWithUser = Physician & { user: typeof users.$inferSelect };

// Request types
export type CreatePhysicianRequest = InsertPhysician;
export type UpdatePhysicianRequest = Partial<InsertPhysician>;
export type CreateDocumentRequest = InsertDocument;
export type UpdateDocumentStatusRequest = { status: "pending" | "approved" | "rejected" };
export type UpdateStepStatusRequest = { status: "pending" | "in_progress" | "completed" };

// Response types
export type PhysicianResponse = Physician;
export type DocumentResponse = Document;
export type OnboardingStepResponse = OnboardingStep;
