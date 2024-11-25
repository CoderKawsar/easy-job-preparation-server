import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import authRole from "../../middlewares/authRole";
import { ENUM_USER_ROLE } from "../../enums/user";
import { SettingsValidation } from "./settings.validation";
import { SettingsController } from "./settings.controller";

const router = Router();

// create Settings
router.post(
  "/",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SettingsValidation.addSettingsZodSchema),
  SettingsController.addSettings
);

// get all Settings
router.get(
  "/",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  SettingsController.getAllSettings
);

// get shipping charge inside dhaka
router.get(
  "/shipping-charge-inside-dhaka",
  SettingsController.getShippingChargeInsideDhaka
);

// get shipping charge outside dhaka
router.get(
  "/shipping-charge-outside-dhaka",
  SettingsController.getShippingChargeOutsideDhaka
);

// get single Settings
router.get(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  SettingsController.getSingleSettings
);

// update shipping charge
router.patch(
  "/shipping-charge",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SettingsValidation.addOrEditShippingChargeZodSchema),
  SettingsController.addOrEditShippingCharge
);

// update single Settings
router.patch(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SettingsValidation.updateSettingsZodSchema),
  SettingsController.updateSettings
);

// delete single Settings
router.delete(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  SettingsController.deleteSettings
);

export const SettingsRoutes = router;
