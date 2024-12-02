import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { Payment } from "../payment/payment.model";
import { PaymentTemp } from "../payment-temp/payment-temp.model";
import { ShippingAddress } from "../shipping-address/shipping-address.model";
import { Order } from "../order/order.model";
import { OrderController } from "../order/order.controller";
import { OrderService } from "../order/order.service";
import { SubscriptionHistoryService } from "../subscription-history/subscription-history.service";
import { CourseService } from "../course/course.service";
import { ExamPaymentService } from "../exam-payment/exam-payment.service";
const stripe = require("stripe")(config.stripe.api_key);

const checkoutPayment = catchAsync(async (req: Request, res: Response) => {
  const {
    amount,
    shipping_address,
    books,
    subscription_id,
    sub_category_id,
    subscription_duration_in_months,
    exam_id,
  } = req.body;

  const temporaryPayment = await PaymentTemp.create({
    books: JSON.stringify(books),
    user_id: req?.user?.userId,
    shipping_address: JSON.stringify(shipping_address),
    subscription_id: subscription_id,
    sub_category_id,
    subscription_duration_in_months,
    exam_id,
  });

  if (shipping_address) {
    const parsedShippingAddress = JSON.parse(shipping_address);
    if (parsedShippingAddress?.is_default) {
      await ShippingAddress.updateOne(
        {
          user_id: req?.user?.userId,
        },
        parsedShippingAddress,
        {
          upsert: true,
        }
      );
    }
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Total_Payment",
          },
          unit_amount: Number(amount) * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${config.this_site_url}/api/v1/stripe/success?session_id={CHECKOUT_SESSION_ID}&temporary_payment_id=${temporaryPayment?._id}`,
    cancel_url: `${config.frontend_site_url}/stripe/cancel`,
  });

  res.json({ url: session.url });
});

const successPayment = catchAsync(async (req: Request, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );
    if (session?.payment_status === "paid") {
      const { temporary_payment_id } = req.query;
      const temporaryPayment = await PaymentTemp.findById(temporary_payment_id);

      const payment = await Payment.create({
        trxID: session.payment_intent,
        paymentID: session.id,
        amount: (session.amount_total / 100).toString(), // Convert from cents to dollars
        customerMsisdn:
          session.customer_details?.phone ||
          session.customer_details?.email ||
          "",
      });
      if (temporaryPayment?.books) {
        await OrderService.createOrder(temporaryPayment?.user_id.toString(), {
          trx_id: payment?.trxID,
          paymentID: payment.paymentID,
          payment_ref_id: payment.payment_ref_id,
          books: JSON.parse(temporaryPayment?.books),
          shipping_address: temporaryPayment?.shipping_address,
        });
      } else if (temporaryPayment?.subscription_id) {
        await SubscriptionHistoryService.createSubscriptionHistory({
          user_id: temporaryPayment?.user_id,
          payment_ref_id: payment?.payment_ref_id,
          trx_id: payment?.trxID,
          subscription_id: temporaryPayment?.subscription_id,
          amount: Number(payment?.amount),
        });
      } else if (temporaryPayment?.sub_category_id) {
        await CourseService.BuyAllCoursesOfASubCategory({
          user_id: temporaryPayment?.user_id.toString(),
          sub_category_id: temporaryPayment?.sub_category_id.toString(),
          subscription_duration_in_months: Number(
            temporaryPayment?.subscription_duration_in_months || 0
          ).toString(),
          trx_id: payment?.trxID,
          payment_ref_id: payment?.payment_ref_id,
        });
      } else if (temporaryPayment?.exam_id) {
        await ExamPaymentService.createExamPayment({
          user_id: temporaryPayment?.user_id,
          exam_id: temporaryPayment?.exam_id,
          trx_id: payment?.trxID,
          payment_ref_id: payment?.payment_ref_id,
        });
      }

      await PaymentTemp.findByIdAndDelete(temporary_payment_id);
      res.redirect(`${config.frontend_site_url}/stripe/success`);
    }
  } catch (error) {
    res.redirect(`${config.frontend_site_url}/stripe/error`);
  }
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = config.stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Stripe Webhook Error!`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      // Save payment information to database
      await Payment.create({
        trxID: session.payment_intent,
        paymentID: session.id,
        amount: (session.amount_total / 100).toString(), // Convert from cents to dollars
        customerMsisdn:
          session.customer_details?.phone ||
          session.customer_details?.email ||
          "",
      });
      break;
    default:
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Unhandled event type ${event.type}`
      );
  }

  res.json({ received: true });
});

export const PaymentStripeController = {
  checkoutPayment,
  successPayment,
  handleWebhook,
};
