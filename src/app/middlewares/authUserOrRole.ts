import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import { jwtHelpers } from "../helpers/jwtHelpers";
import { User } from "../modules/user/user.model";

const authUserOrRole =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(httpStatus.OK, "You are not authorized");
      }
      // verify token
      let verifiedUser = null;

      verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);

      const isUserExist = await User.findById(verifiedUser.userId);

      if (isUserExist?.sessionID !== verifiedUser?.sessionID) {
        throw new ApiError(
          httpStatus.OK,
          "Session expired! New login occured in your account!"
        );
      }

      if (isUserExist) {
        req.user = verifiedUser; // role  , userId
      } else {
        req.user = null;
        throw new ApiError(httpStatus.OK, "User not found!");
      }
      if (
        verifiedUser?.userId === (req?.params?.user_id || req?.query?.user_id)
      ) {
        next();
      } else if (verifiedUser?.userId === req?.params?.user_id) {
        next();
      } else if (
        requiredRoles.length &&
        requiredRoles.includes(verifiedUser.role)
      ) {
        next();
      } else {
        throw new ApiError(httpStatus.OK, "Permission denied!");
      }
    } catch (error) {
      next(error);
    }
  };

export default authUserOrRole;
