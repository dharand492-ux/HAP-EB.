// netlify/edge-functions/master-admin.js

export default async (request, context) => {
  const roleHeader = request.headers.get("x-user-role") || "";
  const cookieHeader = request.headers.get("cookie") || "";
  const hasRoleCookie = cookieHeader.includes("role=master-admin");

  if (roleHeader === "master-admin" || hasRoleCookie) {
    return context.next(); // ✅ Allow access
  }

  return new Response("Access denied: Master Admins only.", { status: 403 });
};
