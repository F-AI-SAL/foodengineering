import type { MenuItem, RiderStatus, Segment, UserRole } from "@/lib/types";

export type SettingRecord = {
  id: string;
  key: string;
  valueJson: Record<string, unknown>;
  updatedAt: string;
};

export type RiderRecord = {
  id: string;
  name: string;
  status: RiderStatus;
  currentLat?: number;
  currentLng?: number;
};

export type RoleConfigRecord = {
  role: UserRole;
  permissions: Record<string, boolean>;
};

export type ControlCenterData = {
  menuItems: MenuItem[];
  segments: Segment[];
  riders: RiderRecord[];
  rolePermissions: Record<string, Record<string, boolean>>;
  selectedMenuId: string;
  selectedRiderId: string;
};
