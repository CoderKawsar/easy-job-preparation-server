import { Types } from "mongoose";

export interface IPaymentTemp {
  user_id: Types.ObjectId;
  shipping_address?: string;
  books?: string;
  subscription_id?: Types.ObjectId;
  sub_category_id?: Types.ObjectId;
  subscription_duration_in_months?: number;
  exam_id?: Types.ObjectId;
}
