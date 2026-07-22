import axios from "axios";

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || "";

export const uploadToImgBB = async (imageBase64: string): Promise<string> => {
  if (!IMGBB_API_KEY) {
    throw new Error("IMGBB API key not configured.");
  }

  const formData = new FormData();
  formData.append("key", IMGBB_API_KEY);
  formData.append("image", imageBase64);

  const response = await axios.post(
    "https://api.imgbb.com/1/upload",
    formData,
    { timeout: 30000 },
  );

  if (!response.data?.data?.url) {
    throw new Error("Upload failed.");
  }

  return response.data.data.url;
};
