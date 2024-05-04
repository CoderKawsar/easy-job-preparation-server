import { z } from "zod";

const addOrUpdateSubjectZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: "title is required!",
    }),
  }),
});

export const SubjectValidation = {
  addOrUpdateSubjectZodSchema,
};
