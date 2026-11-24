/** 4 role CrabSense — chuỗi khớp BE `UserRole` enum. */
export const SYSTEM_ADMINISTRATOR_ROLE = "SystemAdministrator";
export const FARM_ADMINISTRATOR_ROLE = "FarmAdministrator";
export const FARM_MANAGER_ROLE = "FarmManager";
export const FARM_STAFF_ROLE = "FarmStaff";

/** @deprecated dùng FARM_ADMINISTRATOR_ROLE */
export const FARM_ADMIN_ROLE = FARM_ADMINISTRATOR_ROLE;

// Web is exclusively for administrators. Manager uses Desktop; Staff uses Mobile.
export const FARM_PORTAL_ROLES = [FARM_ADMINISTRATOR_ROLE];

export function isSystemAdministratorRole(role) {
  return role === SYSTEM_ADMINISTRATOR_ROLE;
}

export function isFarmPortalRole(role) {
  return FARM_PORTAL_ROLES.includes(role);
}

export function canUseWeb(role) {
  return isSystemAdministratorRole(role) || isFarmPortalRole(role);
}

export function homePathForRole(role) {
  if (isSystemAdministratorRole(role)) return "/system";
  if (isFarmPortalRole(role)) return "/dashboard";
  return "/login";
}
