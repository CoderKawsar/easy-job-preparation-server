import { z } from "zod";

const createExamPaymentZodSchema = z.object({
  body: z.object({
    user_id: z.string({
      required_error: "User id is required!",
    }),
    exam_id: z.string({
      required_error: "Exam id is required!",
    }),
    trx_id: z.string({}).optional(),
    payment_ref_id: z.string({}).optional(),
  }),
});

const updateExamPaymentZodSchema = z.object({
  body: z.object({
    user_id: z.string({}).optional(),
    exam_id: z.string({}).optional(),
    invalid_date: z.date({}).optional(),
    trx_id: z.string({}).optional(),
    payment_ref_id: z.string({}).optional(),
  }),
});

export const ExamPaymentValidation = {
  createExamPaymentZodSchema,
  updateExamPaymentZodSchema,
};
