// src/middleware/multer.config.ts

import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { createHttpError } from "../utils/error.factory.js";

// ✅ CHANGED: Use memoryStorage to hold files as Buffers in RAM.
const storage = multer.memoryStorage();

// --- Image Upload Configuration ---
const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      createHttpError(
        415,
        `File type ${file.mimetype} is not allowed. Please upload a valid image.`
      )
    );
  }
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});

// --- Document Upload Configuration ---
const documentFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createHttpError(415, `File type ${file.mimetype} is not allowed.`));
  }
};

const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const uploadDocument = multer({
  storage: storage,
  fileFilter: documentFileFilter,
  limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES },
});
