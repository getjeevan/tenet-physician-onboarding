import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./replit_integrations/auth";

import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  const existingPhysicians = await storage.listPhysicians();
  if (existingPhysicians.length === 0) {
    // Create a seed user directly
    const seedUserId = "seed-user-1";
    const [user] = await db.insert(users).values({
      id: seedUserId,
      email: "dr.smith@example.com",
      firstName: "John",
      lastName: "Smith",
      profileImageUrl: null,
    }).onConflictDoNothing().returning();

    // Create physician profile
    const physician = await storage.createPhysician({
      userId: seedUserId,
      specialty: "Cardiology",
      licenseNumber: "MD12345",
      npiNumber: "1234567890",
      department: "Internal Medicine",
      startDate: new Date("2024-01-01").toISOString(),
      status: "onboarding"
    });

    // Initialize steps
    await storage.initializeOnboardingSteps(physician.id);

    // Create a sample document
    await storage.createDocument({
      physicianId: physician.id,
      name: "State Medical License",
      type: "license",
      url: "https://example.com/license.pdf",
      status: "approved"
    });

    console.log("Database seeded with sample data");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Setup Object Storage
  registerObjectStorageRoutes(app);

  // Seed Database
  await seedDatabase();

  // === API ROUTES ===

  // Physicians
  app.get(api.physicians.list.path, isAuthenticated, async (req, res) => {
    const physicians = await storage.listPhysicians();
    res.json(physicians);
  });

  app.get(api.physicians.get.path, isAuthenticated, async (req, res) => {
    const physician = await storage.getPhysician(Number(req.params.id));
    if (!physician) {
      return res.status(404).json({ message: 'Physician not found' });
    }
    res.json(physician);
  });

  app.get(api.physicians.getByUserId.path, isAuthenticated, async (req, res) => {
    const physician = await storage.getPhysicianByUserId(req.params.userId);
    if (!physician) {
      return res.status(404).json({ message: 'Physician profile not found' });
    }
    res.json(physician);
  });

  app.post(api.physicians.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.physicians.create.input.parse(req.body);
      const physician = await storage.createPhysician(input);
      // Initialize steps automatically
      await storage.initializeOnboardingSteps(physician.id);
      res.status(201).json(physician);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.physicians.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.physicians.update.input.parse(req.body);
      const physician = await storage.updatePhysician(Number(req.params.id), input);
      res.json(physician);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(404).json({ message: 'Physician not found' });
    }
  });

  // Documents
  app.get(api.documents.list.path, isAuthenticated, async (req, res) => {
    const docs = await storage.getDocuments(Number(req.params.physicianId));
    res.json(docs);
  });

  app.post(api.documents.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.documents.create.input.parse(req.body);
      const doc = await storage.createDocument(input);
      res.status(201).json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.documents.updateStatus.path, isAuthenticated, async (req, res) => {
    const { status } = req.body;
    const doc = await storage.updateDocumentStatus(Number(req.params.id), status);
    res.json(doc);
  });

  // Onboarding Steps
  app.get(api.onboarding.listSteps.path, isAuthenticated, async (req, res) => {
    const steps = await storage.getOnboardingSteps(Number(req.params.physicianId));
    res.json(steps);
  });

  app.patch(api.onboarding.updateStep.path, isAuthenticated, async (req, res) => {
    const { status } = req.body;
    const step = await storage.updateOnboardingStepStatus(Number(req.params.id), status);
    res.json(step);
  });

  app.post(api.onboarding.initialize.path, isAuthenticated, async (req, res) => {
    const steps = await storage.initializeOnboardingSteps(Number(req.params.physicianId));
    res.status(201).json(steps);
  });

  return httpServer;
}
