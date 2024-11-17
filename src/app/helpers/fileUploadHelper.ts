import { v2 as cloudinary } from "cloudinary";
import multer, { FileFilterCallback } from "multer";
import config from "../../config";
import { ICloudinaryResponse, IUploadFile } from "../../interfaces/file";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

const storage = multer.memoryStorage();

// Allowed image types
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/svg",
];

// filter file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Only image files are allowed!");
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // @ts-ignore
  fileFilter,
});

const uploadToCloudinary = async (
  file: IUploadFile
): Promise<ICloudinaryResponse | undefined> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "/job-preparation-bd" }, // Optional: Specify folder in Cloudinary
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            // @ts-ignore
            resolve(result);
          }
        }
      )
      // @ts-ignore
      .end(file.buffer); // Directly pass the buffer here
  });
};

const deleteFromCloudinary = async (
  secureUrl: string
): Promise<ICloudinaryResponse | undefined> => {
  return new Promise((resolve, reject) => {
    const parts = secureUrl.split("/");
    if (parts.length > 0) {
      const publicId = parts.pop()?.replace(/\.[^/.]+$/, "");
      if (publicId) {
        cloudinary.uploader.destroy(
          `job-preparation-bd/${publicId}`,
          (error: Error, result: ICloudinaryResponse) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
      } else {
        reject(new Error("Failed to extract publicId"));
      }
    } else {
      reject(new Error("Invalid secureUrl format"));
    }
  });
};

export const FileUploadHelper = {
  uploadToCloudinary,
  deleteFromCloudinary,
  upload,
};
