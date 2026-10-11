import { cookies } from "next/headers";
import { verifyToken, TokenPayload } from "./jwt";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";

export const AUTH_COOKIE_NAME = "hostelhub_session";

export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  await connectDB();
  const user = await User.findById(session.userId)
    .select("-passwordHash")
    .lean();

  if (!user || !user.isActive) return null;
  return {
    ...user,
    _id: user._id.toString(),
  };
}

export async function requireAuth(): Promise<TokenPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin(): Promise<TokenPayload> {
  const session = await requireAuth();
  if (session.role !== "admin" && session.role !== "warden") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireStudent(): Promise<TokenPayload> {
  const session = await requireAuth();
  if (session.role !== "student") {
    throw new Error("FORBIDDEN");
  }
  return session;
}
