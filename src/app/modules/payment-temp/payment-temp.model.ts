import { Schema, model } from "mongoose";
import { IPaymentTemp } from "./payment-temp.interface";

const paymentTempSchema = new Schema<IPaymentTemp>(
  {
    books: { type: String },
    user_id: { type: Schema.Types.ObjectId, required: true },
    shipping_address: { type: String },
    subscription_id: { type: Schema.Types.ObjectId },
    sub_category_id: { type: Schema.Types.ObjectId },
    subscription_duration_in_months: { type: Number },
    exam_id: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export const PaymentTemp = model<IPaymentTemp>(
  "PaymentTemp",
  paymentTempSchema
);
