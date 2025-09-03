// netlify/edge-functions/admin.js

export default async (request, context) => {
  const roleHeader = request.headers.get("x-user-role") || "";
  const cookieHeader = request.headers.get("cookie") || "";
  const hasRoleCookie = cookieHeader.includes("role=admin");

  if (roleHeader === "admin" || hasRoleCookie) {
    return context.next(); // ✅ Allow access
  }

  return new Response("Access denied: Admins only.", { status: 403 });
};
