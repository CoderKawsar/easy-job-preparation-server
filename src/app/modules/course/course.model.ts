import { Schema, model } from "mongoose";
import { ICourse } from "./course.interface";

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    author: { type: String },
    membership_type: { type: String, required: true },
    sub_category_id: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    description: { type: String, required: true },
    banner: { type: String },
    syllabus: { type: String },
    routine: { type: String },
    study_materials: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

courseSchema.index(
  { name: 1, author: 1, membership_type: 1, sub_category_id: 1 },
  { unique: true }
);

export const Course = model<ICourse>("Course", courseSchema);
