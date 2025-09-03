// netlify/edge-functions/msp.js

export default async (request, context) => {
  const roleHeader = request.headers.get("x-user-role") || "";
  const cookieHeader = request.headers.get("cookie") || "";
  const hasRoleCookie = cookieHeader.includes("role=msp");

  if (roleHeader === "msp" || hasRoleCookie) {
    return context.next(); // ✅ Allow access
  }

  return new Response("Access denied: MSPs only.", { status: 403 });
};
