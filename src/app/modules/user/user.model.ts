import { Schema, model } from "mongoose";
import { IUser } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    contact_no: { type: String, unique: true, required: true, sparse: true },
    role: { type: String, required: true },
    permission: [{ type: String }],
    password: { type: String, required: true },
    sessionID: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export const User = model<IUser>("User", userSchema);
