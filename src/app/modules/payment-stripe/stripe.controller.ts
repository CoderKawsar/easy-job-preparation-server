import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { Payment } from "../payment/payment.model";
const stripe = require("stripe")(config.stripe.api_key);

const checkoutPayment = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body, "hit");
  const { amount } = req.body;
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
    success_url: `${config.frontend_site_url}/stripe/success`,
    cancel_url: `${config.frontend_site_url}/stripe/cancel`,
  });

  res.json({ url: session.url });
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
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export const PaymentStripeController = {
  checkoutPayment,
  handleWebhook,
};
