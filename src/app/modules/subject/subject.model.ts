import { Schema, model } from "mongoose";
import { ISubject } from "./subject.interface";

const subjectSchema = new Schema<ISubject>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export const Subject = model<ISubject>("Subject", subjectSchema);
