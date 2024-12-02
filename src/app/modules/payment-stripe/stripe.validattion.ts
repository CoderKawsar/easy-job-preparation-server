import { z } from "zod";

const addStripePaymentZodSchema = z.object({
  body: z.object({
    amount: z.number({
      required_error: "Amount is required!",
    }),
    shipping_address: z.string({}).optional(),
    subscription_id: z.string({}).optional(),
  }),
});

export const StripePaymentValidation = {
  addStripePaymentZodSchema,
};
