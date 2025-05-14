import { z } from "zod";

export const ReportFormSchema = z.object({
  editableDescription: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  photoLocation: z.string().min(5, {
    message: "Photo location must be at least 5 characters.",
  }),
  userEmail: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal("")), // Allow empty string or valid email
  userComments: z.string().optional(),
  sendToLocalPolice: z.boolean().default(false),
  sendToCityHall: z.boolean().default(false),
}).refine(data => data.sendToLocalPolice || data.sendToCityHall, {
  message: "Please select at least one recipient (Local Police or City Hall).",
  path: ["sendToLocalPolice"], // Error will be associated with the first checkbox
});

export type ReportFormValues = z.infer<typeof ReportFormSchema>;
