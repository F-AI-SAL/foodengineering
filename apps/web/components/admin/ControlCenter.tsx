"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuItem, RiderStatus, Segment, UserRole } from "@/lib/types";
import { apiFetch, apiFetchList } from "@/lib/api";
import { ROLE_CONFIG } from "@/lib/config";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input, Select, Textarea } from "@/components/design-system/Form";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

type SettingRecord = {
  id: string;
  key: string;
  valueJson: Record<string, unknown>;
  updatedAt: string;
};

type RiderRecord = {
  id: string;
  name: string;
  status: RiderStatus;
  currentLat?: number;
  currentLng?: number;
};

type RoleConfigRecord = {
  role: UserRole;
  permissions: Record<string, boolean>;
};

const DEFAULT_FREE_DELIVERY = { promptAt: 600, threshold: 750 };
const DEFAULT_LOYALTY_TIERS = {
  bronze: { minPoints: 0, multiplier: 1 },
  silver: { minPoints: 500, multiplier: 1.25 },
  gold: { minPoints: 1500, multiplier: 1.5 },
  platinum: { minPoints: 5000, multiplier: 2 }
};

const UPSELL_TYPES = [
  { value: "combo", label: "Combo" },
  { value: "cross_sell", label: "Cross-sell" },
  { value: "upsell", label: "Upsell" },
  { value: "free_delivery_progress", label: "Free delivery progress" },
  { value: "premium_upgrade", label: "Premium upgrade" },
  { value: "frequently_bought", label: "Frequently bought" }
];

