import { Router } from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import authRole from "../../middlewares/authRole";
import { ENUM_USER_ROLE } from "../../enums/user";
import authUserOrRole from "../../middlewares/authUserOrRole";
import authPermission from "../../middlewares/authPermission";

const router = Router();

// register user
router.post(
  "/",
  validateRequest(UserValidation.registerUserZodSchema),
  UserController.registerUser
);

// create super admin
router.post(
  "/create-super-admin",
  validateRequest(UserValidation.registerUserZodSchema),
  UserController.createSuperAdmin
);

// create admin
router.post(
  "/create-admin",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(UserValidation.registerUserZodSchema),
  UserController.createAdmin
);

// give permission to admin
router.post(
  "/give-permission",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(UserValidation.giveOrRemovePermissionOfAdmin),
  UserController.givePermissionToAdmin
);

// remove permission from admin
router.post(
  "/remove-permission",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(UserValidation.giveOrRemovePermissionOfAdmin),
  UserController.removePermissionFromAdmin
);

// login user
router.post(
  "/login",
  validateRequest(UserValidation.loginUserZodSchema),
  UserController.login
);

// get all users
router.get(
  "/",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  authPermission("user"),
  UserController.getAllUsers
);

// check permission of  admin
router.get(
  "/check-permission/:user_id/:permission",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  UserController.checkPermissionOfAdmin
);

// get single user
router.get(
  "/:user_id",
  authUserOrRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  UserController.getSingleUser
);

// update role of an user
router.patch(
  "/change-role",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(UserValidation.changeRoleOfAUser),
  UserController.changeRoleOfAUser
);

// update user
router.patch(
  "/:user_id",
  authUserOrRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateUser
);

// delete user
router.delete(
  "/:user_id",
  authRole(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  authPermission("user"),

  UserController.deleteUser
);

export const UserRoutes = router;
