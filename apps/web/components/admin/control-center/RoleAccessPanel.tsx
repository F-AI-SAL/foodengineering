"use client";

import type { UserRole } from "@/lib/types";
import { ROLE_CONFIG } from "@/lib/config";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";

type RoleAccessPanelProps = {
  rolePermissions: Record<string, Record<string, boolean>>;
  statusMessages: Record<string, string>;
  onToggle: (role: UserRole, permissionId: string) => void;
  onSave: (role: UserRole) => void;
};

export const RoleAccessPanel = ({
  rolePermissions,
  statusMessages,
  onToggle,
  onSave
}: RoleAccessPanelProps) => (
  <Card title="Role Access Manager" subtitle="Control what each team can edit.">
    <div className="grid gap-lg lg:grid-cols-2">
      {ROLE_CONFIG.map((role) => (
        <div key={role.role} className="rounded-lg border border-border bg-surface p-md">
          <div className="flex items-center justify-between gap-sm">
            <div>
              <p className="text-sm font-semibold">{role.label}</p>
              <p className="text-xs text-muted">{role.description}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onSave(role.role)}>
              Save role
            </Button>
          </div>
          <div className="mt-md space-y-xs">
            {role.permissions.map((permission) => (
              <label key={permission.id} className="flex items-center justify-between text-xs text-muted">
                <span>{permission.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(rolePermissions[role.role]?.[permission.id])}
                  onChange={() => onToggle(role.role, permission.id)}
                  className="h-sm w-sm"
                />
              </label>
            ))}
          </div>
          <p className="mt-sm text-xs text-muted">{statusMessages[`role-${role.role}`]}</p>
        </div>
      ))}
    </div>
  </Card>
);
