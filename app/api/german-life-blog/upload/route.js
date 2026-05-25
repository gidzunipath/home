import { NextResponse } from "next/server";
import { requireAdminAuth, updateSessionActivity } from "../../../../lib/adminAuth";
import { uploadBlogImage } from "../../../../lib/blogApi";
import {
  BLOG_IMAGE_MAX_BYTES,
  BLOG_IMAGE_ALLOWED_MIME_TYPES,
} from "../../../../lib/blogConstants";

export async function POST(request) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.isAuthorized) return auth.response;

    const sessionToken = request.cookies?.get?.("admin_session")?.value;
    if (sessionToken) await updateSessionActivity(sessionToken);

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "content";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > BLOG_IMAGE_MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: "Image must be 10 MB or smaller" },
        { status: 400 }
      );
    }

    if (file.type && !BLOG_IMAGE_ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Unsupported image type" },
        { status: 400 }
      );
    }

    const { url, path } = await uploadBlogImage(file, String(folder));

    return NextResponse.json({ success: true, url, path });
  } catch (error) {
    console.error("POST /api/german-life-blog/upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
