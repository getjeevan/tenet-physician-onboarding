import { db } from "./db";
import { 
  physicians, documents, onboardingSteps, users,
  type InsertPhysician, type InsertDocument, type InsertOnboardingStep,
  type Physician, type Document, type OnboardingStep, type PhysicianWithUser
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Physicians
  getPhysician(id: number): Promise<PhysicianWithUser | undefined>;
  getPhysicianByUserId(userId: string): Promise<PhysicianWithUser | undefined>;
  listPhysicians(): Promise<PhysicianWithUser[]>;
  createPhysician(physician: InsertPhysician): Promise<Physician>;
  updatePhysician(id: number, updates: Partial<InsertPhysician>): Promise<Physician>;

  // Documents
  getDocuments(physicianId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<Document>;

  // Onboarding Steps
  getOnboardingSteps(physicianId: number): Promise<OnboardingStep[]>;
  createOnboardingStep(step: InsertOnboardingStep): Promise<OnboardingStep>;
  updateOnboardingStepStatus(id: number, status: "pending" | "in_progress" | "completed"): Promise<OnboardingStep>;
  initializeOnboardingSteps(physicianId: number): Promise<OnboardingStep[]>;
}

export class DatabaseStorage implements IStorage {
  // Physicians
  async getPhysician(id: number): Promise<PhysicianWithUser | undefined> {
    const result = await db.select({
      physician: physicians,
      user: users
    })
    .from(physicians)
    .innerJoin(users, eq(physicians.userId, users.id))
    .where(eq(physicians.id, id));

    if (result.length === 0) return undefined;
    return { ...result[0].physician, user: result[0].user };
  }

  async getPhysicianByUserId(userId: string): Promise<PhysicianWithUser | undefined> {
    const result = await db.select({
      physician: physicians,
      user: users
    })
    .from(physicians)
    .innerJoin(users, eq(physicians.userId, users.id))
    .where(eq(physicians.userId, userId));

    if (result.length === 0) return undefined;
    return { ...result[0].physician, user: result[0].user };
  }

  async listPhysicians(): Promise<PhysicianWithUser[]> {
    const result = await db.select({
      physician: physicians,
      user: users
    })
    .from(physicians)
    .innerJoin(users, eq(physicians.userId, users.id));

    return result.map(row => ({ ...row.physician, user: row.user }));
  }

  async createPhysician(physician: InsertPhysician): Promise<Physician> {
    const [newPhysician] = await db.insert(physicians).values(physician).returning();
    return newPhysician;
  }

  async updatePhysician(id: number, updates: Partial<InsertPhysician>): Promise<Physician> {
    const [updated] = await db.update(physicians)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(physicians.id, id))
      .returning();
    return updated;
  }

  // Documents
  async getDocuments(physicianId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.physicianId, physicianId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDoc] = await db.insert(documents).values(document).returning();
    return newDoc;
  }

  async updateDocumentStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<Document> {
    const [updated] = await db.update(documents)
      .set({ status })
      .where(eq(documents.id, id))
      .returning();
    return updated;
  }

  // Onboarding Steps
  async getOnboardingSteps(physicianId: number): Promise<OnboardingStep[]> {
    return await db.select()
      .from(onboardingSteps)
      .where(eq(onboardingSteps.physicianId, physicianId))
      .orderBy(onboardingSteps.id);
  }

  async createOnboardingStep(step: InsertOnboardingStep): Promise<OnboardingStep> {
    const [newStep] = await db.insert(onboardingSteps).values(step).returning();
    return newStep;
  }

  async updateOnboardingStepStatus(id: number, status: "pending" | "in_progress" | "completed"): Promise<OnboardingStep> {
    const completedAt = status === "completed" ? new Date() : null;
    const [updated] = await db.update(onboardingSteps)
      .set({ status, completedAt })
      .where(eq(onboardingSteps.id, id))
      .returning();
    return updated;
  }

  async initializeOnboardingSteps(physicianId: number): Promise<OnboardingStep[]> {
    const standardSteps = [
      { stepName: "Profile Completion", description: "Complete your personal and professional details", isRequired: true },
      { stepName: "Medical License Upload", description: "Upload your current state medical license", isRequired: true },
      { stepName: "Board Certification", description: "Upload board certification documents", isRequired: true },
      { stepName: "DEA Registration", description: "Provide DEA registration proof", isRequired: true },
      { stepName: "Malpractice Insurance", description: "Upload proof of insurance coverage", isRequired: true },
      { stepName: "Privileges Application", description: "Sign and submit hospital privileges application", isRequired: true },
      { stepName: "Orientation", description: "Complete online orientation modules", isRequired: true },
    ];

    const steps = [];
    for (const step of standardSteps) {
      const created = await this.createOnboardingStep({
        physicianId,
        ...step,
        status: "pending"
      });
      steps.push(created);
    }
    return steps;
  }
}

export const storage = new DatabaseStorage();
