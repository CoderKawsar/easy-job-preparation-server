import { z } from "zod";

const addSettingsZodSchema = z.object({
  body: z.object({
    key: z.string({
      required_error: "Settings key is required!",
    }),
    value: z.any({
      required_error: "Settings value is required!",
    }),
  }),
});

const addOrEditShippingChargeZodSchema = z.object({
  body: z.object({
    is_outside_dhaka: z.boolean({
      required_error: "Is outside dhaka value is required!",
    }),
    shipping_charge: z.number({
      required_error: "Shipping charge is required!",
    }),
  }),
});

const updateSettingsZodSchema = z.object({
  body: z.object({
    key: z.string({}).optional(),
    value: z.any({}).optional(),
  }),
});

export const SettingsValidation = {
  addSettingsZodSchema,
  addOrEditShippingChargeZodSchema,
  updateSettingsZodSchema,
};
