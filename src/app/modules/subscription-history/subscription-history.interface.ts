import { Types } from "mongoose";

export interface ISubscriptionHistory {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  course_id: Types.ObjectId;
  subscription_id: Types.ObjectId;
  expire_date: Date;
  amount: number;
  payment_ref_id?: string;
  trx_id?: string;
  is_active: boolean;
}

export interface ISubscriptionHistoryFilters {
  searchTerm?: string;
  user_id?: string;
  subscription_id?: number;
  course_id?: string;
  amount?: number;
  is_active?: boolean;
  expire_date?: Date;
}
