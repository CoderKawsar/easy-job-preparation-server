import { Types } from "mongoose";

export interface IOrderStatus {
  user_id: Types.ObjectId;
  order_details_id: Types.ObjectId;
  status:
    | "Pending Approve"
    | "Approved"
    | "Preparing"
    | "On The Way"
    | "Delivered";
  shipping_address_id: Types.ObjectId;
}

export interface IOrderStatusFilters {
  searchTerm?: string;
  user_id?: Types.ObjectId;
  order_details_id?: Types.ObjectId;
  status?:
    | "Pending Approve"
    | "Approved"
    | "Preparing"
    | "On The Way"
    | "Did Not Receive"
    | "Delivered";
  shipping_address_id?: Types.ObjectId;
}