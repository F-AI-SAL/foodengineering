import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MenuItem, Segment } from "@/lib/types";
import { apiFetchList } from "@/lib/api";
import { ROLE_CONFIG } from "@/lib/config";
import { DEFAULT_FREE_DELIVERY, DEFAULT_LOYALTY_TIERS } from "./constants";
import type { ControlCenterData, RiderRecord, RoleConfigRecord, SettingRecord } from "./types";

type ControlCenterState = ControlCenterData & {
  loading: boolean;
  error: string | null;
  freeDeliveryPrompt: number;
  freeDeliveryThreshold: number;
  loyaltyTiers: typeof DEFAULT_LOYALTY_TIERS;
  setMenuItems: Dispatch<SetStateAction<MenuItem[]>>;
  setSegments: Dispatch<SetStateAction<Segment[]>>;
  setRiders: Dispatch<SetStateAction<RiderRecord[]>>;
  setRolePermissions: Dispatch<SetStateAction<Record<string, Record<string, boolean>>>>;
  setSelectedMenuId: Dispatch<SetStateAction<string>>;
  setSelectedRiderId: Dispatch<SetStateAction<string>>;
  setFreeDeliveryPrompt: Dispatch<SetStateAction<number>>;
  setFreeDeliveryThreshold: Dispatch<SetStateAction<number>>;
  setLoyaltyTiers: Dispatch<SetStateAction<typeof DEFAULT_LOYALTY_TIERS>>;
};

export const useControlCenterData = (): ControlCenterState => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [riders, setRiders] = useState<RiderRecord[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState("");

  const [freeDeliveryPrompt, setFreeDeliveryPrompt] = useState(DEFAULT_FREE_DELIVERY.promptAt);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(DEFAULT_FREE_DELIVERY.threshold);
  const [loyaltyTiers, setLoyaltyTiers] = useState(DEFAULT_LOYALTY_TIERS);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const [settings, menu, riderRows, segmentRows, roleConfigs] = await Promise.all([
          apiFetchList<SettingRecord>("/settings"),
          apiFetchList<MenuItem>("/menu"),
          apiFetchList<any>("/riders"),
          apiFetchList<Segment>("/segments"),
          apiFetchList<RoleConfigRecord>("/roles/config")
        ]);

        if (!active) {
          return;
        }

        const settingsMap = settings.reduce<Record<string, Record<string, unknown>>>((acc, item) => {
          acc[item.key] = item.valueJson ?? {};
          return acc;
        }, {});

        const freeDelivery = settingsMap.free_delivery ?? DEFAULT_FREE_DELIVERY;
        setFreeDeliveryPrompt(Number((freeDelivery as any).promptAt ?? DEFAULT_FREE_DELIVERY.promptAt));
        setFreeDeliveryThreshold(
          Number((freeDelivery as any).threshold ?? DEFAULT_FREE_DELIVERY.threshold)
        );

        const storedTiers =
          (settingsMap.loyalty_tiers as typeof DEFAULT_LOYALTY_TIERS | undefined) ?? {};
        setLoyaltyTiers({
          bronze: { ...DEFAULT_LOYALTY_TIERS.bronze, ...(storedTiers as any).bronze },
          silver: { ...DEFAULT_LOYALTY_TIERS.silver, ...(storedTiers as any).silver },
          gold: { ...DEFAULT_LOYALTY_TIERS.gold, ...(storedTiers as any).gold },
          platinum: { ...DEFAULT_LOYALTY_TIERS.platinum, ...(storedTiers as any).platinum }
        });

        const normalizedMenu = menu.map((item) => ({
          ...item,
          price: Number(item.price)
        }));
        setMenuItems(normalizedMenu);
        setSelectedMenuId(normalizedMenu[0]?.id ?? "");

        const normalizedRiders = riderRows.map((rider) => ({
          id: rider.user?.id ?? rider.userId ?? rider.id,
          name: rider.user?.name ?? rider.name ?? "Unnamed rider",
          status: rider.status,
          currentLat: rider.currentLat ?? undefined,
          currentLng: rider.currentLng ?? undefined
        }));
        setRiders(normalizedRiders);
        setSelectedRiderId(normalizedRiders[0]?.id ?? "");

        setSegments(segmentRows);

        const defaultPermissions = ROLE_CONFIG.reduce<Record<string, Record<string, boolean>>>(
          (acc, role) => {
            acc[role.role] = role.permissions.reduce<Record<string, boolean>>((permAcc, perm) => {
              permAcc[perm.id] = true;
              return permAcc;
            }, {});
            return acc;
          },
          {}
        );

        const mergedPermissions = roleConfigs.reduce((acc, config) => {
          acc[config.role] = {
            ...(acc[config.role] ?? {}),
            ...(config.permissions ?? {})
          };
          return acc;
        }, defaultPermissions);

        setRolePermissions(mergedPermissions);
        setError(null);
      } catch (loadError) {
        if (active) {
          setError("Unable to load control center data. Please check the API server.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return {
    loading,
    error,
    menuItems,
    segments,
    riders,
    rolePermissions,
    selectedMenuId,
    selectedRiderId,
    freeDeliveryPrompt,
    freeDeliveryThreshold,
    loyaltyTiers,
    setMenuItems,
    setSegments,
    setRiders,
    setRolePermissions,
    setSelectedMenuId,
    setSelectedRiderId,
    setFreeDeliveryPrompt,
    setFreeDeliveryThreshold,
    setLoyaltyTiers
  };
};
