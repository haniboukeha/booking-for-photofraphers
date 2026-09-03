import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const bookingAddonSchema = z.object({
  addonId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const bookingItemSchema = z.object({
  packageId: z.string().min(1),
  addons: z.array(bookingAddonSchema),
});

export const bookingSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number is required")
    .regex(/^[+]?[\d\s\-().]+$/, "Enter a valid phone number"),
  email: z.union([z.string().trim().email("Enter a valid email"), z.literal("")]).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Select a start time"),
  eventAddress: z.string().trim().min(5, "Event address is required").max(500),
  notes: z.string().trim().max(2000, "Notes are too long").optional(),
  items: z.array(bookingItemSchema).min(1, "Your cart is empty"),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const serviceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
  description: z.string().trim().min(1, "Description is required").max(2000),
  basePrice: z.coerce.number().int().min(0),
  durationMinutes: z.coerce.number().int().min(15).max(1440),
  coverImageUrl: z.string().trim().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const packageSchema = z.object({
  serviceId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  price: z.coerce.number().int().min(0),
  featuresText: z.string().max(4000).optional(),
  addonIds: z.array(z.string()).optional(),
  sortOrder: z.coerce.number().int().optional(),
  active: z.boolean().optional(),
});

export const addonSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  price: z.coerce.number().int().min(0),
  allowQuantity: z.boolean().optional(),
  minQuantity: z.coerce.number().int().min(0).max(999).optional(),
  maxQuantity: z.coerce.number().int().min(1).max(999).optional(),
  active: z.boolean().optional(),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  headline: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  aboutText: z.string().trim().max(4000).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  instagram: z.string().trim().max(80).optional(),
  location: z.string().trim().max(200).optional(),
  businessHours: z.string().trim().max(200).optional(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  timezone: z.string().trim().min(1).max(60),
  workingDays: z.array(z.coerce.number().int().min(1).max(7)).min(1),
  holdPending: z.boolean().optional(),
  holdHours: z.coerce.number().int().min(1).max(168).optional(),
  maxBookingsPerDay: z.coerce.number().int().min(1).max(20).optional(),
});

export const blockDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().min(1, "Reason is required").max(200),
  type: z.enum(["PERSONAL", "HOLIDAY", "MAINTENANCE"]),
});
