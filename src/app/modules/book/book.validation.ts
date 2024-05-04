import { z } from "zod";

const addBookZodSchema = z.object({
  title: z.string({
    required_error: "Book title is required!",
  }),
  writer: z.string({}).optional(),
  price: z.number({}).optional(),
  discount_price: z.number({}).optional(),
  cover_page: z.string({}).optional(),
  format: z.enum(["pdf", "hard copy"]).refine(
    (value) => {
      return value === "pdf" || value === "hard copy";
    },
    {
      message: "Format type must be either 'pdf' or 'hard copy'",
    }
  ),
  sample_pdf_link: z.string({}).optional(),
  pdf_link: z.string({}).optional(),
  category_id: z.array(z.string({})).optional(),
  sub_category_id: z.array(z.string({})).optional(),
  course_id: z.array(z.string({})).optional(),
  subject_id: z.array(z.string({})),
});

const updateBookZodSchema = z.object({
  title: z.string({}).optional(),
  writer: z.string({}).optional(),
  price: z.number({}).optional(),
  discount_price: z.number({}).optional(),
  cover_page: z.string({}).optional(),
  description: z.string({}).optional(),
  format: z
    .enum(["pdf", "hard copy"])
    .refine(
      (value) => {
        return value === "pdf" || value === "hard copy";
      },
      {
        message: "Format type must be either 'pdf' or 'hard copy'",
      }
    )
    .optional(),
  sample_pdf_link: z.string({}).optional(),
  pdf_link: z.string({}).optional(),
  category_id: z.array(z.string({})).optional(),
  sub_category_id: z.array(z.string({})).optional(),
  course_id: z.array(z.string({})).optional(),
  subject_id: z.array(z.string({})).optional(),
});

export const BookValidation = {
  addBookZodSchema,
  updateBookZodSchema,
};
