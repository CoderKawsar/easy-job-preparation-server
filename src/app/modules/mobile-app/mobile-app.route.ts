import { Router } from "express";
import { MobileAppController } from "./mobile-app.controller";
import validateRequest from "../../middlewares/validateRequest";
import { MobileAppValidation } from "./mobile-app.validation";

const router = Router();

router.post(
  "/message-to-all",
  validateRequest(MobileAppValidation.sendMessageToAllZodSchema),
  MobileAppController.messageToAll
);

export const MobileAppRoutes = router;
