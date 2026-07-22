import { Request, Response } from "express";
import { uploadToImgBB } from "../utils/imgBBUploader";

// POST /api/upload — upload image to imgBB
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "No image data provided." });
    }

    const url = await uploadToImgBB(image);
    res.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    res.status(500).json({ message });
  }
};
