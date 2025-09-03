// netlify/edge-functions/utils/check-role.js

/**
 * Role checking helper for Edge Functions
 * @param {Request} request - The incoming request
 * @param {string|string[]} requiredRoles - A single role or an array of roles
 * @param {ExecutionContext} context - Netlify Edge context
 * @returns {Promise<Response>}
 */
export async function checkRole(request, requiredRoles, context) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  const roleHeader = request.headers.get("x-user-role") || "";
  const cookieHeader = request.headers.get("cookie") || "";

  const hasRole =
    roles.includes(roleHeader) ||
    roles.some((role) => cookieHeader.includes(`role=${role}`));

  if (hasRole) {
    return context.next(); // ✅ Allow access
  }

  return new Response(`Access denied: only [${roles.join(", ")}] allowed.`, {
    status: 403,
  });
}
