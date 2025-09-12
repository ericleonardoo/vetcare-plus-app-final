
"use server";

import { suggestAppointmentTimes } from "@/ai/flows/suggest-appointment-times";
import { z } from "zod";

const appointmentFormSchema = z.object({
  ownerName: z.string().min(2, "Name is too short"),
  petName: z.string().min(1, "Pet name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  serviceType: z.string().min(1, "Please select a service"),
  timeZone: z.string(),
});

type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;

// In a real application, this would come from a database.
const staffAvailability = JSON.stringify({
  "Monday": ["09:00-12:00", "14:00-17:00"],
  "Tuesday": ["09:00-17:00"],
  "Wednesday": ["09:00-12:00"],
  "Thursday": ["09:00-17:00"],
  "Friday": ["09:00-15:00"],
  "Saturday": ["10:00-14:00"],
  "Sunday": []
});

const serviceDurations: Record<string, number> = {
    'Routine Check-up': 30,
    'Vaccination': 20,
    'Dental Cleaning': 60,
    'Surgery Consultation': 45,
    'Grooming': 90,
    'Emergency Visit': 60,
};


export async function getSuggestedTimes(data: AppointmentFormInput) {
    const validatedData = appointmentFormSchema.safeParse(data);

    if (!validatedData.success) {
        return { success: false, error: "Invalid data provided." };
    }

    const { serviceType, timeZone } = validatedData.data;
    const durationMinutes = serviceDurations[serviceType] || 30;

    try {
        const result = await suggestAppointmentTimes({
            serviceType,
            staffAvailability,
            timeZone,
            durationMinutes,
            numberOfSuggestions: 5,
        });
        return { success: true, data: result.suggestedAppointmentTimes };
    } catch (error) {
        console.error("AI flow error:", error);
        return { success: false, error: "Failed to suggest appointment times. Please try again later." };
    }
}
