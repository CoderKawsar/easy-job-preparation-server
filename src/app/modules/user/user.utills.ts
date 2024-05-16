import bcrypt from "bcrypt";
import config from "../../../config";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import { jwtHelpers } from "../../helpers/jwtHelpers";

const createUser = async (userData: IUser) => {
  const { password, ...otherData } = userData;

  // Generate a salt synchronously
  const saltRounds = parseInt(config.jwt.bcrypt_salt_rounds as string) || 12;
  const salt = bcrypt.genSaltSync(saltRounds);

  // Hash the password synchronously
  const hashedPassword = bcrypt.hashSync(password, salt);

  const result = await User.create({ ...otherData, password: hashedPassword });

  const { password: createdPass, ...dataWithoutPassword } = result.toObject();
  return dataWithoutPassword;
};

const createTokenRefreshTokenForUser = async (
  user: IUser | Omit<IUser, "password">
) => {
  // creating payload for token
  const payload = {
    userId: user._id,
    role: user.role,
    permission: user.permission,
    sessionID: user.sessionID,
  };

  // creating access token
  const accessToken = jwtHelpers.createToken(
    payload,
    config.jwt.secret as string,
    config.jwt.expires_in as string
  );

  // creating refresh token
  const refreshToken = jwtHelpers.createToken(
    payload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string
  );

  return { accessToken, refreshToken };
};

export const UserUtills = {
  createUser,
  createTokenRefreshTokenForUser,
};
