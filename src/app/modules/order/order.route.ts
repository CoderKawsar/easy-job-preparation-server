import { Router } from "express";
import { OrderController } from "./order.controller";
import validateRequest from "../../middlewares/validateRequest";
import authRole from "../../middlewares/authRole";
import { ENUM_USER_ROLE } from "../../enums/user";
import { OrderValidation } from "./order.validation";
import authUserOrRole from "../../middlewares/authUserOrRole";
import authPermission from "../../middlewares/authPermission";

const router = Router();

// create Order
router.post(
  "/",
  authRole(ENUM_USER_ROLE.STUDENT),
  validateRequest(OrderValidation.createOrderZodSchema),
  OrderController.createOrder
);

// get all Orders
router.get(
  "/",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  authPermission("order"),
  OrderController.getAllOrders
);

// get Orders of an User
router.get(
  "/user/:user_id",
  authUserOrRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  authPermission("order"),
  OrderController.getOrdersOfAnUser
);

// get single Order
router.get(
  "/:id",
  authRole(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.STUDENT
  ),
  OrderController.getSingleOrder
);

// update single Order
router.patch(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  authPermission("order"),
  validateRequest(OrderValidation.updateOrderZodSchema),
  OrderController.updateOrder
);

// delete Order
router.delete(
  "/:id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  authPermission("order"),
  OrderController.deleteOrder
);

export const OrderRoutes = router;