export function ControlCenter() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [riders, setRiders] = useState<RiderRecord[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>(
    {}
  );

  const [freeDeliveryPrompt, setFreeDeliveryPrompt] = useState(DEFAULT_FREE_DELIVERY.promptAt);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    DEFAULT_FREE_DELIVERY.threshold
  );
  const [loyaltyTiers, setLoyaltyTiers] = useState(DEFAULT_LOYALTY_TIERS);
  const [statusMessages, setStatusMessages] = useState<Record<string, string>>({});

  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [riderName, setRiderName] = useState("");
  const [riderStatus, setRiderStatus] = useState<RiderStatus>("offline");

  const [promoName, setPromoName] = useState("");
  const [promoMinSpend, setPromoMinSpend] = useState(500);
  const [promoType, setPromoType] = useState<"percent" | "fixed" | "free_delivery">("percent");
  const [promoValue, setPromoValue] = useState(10);
  const [promoMaxDiscount, setPromoMaxDiscount] = useState(200);
  const [promoSegmentId, setPromoSegmentId] = useState("all");
  const [promoStackable, setPromoStackable] = useState(true);

  const [couponName, setCouponName] = useState("");
  const [couponType, setCouponType] = useState<"percent" | "fixed" | "free_delivery">("percent");
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinPurchase, setCouponMinPurchase] = useState(300);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState(200);
  const [couponSegmentId, setCouponSegmentId] = useState("all");
  const [couponAutoCode, setCouponAutoCode] = useState(true);
  const [couponStackable, setCouponStackable] = useState(true);
  const [couponCode, setCouponCode] = useState("");

  const [upsellName, setUpsellName] = useState("");
  const [upsellType, setUpsellType] = useState(UPSELL_TYPES[0].value);
  const [upsellThreshold, setUpsellThreshold] = useState(600);
  const [upsellMessage, setUpsellMessage] = useState(
    "Add ৳150 more to unlock free delivery."
  );

  const [experimentName, setExperimentName] = useState("");
  const [experimentHypothesis, setExperimentHypothesis] = useState("");
  const [experimentMetric, setExperimentMetric] = useState("aov");
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

        const settingsMap = settings.reduce<Record<string, Record<string, unknown>>>(
          (acc, item) => {
            acc[item.key] = item.valueJson ?? {};
            return acc;
          },
          {}
        );

        const freeDelivery = settingsMap.free_delivery ?? DEFAULT_FREE_DELIVERY;
        setFreeDeliveryPrompt(
          Number((freeDelivery as any).promptAt ?? DEFAULT_FREE_DELIVERY.promptAt)
        );
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
          status: rider.status as RiderStatus,
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

  useEffect(() => {
    const rider = riders.find((entry) => entry.id === selectedRiderId);
    if (!rider) {
      return;
    }
    setRiderName(rider.name);
    setRiderStatus(rider.status);
  }, [riders, selectedRiderId]);

  const activeMenuItem = useMemo(
    () => menuItems.find((item) => item.id === selectedMenuId) ?? menuItems[0],
    [menuItems, selectedMenuId]
  );

  const handleMenuUpdate = (field: keyof MenuItem, value: MenuItem[keyof MenuItem]) => {
    if (!activeMenuItem) {
      return;
    }
    setMenuItems((prev) =>
      prev.map((item) => (item.id === activeMenuItem.id ? { ...item, [field]: value } : item))
    );
  };

  const updateStatusMessage = (key: string, message: string) => {
    setStatusMessages((prev) => ({ ...prev, [key]: message }));
  };
  const handleSaveFreeDelivery = async () => {
    updateStatusMessage("freeDelivery", "Saving...");
    try {
      await apiFetch("/settings", {
        method: "POST",
        body: JSON.stringify({
          key: "free_delivery",
          valueJson: { promptAt: freeDeliveryPrompt, threshold: freeDeliveryThreshold }
        })
      });
      updateStatusMessage("freeDelivery", "Saved.");
    } catch (saveError) {
      updateStatusMessage("freeDelivery", "Save failed. Try again.");
    }
  };

  const handleSaveLoyalty = async () => {
    updateStatusMessage("loyalty", "Saving...");
    try {
      await apiFetch("/settings", {
        method: "POST",
        body: JSON.stringify({
          key: "loyalty_tiers",
          valueJson: loyaltyTiers
        })
      });
      updateStatusMessage("loyalty", "Saved.");
    } catch (saveError) {
      updateStatusMessage("loyalty", "Save failed. Try again.");
    }
  };

  const handleSaveMenu = async () => {
    if (!activeMenuItem) {
      return;
    }
    updateStatusMessage("menu", "Saving...");
    try {
      await apiFetch(`/menu/${activeMenuItem.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: activeMenuItem.name,
          description: activeMenuItem.description,
          price: Number(activeMenuItem.price),
          category: activeMenuItem.category,
          image: activeMenuItem.image,
          available: activeMenuItem.available,
          prepTime: activeMenuItem.prepTime,
          tags: activeMenuItem.tags
        })
      });
      updateStatusMessage("menu", "Saved.");
    } catch (saveError) {
      updateStatusMessage("menu", "Save failed. Try again.");
    }
  };

  const handleSaveRider = async () => {
    if (!selectedRiderId) {
      return;
    }
    updateStatusMessage("rider", "Saving...");
    try {
      await apiFetch(`/riders/${selectedRiderId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: riderName,
          status: riderStatus
        })
      });
      setRiders((prev) =>
        prev.map((rider) =>
          rider.id === selectedRiderId ? { ...rider, name: riderName, status: riderStatus } : rider
        )
      );
      updateStatusMessage("rider", "Saved.");
    } catch (saveError) {
      updateStatusMessage("rider", "Save failed. Try again.");
    }
  };

  const handleSaveRole = async (role: UserRole) => {
    updateStatusMessage(`role-${role}`, "Saving...");
    try {
      await apiFetch("/roles/config", {
        method: "POST",
        body: JSON.stringify({
          role,
          permissions: rolePermissions[role]
        })
      });
      updateStatusMessage(`role-${role}`, "Saved.");
    } catch (saveError) {
      updateStatusMessage(`role-${role}`, "Save failed.");
    }
  };

  const handleCreatePromotion = async () => {
    updateStatusMessage("promotion", "Publishing...");
    try {
      const conditions = [
        { field: "subtotal", operator: ">=", value: promoMinSpend }
      ] as Array<Record<string, unknown>>;
      if (promoSegmentId !== "all") {
        conditions.push({ field: "segmentIds", operator: "contains", value: promoSegmentId });
      }
      await apiFetch("/promotions", {
        method: "POST",
        body: JSON.stringify({
          name: promoName || "New Promotion",
          description: "Created from Control Center",
          stackable: promoStackable,
          priority: promoStackable ? 2 : 4,
          rulesJson: {
            conditions: { logic: "AND", conditions },
            actions: {
              type: promoType,
              value: promoType === "free_delivery" ? 0 : promoValue,
              maxDiscount: promoType === "percent" ? promoMaxDiscount : undefined
            }
          },
          scheduleJson: { days: ["saturday", "sunday"] },
          maxDiscount: promoType === "percent" ? promoMaxDiscount : undefined
        })
      });
      updateStatusMessage("promotion", "Published.");
    } catch (saveError) {
      updateStatusMessage("promotion", "Publish failed.");
    }
  };

  const handleCreateCoupon = async () => {
    updateStatusMessage("coupon", "Saving...");
    try {
      await apiFetch("/coupons", {
        method: "POST",
        body: JSON.stringify({
          name: couponName || "New Coupon",
          code: couponAutoCode ? undefined : couponCode,
          type: couponType,
          value: couponType === "free_delivery" ? 0 : couponValue,
          minPurchase: couponMinPurchase,
          maxDiscount: couponType === "percent" ? couponMaxDiscount : undefined,
          perUserLimit: 1,
          totalLimit: 500,
          segmentIds: couponSegmentId === "all" ? [] : [couponSegmentId],
          stackable: couponStackable,
          isPublic: couponSegmentId === "all"
        })
      });
      updateStatusMessage("coupon", "Saved.");
    } catch (saveError) {
      updateStatusMessage("coupon", "Save failed.");
    }
  };

  const handleCreateUpsell = async () => {
    updateStatusMessage("upsell", "Saving...");
    try {
      await apiFetch("/growth/upsells", {
        method: "POST",
        body: JSON.stringify({
          name: upsellName || "New Upsell",
          type: upsellType,
          conditionsJson: { threshold: upsellThreshold },
          actionsJson: { message: upsellMessage },
          isActive: true
        })
      });
      updateStatusMessage("upsell", "Saved.");
    } catch (saveError) {
      updateStatusMessage("upsell", "Save failed.");
    }
  };

  const handleCreateExperiment = async () => {
    updateStatusMessage("experiment", "Saving...");
    try {
      await apiFetch("/growth/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: experimentName || "New Experiment",
          hypothesis: experimentHypothesis,
          primaryMetric: experimentMetric,
          trafficSplit: { a: 50, b: 50 }
        })
      });
      updateStatusMessage("experiment", "Saved.");
    } catch (saveError) {
      updateStatusMessage("experiment", "Save failed.");
    }
  };

  const promoPreview = `IF cart >= ৳${promoMinSpend} THEN ${promoType.replace("_", " ")} ${
    promoType === "free_delivery" ? "" : promoValue
  }`;

  if (loading) {
    return <LoadingState message="Loading control center..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }
  return (
    <div className="space-y-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Admin Control Center</h1>
        <p className="text-sm text-muted">
          Simple, guided controls that update the website instantly.
        </p>
      </div>

      <Card title="Quick Start" subtitle="Follow these steps to manage daily operations.">
        <ol className="list-decimal space-y-xs pl-lg text-sm text-muted">
          <li>Update free delivery and loyalty tiers first.</li>
          <li>Edit menu prices and availability.</li>
          <li>Create promotions, coupons, and growth boosts.</li>
          <li>Confirm access rules for each role.</li>
        </ol>
      </Card>

      <div className="grid gap-lg lg:grid-cols-2">
        <Card title="Free Delivery Range" subtitle="Control the progress bar and free delivery goal.">
          <div className="grid gap-md md:grid-cols-2">
            <FieldWrapper label="Show progress after (৳)">
              <Input
                type="number"
                value={freeDeliveryPrompt}
                onChange={(event) => setFreeDeliveryPrompt(Number(event.target.value))}
              />
            </FieldWrapper>
            <FieldWrapper label="Free delivery at (৳)">
              <Input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(event) => setFreeDeliveryThreshold(Number(event.target.value))}
              />
            </FieldWrapper>
          </div>
          <div className="mt-md flex flex-wrap items-center gap-sm">
            <Button variant="primary" onClick={handleSaveFreeDelivery}>
              Save free delivery range
            </Button>
            <p className="text-xs text-muted">{statusMessages.freeDelivery}</p>
          </div>
        </Card>

        <Card title="Loyalty Tier Rules" subtitle="Adjust the points needed for each badge.">
          <div className="grid gap-md md:grid-cols-2">
            {Object.entries(loyaltyTiers).map(([tier, values]) => (
              <div key={tier} className="rounded-lg border border-border bg-surface p-md">
                <p className="text-sm font-semibold capitalize">{tier}</p>
                <div className="mt-sm space-y-sm">
                  <FieldWrapper label="Min points">
                    <Input
                      type="number"
                      value={values.minPoints}
                      onChange={(event) =>
                        setLoyaltyTiers((prev) => ({
                          ...prev,
                          [tier]: {
                            ...prev[tier as keyof typeof prev],
                            minPoints: Number(event.target.value)
                          }
                        }))
                      }
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Points multiplier">
                    <Input
                      type="number"
                      step="0.05"
                      value={values.multiplier}
                      onChange={(event) =>
                        setLoyaltyTiers((prev) => ({
                          ...prev,
                          [tier]: {
                            ...prev[tier as keyof typeof prev],
                            multiplier: Number(event.target.value)
                          }
                        }))
                      }
                    />
                  </FieldWrapper>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-md flex flex-wrap items-center gap-sm">
            <Button variant="primary" onClick={handleSaveLoyalty}>
              Save loyalty tiers
            </Button>
            <p className="text-xs text-muted">{statusMessages.loyalty}</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-lg lg:grid-cols-2">
        <Card title="Menu Editor" subtitle="Update prices and availability with one click.">
          {menuItems.length === 0 ? (
            <EmptyState title="No menu items" description="Create menu items to edit them." />
          ) : (
            <div className="space-y-md">
              <FieldWrapper label="Pick item">
                <Select value={selectedMenuId} onChange={(event) => setSelectedMenuId(event.target.value)}>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FieldWrapper>
              {activeMenuItem ? (
                <div className="grid gap-md md:grid-cols-2">
                  <FieldWrapper label="Name">
                    <Input
                      value={activeMenuItem.name}
                      onChange={(event) => handleMenuUpdate("name", event.target.value)}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Category">
                    <Input
                      value={activeMenuItem.category}
                      onChange={(event) => handleMenuUpdate("category", event.target.value)}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Price (৳)">
                    <Input
                      type="number"
                      value={activeMenuItem.price}
                      onChange={(event) => handleMenuUpdate("price", Number(event.target.value))}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Prep time (min)">
                    <Input
                      type="number"
                      value={activeMenuItem.prepTime}
                      onChange={(event) => handleMenuUpdate("prepTime", Number(event.target.value))}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Availability">
                    <Select
                      value={activeMenuItem.available ? "available" : "unavailable"}
                      onChange={(event) =>
                        handleMenuUpdate("available", event.target.value === "available")
                      }
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </Select>
                  </FieldWrapper>
                  <div className="md:col-span-2">
                    <FieldWrapper label="Description">
                      <Textarea
                        value={activeMenuItem.description}
                        onChange={(event) => handleMenuUpdate("description", event.target.value)}
                      />
                    </FieldWrapper>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-sm">
                <Button variant="primary" onClick={handleSaveMenu}>
                  Save menu item
                </Button>
                <p className="text-xs text-muted">{statusMessages.menu}</p>
              </div>
            </div>
          )}
        </Card>

        <Card title="Rider Editor" subtitle="Update rider name and status instantly.">
          {riders.length === 0 ? (
            <EmptyState title="No riders found" description="Add riders to start managing them." />
          ) : (
            <div className="space-y-md">
              <FieldWrapper label="Pick rider">
                <Select value={selectedRiderId} onChange={(event) => setSelectedRiderId(event.target.value)}>
                  {riders.map((rider) => (
                    <option key={rider.id} value={rider.id}>
                      {rider.name}
                    </option>
                  ))}
                </Select>
              </FieldWrapper>
              <FieldWrapper label="Rider name">
                <Input value={riderName} onChange={(event) => setRiderName(event.target.value)} />
              </FieldWrapper>
              <FieldWrapper label="Status">
                <Select
                  value={riderStatus}
                  onChange={(event) => setRiderStatus(event.target.value as RiderStatus)}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="on_delivery">On delivery</option>
                </Select>
              </FieldWrapper>
              <div className="flex flex-wrap items-center gap-sm">
                <Button variant="primary" onClick={handleSaveRider}>
                  Save rider update
                </Button>
                <p className="text-xs text-muted">{statusMessages.rider}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
      <div className="grid gap-lg lg:grid-cols-2">
        <Card title="Promotion Quick Create" subtitle="Simple IF/THEN offer builder.">
          <div className="grid gap-md md:grid-cols-2">
            <FieldWrapper label="Offer name">
              <Input value={promoName} onChange={(event) => setPromoName(event.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Min spend (৳)">
              <Input
                type="number"
                value={promoMinSpend}
                onChange={(event) => setPromoMinSpend(Number(event.target.value))}
              />
            </FieldWrapper>
            <FieldWrapper label="Discount type">
              <Select value={promoType} onChange={(event) => setPromoType(event.target.value as typeof promoType)}>
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount</option>
                <option value="free_delivery">Free delivery</option>
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Discount value">
              <Input
                type="number"
                value={promoValue}
                onChange={(event) => setPromoValue(Number(event.target.value))}
                disabled={promoType === "free_delivery"}
              />
            </FieldWrapper>
            <FieldWrapper label="Max discount cap (৳)">
              <Input
                type="number"
                value={promoMaxDiscount}
                onChange={(event) => setPromoMaxDiscount(Number(event.target.value))}
                disabled={promoType !== "percent"}
              />
            </FieldWrapper>
            <FieldWrapper label="Target segment">
              <Select value={promoSegmentId} onChange={(event) => setPromoSegmentId(event.target.value)}>
                <option value="all">All customers</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Stacking">
              <Select
                value={promoStackable ? "stackable" : "exclusive"}
                onChange={(event) => setPromoStackable(event.target.value === "stackable")}
              >
                <option value="stackable">Stackable</option>
                <option value="exclusive">Exclusive</option>
              </Select>
            </FieldWrapper>
            <div className="md:col-span-2">
              <FieldWrapper label="Preview">
                <Input value={promoPreview} readOnly />
              </FieldWrapper>
            </div>
          </div>
          <div className="mt-md flex flex-wrap items-center gap-sm">
            <Button variant="primary" onClick={handleCreatePromotion}>
              Publish promotion
            </Button>
            <p className="text-xs text-muted">{statusMessages.promotion}</p>
          </div>
        </Card>

        <Card title="Coupon Quick Create" subtitle="Generate a coupon in seconds.">
          <div className="grid gap-md md:grid-cols-2">
            <FieldWrapper label="Coupon name">
              <Input value={couponName} onChange={(event) => setCouponName(event.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Discount type">
              <Select value={couponType} onChange={(event) => setCouponType(event.target.value as typeof couponType)}>
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount</option>
                <option value="free_delivery">Free delivery</option>
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Discount value">
              <Input
                type="number"
                value={couponValue}
                onChange={(event) => setCouponValue(Number(event.target.value))}
                disabled={couponType === "free_delivery"}
              />
            </FieldWrapper>
            <FieldWrapper label="Minimum spend (৳)">
              <Input
                type="number"
                value={couponMinPurchase}
                onChange={(event) => setCouponMinPurchase(Number(event.target.value))}
              />
            </FieldWrapper>
            <FieldWrapper label="Max discount cap (৳)">
              <Input
                type="number"
                value={couponMaxDiscount}
                onChange={(event) => setCouponMaxDiscount(Number(event.target.value))}
                disabled={couponType !== "percent"}
              />
            </FieldWrapper>
            <FieldWrapper label="Target segment">
              <Select value={couponSegmentId} onChange={(event) => setCouponSegmentId(event.target.value)}>
                <option value="all">All customers</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Stacking">
              <Select
                value={couponStackable ? "stackable" : "exclusive"}
                onChange={(event) => setCouponStackable(event.target.value === "stackable")}
              >
                <option value="stackable">Stackable</option>
                <option value="exclusive">Exclusive</option>
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Code generation">
              <Select
                value={couponAutoCode ? "auto" : "manual"}
                onChange={(event) => setCouponAutoCode(event.target.value === "auto")}
              >
                <option value="auto">Auto-generate</option>
                <option value="manual">Manual code</option>
              </Select>
            </FieldWrapper>
            {!couponAutoCode ? (
              <FieldWrapper label="Manual code">
                <Input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} />
              </FieldWrapper>
            ) : null}
          </div>
          <div className="mt-md flex flex-wrap items-center gap-sm">
            <Button variant="primary" onClick={handleCreateCoupon}>
              Save coupon
            </Button>
            <p className="text-xs text-muted">{statusMessages.coupon}</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-lg lg:grid-cols-2">
        <Card title="Growth Sales Boost" subtitle="Upsell and cross-sell rules.">
          <div className="grid gap-md md:grid-cols-2">
            <FieldWrapper label="Rule name">
              <Input value={upsellName} onChange={(event) => setUpsellName(event.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Type">
              <Select value={upsellType} onChange={(event) => setUpsellType(event.target.value)}>
                {UPSELL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Trigger threshold (৳)">
              <Input
                type="number"
                value={upsellThreshold}
                onChange={(event) => setUpsellThreshold(Number(event.target.value))}
              />
            </FieldWrapper>
            <div className="md:col-span-2">
              <FieldWrapper label="Customer message">
                <Textarea value={upsellMessage} onChange={(event) => setUpsellMessage(event.target.value)} />
              </FieldWrapper>
            </div>
          </div>
          <div className="mt-md flex flex-wrap items-center gap-sm">
            <Button variant="primary" onClick={handleCreateUpsell}>
              Save upsell rule
            </Button>
            <p className="text-xs text-muted">{statusMessages.upsell}</p>
          </div>
        </Card>

        <Card title="A/B Test Setup" subtitle="Create an experiment with one click.">
          <div className="grid gap-md md:grid-cols-2">
            <FieldWrapper label="Experiment name">
              <Input value={experimentName} onChange={(event) => setExperimentName(event.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Primary metric">
              <Select value={experimentMetric} onChange={(event) => setExperimentMetric(event.target.value)}>
                <option value="aov">Average order value</option>
                <option value="conversion">Conversion rate</option>
                <option value="retention">Retention</option>
              </Select>
            </FieldWrapper>
            <div className="md:col-span-2">
              <FieldWrapper label="Hypothesis">
                <Textarea
                  value={experimentHypothesis}
                  onChange={(event) => setExperimentHypothesis(event.target.value)}
                />
              </FieldWrapper>
            </div>
          </div>
          <div className="mt-md flex flex-wrap items-center gap-sm">
            <Button variant="primary" onClick={handleCreateExperiment}>
              Save experiment
            </Button>
            <p className="text-xs text-muted">{statusMessages.experiment}</p>
          </div>
        </Card>
      </div>

      <Card title="Role Access Manager" subtitle="Control what each team can edit.">
        <div className="grid gap-lg lg:grid-cols-2">
          {ROLE_CONFIG.map((role) => (
            <div key={role.role} className="rounded-lg border border-border bg-surface p-md">
              <div className="flex items-center justify-between gap-sm">
                <div>
                  <p className="text-sm font-semibold">{role.label}</p>
                  <p className="text-xs text-muted">{role.description}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleSaveRole(role.role)}>
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
                      onChange={() =>
                        setRolePermissions((prev) => ({
                          ...prev,
                          [role.role]: {
                            ...prev[role.role],
                            [permission.id]: !prev[role.role]?.[permission.id]
                          }
                        }))
                      }
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
    </div>
  );
}
