import { NextRequest, NextResponse } from "next/server";
import {
  getProfile,
  getFirstProfile,
  createProfile,
  updateProfile,
} from "@/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const profile = getProfile(id);
      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }
      return NextResponse.json(profile);
    }

    // Default: return the first profile (single-child mode)
    const profile = getFirstProfile();
    if (!profile) {
      return NextResponse.json(null);
    }
    return NextResponse.json(profile);
  } catch (err) {
    console.error("Profile GET error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const profile = createProfile(body);
    return NextResponse.json(profile, { status: 201 });
  } catch (err) {
    console.error("Profile POST error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = getProfile(id);
    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = updateProfile(id, data);
    return NextResponse.json(profile);
  } catch (err) {
    console.error("Profile PUT error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
