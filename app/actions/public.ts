"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const cateringSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email(),
  eventType: z.string().min(2),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().optional(),
  preferredMenu: z.string().optional(),
  notes: z.string().optional()
});

const contactSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(5)
});

const bulkSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().optional(),
  trayPackageId: z.string().optional(),
  quantity: z.coerce.number().optional(),
  eventDate: z.string().optional(),
  notes: z.string().optional()
});

export async function submitCateringInquiry(formData: FormData) {
  const parsed = cateringSchema.parse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    eventType: formData.get("eventType"),
    eventDate: formData.get("eventDate"),
    guestCount: formData.get("guestCount"),
    preferredMenu: formData.get("preferredMenu"),
    notes: formData.get("notes")
  });

  await prisma.cateringInquiry.create({
    data: {
      fullName: parsed.fullName,
      phone: parsed.phone,
      email: parsed.email,
      eventType: parsed.eventType,
      eventDate: parsed.eventDate ? new Date(parsed.eventDate) : null,
      guestCount: parsed.guestCount,
      preferredMenu: parsed.preferredMenu,
      additionalNotes: parsed.notes
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/catering-inquiries");
}

export async function submitContactInquiry(formData: FormData) {
  const parsed = contactSchema.parse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message")
  });

  await prisma.contactInquiry.create({
    data: parsed
  });

  revalidatePath("/admin");
  revalidatePath("/admin/contact-inquiries");
}

export async function submitBulkInquiry(formData: FormData) {
  const parsed = bulkSchema.parse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    trayPackageId: formData.get("trayPackageId"),
    quantity: formData.get("quantity"),
    eventDate: formData.get("eventDate"),
    notes: formData.get("notes")
  });

  await prisma.bulkOrderInquiry.create({
    data: {
      fullName: parsed.fullName,
      phone: parsed.phone,
      email: parsed.email || null,
      trayPackageId: parsed.trayPackageId || null,
      quantity: parsed.quantity,
      eventDate: parsed.eventDate ? new Date(parsed.eventDate) : null,
      notes: parsed.notes
    }
  });

  revalidatePath("/admin");
}
