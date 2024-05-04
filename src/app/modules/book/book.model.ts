import { Schema, model } from "mongoose";
import { IBook } from "./book.interface";

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    writer: { type: String },
    price: { type: Number },
    discount_price: { type: Number },
    description: { type: String },
    cover_page: { type: String },
    format: { type: String, required: true },
    sample_pdf_link: { type: String },
    pdf_link: { type: String },
    category_id: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    sub_category_id: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    course_id: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    subject_id: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

bookSchema.index(
  { title: 1, writer: 1, price: 1, format: 1 },
  { unique: true }
);

export const Book = model<IBook>("Book", bookSchema);
