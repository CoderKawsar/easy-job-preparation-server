import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import ApiError from "../../errors/ApiError";
import { jwtHelpers } from "../helpers/jwtHelpers";
import config from "../../config";
import { User } from "../modules/user/user.model";

const authRole =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(
          httpStatus.OK,
          "You are not authorized! Login first."
        );
      }
      // verify token
      let verifiedUser = null;
      verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);

      const isUserExist = await User.findById(verifiedUser?.userId);

      if (isUserExist?.sessionID !== verifiedUser?.sessionID) {
        throw new ApiError(
          httpStatus.OK,
          "Session expired! New login occured in your account!"
        );
      }

      if (isUserExist) {
        req.user = verifiedUser; // role  , userid
      } else {
        req.user = null;
        throw new ApiError(httpStatus.OK, "User not found!");
      }

      // guard that specific role
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.OK, "Forbidden access!");
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default authRole;
