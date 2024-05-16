import bcrypt from "bcrypt";
import crypto from "crypto";
import { ILoginInfo, IUser, IUserFilters } from "./user.interface";
import { User } from "./user.model";
import { ENUM_USER_ROLE } from "../../enums/user";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { UserUtills } from "./user.utills";
import { userSearchableFields } from "./user.constants";
import { paginationHelpers } from "../../helpers/paginationHelpers";
import { SortOrder, trusted } from "mongoose";
import { IPaginationOptions } from "../../../interfaces/pagination";

// registering user/student
const registerUser = async (userData: IUser) => {
  userData.role = ENUM_USER_ROLE.STUDENT;
  userData.permission = [];

  const createdUser = await UserUtills.createUser(userData);

  // assigning sessionID
  const userWithSessionID = await User.findByIdAndUpdate(
    createdUser?._id,
    {
      sessionID: crypto.randomUUID().toString().slice(0, 16),
    },
    {
      new: true,
    }
  );

  const { accessToken, refreshToken } =
    // @ts-ignore
    await UserUtills.createTokenRefreshTokenForUser(userWithSessionID);

  return { createdUser, accessToken, refreshToken };
};

// create admin
const createAdmin = async (userData: IUser) => {
  userData.role = ENUM_USER_ROLE.ADMIN;
  userData.permission = [];

  const createdUser = await UserUtills.createUser(userData);

  // assigning sessionID
  const userWithSessionID = await User.findByIdAndUpdate(
    createdUser?._id,
    {
      sessionID: crypto.randomUUID().toString().slice(0, 16),
    },
    {
      new: true,
    }
  );

  const { accessToken, refreshToken } =
    // @ts-ignore
    await UserUtills.createTokenRefreshTokenForUser(userWithSessionID);

  return { createdUser, accessToken, refreshToken };
};

// creating super admin
const createSuperAdmin = async (userData: IUser) => {
  userData.role = ENUM_USER_ROLE.SUPER_ADMIN;

  const createdUser = await UserUtills.createUser(userData);

  // assigning sessionID
  const userWithSessionID = await User.findByIdAndUpdate(
    createdUser?._id,
    {
      sessionID: crypto.randomUUID().toString().slice(0, 16),
    },
    {
      new: true,
    }
  );

  const { accessToken, refreshToken } =
    // @ts-ignore
    await UserUtills.createTokenRefreshTokenForUser(userWithSessionID);

  return { createdUser, accessToken, refreshToken };
};

// give permission to a user
const givePermissionToAdmin = async (user_id: string, permission: string) => {
  const user = await User.findById(user_id);
  if (!user || user?.role !== "admin") {
    throw new ApiError(httpStatus.OK, "Enter existing admin only!");
  }

  const updatedUser = await User.findByIdAndUpdate(
    user_id,
    { $addToSet: { permission: permission } },
    { new: true }
  ).select("-password");

  return updatedUser;
};

// remove permission from a user
const removePermissionFromAdmin = async (
  user_id: string,
  permission: string
) => {
  const user = await User.findById(user_id);
  if (!user || user?.role !== "admin") {
    throw new ApiError(httpStatus.OK, "Enter existing admin only!");
  }

  const updatedUser = await User.findByIdAndUpdate(
    user_id,
    { $pull: { permission: permission } },
    { new: true }
  ).select("-password");

  return updatedUser;
};

// login user
const login = async (loginInfo: ILoginInfo) => {
  const { email_or_contact, password } = loginInfo;

  const requestedUser = await User.findOne({
    $or: [
      { contact_no: { $exists: true, $ne: null, $eq: email_or_contact } },
      { email: { $exists: true, $ne: null, $eq: email_or_contact } },
    ],
  });

  if (!requestedUser) {
    throw new ApiError(httpStatus.OK, "User not found!");
  }

  // assigning sessionID
  const userWithSessionID = await User.findByIdAndUpdate(
    requestedUser?._id,
    {
      sessionID: crypto.randomUUID().toString().slice(0, 16),
    },
    {
      new: true,
    }
  );

  // compare password
  const isPasswordMatched = bcrypt.compareSync(
    password,
    requestedUser?.password as string
  );

  // if password doesn't match, throw error
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.OK, "Invalid credentials!");
  }

  const { accessToken, refreshToken } =
    // @ts-ignore
    await UserUtills.createTokenRefreshTokenForUser(userWithSessionID);

  return { isPasswordMatched, accessToken, refreshToken };
};

// get all users
const getAllUsers = async (
  filters: IUserFilters,
  paginationOptions: IPaginationOptions
) => {
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: userSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const sortConditions: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await User.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .select("-password");
  const total = await User.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// check permission of a user
const checkPermissionOfAdmin = async (user_id: string, permission: string) => {
  const user = await User.findById(user_id);
  if (!user || user?.role !== "admin") {
    throw new ApiError(httpStatus.OK, "Enter existing admin only!");
  }

  if (!user?.permission?.length) {
    return false;
  }

  const hasPermission = user?.permission?.includes(permission);

  if (hasPermission) return true;
  else return false;
};

// get single user
const getSingleUser = async (
  user_id: string
): Promise<Omit<IUser, "password">> => {
  const result = await User.findById(user_id).select("-password");

  if (!result) {
    throw new ApiError(httpStatus.OK, "User not found!");
  }
  return result;
};

// update user
const updateUser = async (
  user_id: string,
  payload: Partial<IUser>
): Promise<Omit<IUser, "password">> => {
  payload.permission = [];
  const { role, email, contact_no, ...updatingPayload } = payload;
  const result = await User.findByIdAndUpdate(user_id, updatingPayload, {
    new: true,
  });

  if (!result) {
    throw new ApiError(httpStatus.OK, "User not found!");
  }

  const { password, ...otherData } = result.toObject();
  return otherData;
};

// change role of a user
const changeRoleOfAUser = async (payload: {
  user_id: string;
  role: "admin" | "student";
}): Promise<Omit<IUser, "password">> => {
  const { user_id, role } = payload;
  const result = await User.findByIdAndUpdate(user_id, { role }, { new: true });

  if (!result) {
    throw new ApiError(httpStatus.OK, "User not found!");
  }

  const { password, ...otherData } = result.toObject();
  return otherData;
};

// delete user
const deleteUser = async (user_id: string) => {
  const result = await User.findByIdAndDelete(user_id);

  if (!result) {
    throw new ApiError(httpStatus.OK, "User not found!");
  }

  return result;
};

export const UserService = {
  registerUser,
  createSuperAdmin,
  createAdmin,
  givePermissionToAdmin,
  removePermissionFromAdmin,
  checkPermissionOfAdmin,
  login,
  getAllUsers,
  getSingleUser,
  changeRoleOfAUser,
  updateUser,
  deleteUser,
};
