import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { uploadFileToServer } from "@/app/lib/uploadHelper";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "documents";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Use the provided folder or default to 'documents'
    const url = await uploadFileToServer(file, folder);

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("[UPLOAD_API_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
