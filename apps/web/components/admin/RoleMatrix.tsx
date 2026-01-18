"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ROLE_CONFIG } from "@/lib/config";
import type { UserRole } from "@/lib/types";
import { Card } from "@/components/design-system/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

type RoleConfigRecord = {
  role: UserRole;
  permissions: Record<string, boolean>;
};

export function RoleMatrix() {
  const [roleConfigs, setRoleConfigs] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<RoleConfigRecord[]>("/roles/config")
      .then((data) => {
        if (!active) {
          return;
        }
        const configMap = data.reduce<Record<string, Record<string, boolean>>>((acc, item) => {
          acc[item.role] = item.permissions ?? {};
          return acc;
        }, {});
        setRoleConfigs(configMap);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setError("Unable to load role permissions.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card title="Roles & Permissions" subtitle="Granular access control by role.">
      {loading ? <LoadingState message="Loading roles..." /> : null}
      {error ? <ErrorState message={error} /> : null}
      <div className="space-y-lg">
        {!ROLE_CONFIG.length ? (
          <EmptyState title="No roles" description="Add roles to manage access." />
        ) : (
          ROLE_CONFIG.map((role) => (
            <div key={role.role} className="rounded-lg border border-border bg-surface-alt p-md">
              <div>
                <p className="text-sm font-semibold">{role.label}</p>
                <p className="text-xs text-muted">{role.description}</p>
              </div>
              <div className="mt-md grid gap-sm md:grid-cols-2">
                {role.permissions.map((permission) => (
                  <div key={permission.id} className="rounded-md border border-border bg-surface p-sm">
                    <div className="flex items-center justify-between gap-sm">
                      <p className="text-xs font-semibold">{permission.label}</p>
                      <span className="text-[11px] text-muted">
                        {roleConfigs[role.role]?.[permission.id] ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{permission.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
