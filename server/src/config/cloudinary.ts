// src/config/cloudinary.ts

import {
  v2 as cloudinaryV2,
  UploadApiResponse,
  UploadApiOptions,
  DeleteApiResponse,
} from "cloudinary";
import { config } from "./index.js";
import { logger } from "./logger.js";
import { createHttpError } from "../utils/error.factory.js";

cloudinaryV2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

logger.info("✅ Cloudinary configured successfully.");

/**
 * ✅ REWRITTEN: Uploads a file from a buffer to Cloudinary using a stream.
 * This is the correct way to handle files from multer's memoryStorage.
 * @param fileBuffer The buffer containing the file data.
 * @param folder The folder in Cloudinary to upload to.
 * @param publicId Optional public_id for overwriting files.
 * @returns A promise that resolves with the Cloudinary upload response.
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
  publicId?: string
): Promise<UploadApiResponse> => {
  const uploadOptions: UploadApiOptions = {
    folder,
    resource_type: "auto",
    ...(publicId && { public_id: publicId, overwrite: true }),
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryV2.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error({ err: error }, "Cloudinary Upload Stream Error");
          return reject(createHttpError(500, "Cloudinary upload failed."));
        }
        if (result) {
          logger.info(
            { public_id: result.public_id },
            "File successfully uploaded to Cloudinary"
          );
          resolve(result);
        }
      }
    );

    // Write the buffer to the stream and end it.
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an asset from Cloudinary using its public_id.
 * @param publicId The unique public ID of the asset to delete.
 */
export const deleteFromCloudinary = async (
  publicId: string
): Promise<DeleteApiResponse> => {
  try {
    const result = await cloudinaryV2.uploader.destroy(publicId, {
      resource_type: "image",
    });
    logger.info(
      { publicId, result: result.result },
      "Asset successfully deleted from Cloudinary"
    );
    return result;
  } catch (error: any) {
    logger.error({ err: error, publicId }, "Cloudinary Deletion Error");
    throw createHttpError(
      500,
      `Cloudinary deletion failed: ${error.message || "Internal Server Error"}`
    );
  }
};

export { cloudinaryV2 as cloudinary };
