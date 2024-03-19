import { Types } from "mongoose";

export interface ICategory {
  _id: string;
  title: string;
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
  subCategory?: {
    _id?: Types.ObjectId;
    title?: string;
    icon?: string;
  }[];
}
