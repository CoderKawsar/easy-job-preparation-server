import { Types } from "mongoose";

export interface IBook {
  _id: Types.ObjectId;
  title: string;
  writer?: string;
  price?: number;
  discount_price?: number;
  description?: string;
  cover_page?: string;
  format: "pdf" | "hard copy";
  sample_pdf_link?: string;
  pdf_link?: string;
  category_id?: Types.ObjectId[];
  sub_category_id?: Types.ObjectId[];
  course_id?: Types.ObjectId[];
  subject_id?: Types.ObjectId[];
}

export interface IBookFilters {
  searchTerm?: string;
  title?: string;
  writer?: string;
  price?: number;
  discount_price?: number;
  description?: string;
  format?: string;
  sample_pdf_link?: string;
  pdf_link?: string;
  category_id?: Types.ObjectId[];
  sub_category_id?: Types.ObjectId;
  course_id?: Types.ObjectId;
  subject_id?: Types.ObjectId;
}

export interface MatchStage {
  $match: {
    [key: string]: any; // Allow any field for flexibility
    $or?: OrClause[];
  };
}

export interface OrClause {
  [field: string]: {
    $regex: string;
    $options: string;
  };
}
