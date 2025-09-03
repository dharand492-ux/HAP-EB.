// netlify/edge-functions/tl.js

export default async (request, context) => {
  const roleHeader = request.headers.get("x-user-role") || "";
  const cookieHeader = request.headers.get("cookie") || "";
  const hasRoleCookie = cookieHeader.includes("role=tl");

  if (roleHeader === "tl" || hasRoleCookie) {
    return context.next(); // ✅ Allow access
  }

  return new Response("Access denied: Team Leads only.", { status: 403 });
};
