import { IPayment } from "./payment.interface";
import { Payment } from "./payment.model";

const paymentCreate = async (payload: IPayment) => {
  const result = Payment.create(payload);
  return result;
};

export const PaymentService = {
  paymentCreate,
};
