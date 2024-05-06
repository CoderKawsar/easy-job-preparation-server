import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import config from "../../../config";
import pick from "../../../shared/pick";
import { paginationFields } from "../../constants/pagination";
import { userFilterableFields } from "./user.constants";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.registerUser(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.env === "production",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User registered successfully!",
    data: result,
  });
});

const createSuperAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createSuperAdmin(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Super admin created successfully!",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Admin created successfully!",
    data: result,
  });
});

const givePermissionToAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { user_id, permission } = req.body;
    const result = await UserService.givePermissionToAdmin(user_id, permission);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Permission given to admin successfully!",
      data: result,
    });
  }
);

const removePermissionFromAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { user_id, permission } = req.body;
    const result = await UserService.removePermissionFromAdmin(
      user_id,
      permission
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Permission removed from successfully!",
      data: result,
    });
  }
);

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.login(req.body);

  const { refreshToken } = result;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.env === "production",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully!",
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  let token = refreshToken;

  // if refresh token is not present in cookie, then check in body
  if (!token) {
    token = req.body.refreshToken;
  }

  const result = await UserService.refreshToken(token);

  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };

  res.cookie("refreshToken", refreshToken || token, cookieOptions);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User token refreshed successfully!",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await UserService.getAllUsers(filters, paginationOptions);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users fetched in successfully!",
    data: result,
  });
});

const checkPermissionOfAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { user_id, permission } = req.params;

    const result = await UserService.checkPermissionOfAdmin(
      user_id,
      permission
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Permission checked successfully!",
      data: result ? true : false,
    });
  }
);

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const result = await UserService.getSingleUser(user_id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User fetched in successfully!",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const payload = req.body;
  const result = await UserService.updateUser(user_id, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated in successfully!",
    data: result,
  });
});

const changeRoleOfAUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserService.changeRoleOfAUser(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User role updated successfully!",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const result = await UserService.deleteUser(user_id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted in successfully!",
    data: result,
  });
});

export const UserController = {
  registerUser,
  createSuperAdmin,
  createAdmin,
  givePermissionToAdmin,
  removePermissionFromAdmin,
  checkPermissionOfAdmin,
  login,
  refreshToken,
  getAllUsers,
  getSingleUser,
  changeRoleOfAUser,
  updateUser,
  deleteUser,
};
