import { Router } from "express";
import { PaymentController } from "./payment.controller";
import authRole from "../../middlewares/authRole";
import { ENUM_USER_ROLE } from "../../enums/user";

const router = Router();

router.post(
  "/create",
  authRole(ENUM_USER_ROLE.STUDENT),
  PaymentController.paymentCreate
);

export const PaymentRoutes = router;
