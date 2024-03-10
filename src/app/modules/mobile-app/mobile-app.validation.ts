import { z } from "zod";

const sendMessageToAllZodSchema = z.object({
  body: z.object({
    message: z.string({ required_error: "Message is required!" }),
  }),
});

export const MobileAppValidation = {
  sendMessageToAllZodSchema,
};
