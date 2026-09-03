import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
  );
}

async function uploadToCloudinary(bytes: Buffer, contentType: string): Promise<string> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  const ext = EXT_BY_TYPE[contentType];
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "booking-platform",
        resource_type: "image",
        public_id: randomUUID(),
        ...(ext === ".gif" ? { format: "gif" } : { transformation: [{ quality: "auto:good" }] }),
      },
      (error, result) => {
        if (error || !result?.secure_url) reject(error ?? new Error("Cloudinary returned no URL"));
        else resolve(result.secure_url);
      }
    );
    Readable.from(bytes).pipe(stream);
  });
}

async function saveLocally(bytes: Buffer, ext: string): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}${ext}`;
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}

export async function POST(request: Request) {
  if (!rateLimit(`upload:${clientIp(request.headers)}`, 30, 10 * 60 * 1000)) {
    return Response.json({ error: "Too many uploads. Please wait a few minutes." }, { status: 429 });
  }
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Image must be 5 MB or smaller." }, { status: 413 });
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return Response.json({ error: "Unsupported format. Use JPG, PNG, WebP, GIF or AVIF." }, { status: 415 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const url = cloudinaryConfigured()
      ? await uploadToCloudinary(bytes, file.type)
      : await saveLocally(bytes, ext);
    return Response.json({ url });
  } catch (e) {
    console.error("upload failed", e);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }
}
