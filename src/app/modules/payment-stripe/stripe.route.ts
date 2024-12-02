import express from "express";
import { PaymentStripeController } from "./stripe.controller";
import authRole from "../../middlewares/authRole";
import { ENUM_USER_ROLE } from "../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { StripePaymentValidation } from "./stripe.validattion";

const router = express.Router();

router.post(
  "/payment/create",
  authRole(ENUM_USER_ROLE.STUDENT),
  // validateRequest(StripePaymentValidation.addStripePaymentZodSchema),
  PaymentStripeController.checkoutPayment
);

router.get("/success", PaymentStripeController.successPayment);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentStripeController.handleWebhook
);

export const PaymentStripeRoutes = router;
