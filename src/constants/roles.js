/** 4 role CrabSense — chuỗi khớp BE `UserRole` enum. */
export const SYSTEM_ADMINISTRATOR_ROLE = "SystemAdministrator";
export const FARM_ADMINISTRATOR_ROLE = "FarmAdministrator";
export const FARM_MANAGER_ROLE = "FarmManager";
export const FARM_STAFF_ROLE = "FarmStaff";

/** @deprecated dùng FARM_ADMINISTRATOR_ROLE */
export const FARM_ADMIN_ROLE = FARM_ADMINISTRATOR_ROLE;

export const FARM_PORTAL_ROLES = [
  FARM_ADMINISTRATOR_ROLE,
  FARM_MANAGER_ROLE,
  FARM_STAFF_ROLE,
];

/** JWT/DB cũ — chỉ dùng khi migrate. */
const LEGACY_FARM_OWNER = "FarmOwner";
const LEGACY_STAFF = "Staff";
const LEGACY_SYSTEM_ADMIN = "SystemAdmin";

export function isSystemAdministratorRole(role) {
  return role === SYSTEM_ADMINISTRATOR_ROLE || role === LEGACY_SYSTEM_ADMIN;
}

export function isFarmPortalRole(role) {
  return (
    FARM_PORTAL_ROLES.includes(role) ||
    role === LEGACY_FARM_OWNER ||
    role === LEGACY_STAFF
  );
}

export function homePathForRole(role) {
  if (isSystemAdministratorRole(role)) return "/system";
  if (isFarmPortalRole(role)) return "/dashboard";
  return "/login";
}
