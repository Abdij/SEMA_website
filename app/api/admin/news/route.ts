import { NextResponse } from "next/server";
import { AdminUnauthorizedError, requireAdminAuth, unauthorizedResponse } from "@/lib/admin";
import { createNewsPost, deleteNewsPost, getAdminNewsPosts, getNewsPostBySlug, updateNewsPost } from "@/lib/db";

function serverErrorResponse(error: unknown) {
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    requireAdminAuth(request);
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      const post = await getNewsPostBySlug(slug);
      if (!post) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      return NextResponse.json(post);
    }

    const posts = await getAdminNewsPosts();
    return NextResponse.json(posts);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireAdminAuth(request);
    const body = await request.json();
    const created = await createNewsPost(body);
    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireAdminAuth(request);
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");
    const body = await request.json();

    if (!slug) {
      return NextResponse.json({ message: "Missing slug" }, { status: 400 });
    }

    const updated = await updateNewsPost(slug, body);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireAdminAuth(request);
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ message: "Missing slug" }, { status: 400 });
    }

    await deleteNewsPost(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}
