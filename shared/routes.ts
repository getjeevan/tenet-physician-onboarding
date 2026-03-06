import { z } from 'zod';
import { 
  insertPhysicianSchema, 
  insertDocumentSchema, 
  insertOnboardingStepSchema,
  physicians,
  documents,
  onboardingSteps
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  physicians: {
    list: {
      method: 'GET' as const,
      path: '/api/physicians',
      responses: {
        200: z.array(z.custom<any>()), // PhysicianWithUser
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/physicians/:id',
      responses: {
        200: z.custom<any>(), // PhysicianWithUser & relations
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/physicians',
      input: insertPhysicianSchema,
      responses: {
        201: z.custom<typeof physicians.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/physicians/:id',
      input: insertPhysicianSchema.partial(),
      responses: {
        200: z.custom<typeof physicians.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    getByUserId: {
      method: 'GET' as const,
      path: '/api/physicians/user/:userId',
      responses: {
        200: z.custom<typeof physicians.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  documents: {
    list: {
      method: 'GET' as const,
      path: '/api/physicians/:physicianId/documents',
      responses: {
        200: z.array(z.custom<typeof documents.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/documents',
      input: insertDocumentSchema,
      responses: {
        201: z.custom<typeof documents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/documents/:id/status',
      input: z.object({ status: z.enum(["pending", "approved", "rejected"]) }),
      responses: {
        200: z.custom<typeof documents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  onboarding: {
    listSteps: {
      method: 'GET' as const,
      path: '/api/physicians/:physicianId/steps',
      responses: {
        200: z.array(z.custom<typeof onboardingSteps.$inferSelect>()),
      },
    },
    updateStep: {
      method: 'PATCH' as const,
      path: '/api/steps/:id',
      input: z.object({ status: z.enum(["pending", "in_progress", "completed"]) }),
      responses: {
        200: z.custom<typeof onboardingSteps.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    initialize: {
      method: 'POST' as const,
      path: '/api/physicians/:physicianId/steps/initialize',
      responses: {
        201: z.array(z.custom<typeof onboardingSteps.$inferSelect>()),
      },
    }
  }
};

// ============================================
// URL BUILDER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
