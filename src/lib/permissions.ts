import type { AppUserProfile, CategoryRecord, Role } from "@/lib/firebase/types";

type PermissionSubject = AppUserProfile | Role | Role[] | null | undefined;

function rolesFromSubject(subject: PermissionSubject) {
  if (!subject) {
    return [] as Role[];
  }

  if (Array.isArray(subject)) {
    return subject;
  }

  if (typeof subject === "string") {
    return [subject];
  }

  if (subject.roles?.length) {
    return subject.roles;
  }

  if (subject.primaryRole) {
    return [subject.primaryRole];
  }

  if (subject.role) {
    return [subject.role];
  }

  return [] as Role[];
}

export function getPrimaryRole(subject: PermissionSubject) {
  if (!subject) {
    return null;
  }

  if (typeof subject === "string") {
    return subject;
  }

  if (Array.isArray(subject)) {
    return subject[0] ?? null;
  }

  return subject.primaryRole ?? subject.role ?? subject.roles?.[0] ?? null;
}

export function getAvailableRoles(subject: PermissionSubject) {
  const roles = rolesFromSubject(subject);
  return Array.from(new Set(roles));
}

export function getRoleLabel(subject: PermissionSubject) {
  const role = getPrimaryRole(subject);

  if (!role) {
    return "--";
  }

  if (role === "SUPER_ADMIN" || role === "ADMIN") return "Super Admin";
  if (role === "LEADER" || role === "PROXY") return "Leader";
  if (role === "USER") return "User";

  return role
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function getRoleLabels(subject: PermissionSubject) {
  return getAvailableRoles(subject).map((role) => getRoleLabel(role));
}

export function hasRole(subject: PermissionSubject, role: Role) {
  return rolesFromSubject(subject).includes(role);
}

export function isElevatedRole(subject?: PermissionSubject) {
  return hasRole(subject, "SUPER_ADMIN") || hasRole(subject, "LEADER");
}

export function isSuperAdmin(subject?: PermissionSubject) {
  return hasRole(subject, "SUPER_ADMIN");
}

export function isLeader(subject?: PermissionSubject) {
  return hasRole(subject, "LEADER");
}

export function isUser(subject?: PermissionSubject) {
  return hasRole(subject, "USER");
}

export function canManageTeam(subject?: PermissionSubject) {
  return isSuperAdmin(subject);
}

export function canManageMasters(subject?: PermissionSubject) {
  return isSuperAdmin(subject) || isLeader(subject);
}

export function canManageCategory(subject?: PermissionSubject) {
  return isSuperAdmin(subject);
}

export function canViewMemberwiseReport(subject?: PermissionSubject) {
  return isSuperAdmin(subject);
}

export function canManageOrders(subject?: PermissionSubject) {
  return isSuperAdmin(subject) || isLeader(subject);
}

export function getAssignedCategoryIds(profile?: AppUserProfile | null) {
  if (!profile) {
    return [] as string[];
  }

  const assignedIds =
    profile.assignedCategoryIds && profile.assignedCategoryIds.length > 0
      ? profile.assignedCategoryIds
      : (profile.categoryIds || []);

  return Array.from(new Set((assignedIds || []).filter(Boolean)));
}

export function createRoleScopedProfile(
  profile?: AppUserProfile | null,
  activeRole?: Role | null,
) {
  if (!profile) {
    return null;
  }

  const availableRoles = getAvailableRoles(profile);
  const nextRole =
    activeRole && availableRoles.includes(activeRole)
      ? activeRole
      : getPrimaryRole(profile);

  if (!nextRole) {
    return profile;
  }

  return {
    ...profile,
    role: nextRole,
    primaryRole: nextRole,
    roles: [nextRole],
  } satisfies AppUserProfile;
}

export function isActiveProfile(profile?: AppUserProfile | null) {
  return Boolean(profile && profile.active !== false && !profile.deletedAt);
}

export function resolveAccessibleCategoryIds(
  profile?: AppUserProfile | null,
  categories: CategoryRecord[] = [],
) {
  if (!isActiveProfile(profile)) {
    return [] as string[];
  }

  const activeCategoryIds = categories
    .filter((category) => category.active !== false && !category.deletedAt)
    .map((category) => category.id);

  if (isSuperAdmin(profile)) {
    return activeCategoryIds;
  }

  // Users can browse all categories/items in the storefront UI.
  // (Leaders remain scoped to their assigned categories.)
  if (isUser(profile)) {
    return activeCategoryIds;
  }

  const assignedIds = getAssignedCategoryIds(profile);
  return assignedIds.filter((id) => activeCategoryIds.includes(id));
}
