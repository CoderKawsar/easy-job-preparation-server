import { Types } from "mongoose";

export interface ISubscription {
  subcription_duration_in_months: number;
  cost: number;
  name?: string;
  logo?: string;
  description?: string;
  course_id: Types.ObjectId;
}

export interface ISubscriptionFilters {
  searchTerm?: string;
  name?: string;
  subcription_duration_in_months?: number;
  cost?: string;
  course_id?: Types.ObjectId;
}