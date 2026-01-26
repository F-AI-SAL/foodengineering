"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuItem, RiderStatus, UserRole } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";
import { useControlCenterData } from "./useControlCenterData";
import { FreeDeliveryPanel } from "./FreeDeliveryPanel";
import { LoyaltyPanel } from "./LoyaltyPanel";
import { MenuEditorPanel } from "./MenuEditorPanel";
import { RiderEditorPanel } from "./RiderEditorPanel";
import { PromotionQuickCreatePanel } from "./PromotionQuickCreatePanel";
import { CouponQuickCreatePanel } from "./CouponQuickCreatePanel";
import { UpsellPanel } from "./UpsellPanel";
import { ExperimentPanel } from "./ExperimentPanel";
import { RoleAccessPanel } from "./RoleAccessPanel";

export function ControlCenter() {
  const {
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
    setRiders,
    setRolePermissions,
    setSelectedMenuId,
    setSelectedRiderId,
    setFreeDeliveryPrompt,
    setFreeDeliveryThreshold,
    setLoyaltyTiers
  } = useControlCenterData();

  const [statusMessages, setStatusMessages] = useState<Record<string, string>>({});

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
  const [upsellType, setUpsellType] = useState("combo");
  const [upsellThreshold, setUpsellThreshold] = useState(600);
  const [upsellMessage, setUpsellMessage] = useState(
    "Add à§³150 more to unlock free delivery."
  );

  const [experimentName, setExperimentName] = useState("");
  const [experimentHypothesis, setExperimentHypothesis] = useState("");
  const [experimentMetric, setExperimentMetric] = useState("aov");

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

  const promoPreview = `IF cart >= à§³${promoMinSpend} THEN ${promoType.replace("_", " ")} ${
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
        <p className="text-sm text-muted">Simple, guided controls that update the website instantly.</p>
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
        <FreeDeliveryPanel
          promptAt={freeDeliveryPrompt}
          threshold={freeDeliveryThreshold}
          statusMessage={statusMessages.freeDelivery}
          onPromptChange={setFreeDeliveryPrompt}
          onThresholdChange={setFreeDeliveryThreshold}
          onSave={handleSaveFreeDelivery}
        />
        <LoyaltyPanel
          tiers={loyaltyTiers}
          statusMessage={statusMessages.loyalty}
          onChange={setLoyaltyTiers}
          onSave={handleSaveLoyalty}
        />
      </div>

      <div className="grid gap-lg lg:grid-cols-2">
        <MenuEditorPanel
          items={menuItems}
          selectedId={selectedMenuId}
          activeItem={activeMenuItem}
          statusMessage={statusMessages.menu}
          onSelect={setSelectedMenuId}
          onUpdate={handleMenuUpdate}
          onSave={handleSaveMenu}
        />
        <RiderEditorPanel
          riders={riders}
          selectedId={selectedRiderId}
          riderName={riderName}
          riderStatus={riderStatus}
          statusMessage={statusMessages.rider}
          onSelect={setSelectedRiderId}
          onNameChange={setRiderName}
          onStatusChange={setRiderStatus}
          onSave={handleSaveRider}
        />
      </div>

      <div className="grid gap-lg lg:grid-cols-2">
        <PromotionQuickCreatePanel
          promoName={promoName}
          promoMinSpend={promoMinSpend}
          promoType={promoType}
          promoValue={promoValue}
          promoMaxDiscount={promoMaxDiscount}
          promoSegmentId={promoSegmentId}
          promoStackable={promoStackable}
          promoPreview={promoPreview}
          segments={segments}
          statusMessage={statusMessages.promotion}
          onNameChange={setPromoName}
          onMinSpendChange={setPromoMinSpend}
          onTypeChange={setPromoType}
          onValueChange={setPromoValue}
          onMaxDiscountChange={setPromoMaxDiscount}
          onSegmentChange={setPromoSegmentId}
          onStackableChange={setPromoStackable}
          onPublish={handleCreatePromotion}
        />
        <CouponQuickCreatePanel
          couponName={couponName}
          couponType={couponType}
          couponValue={couponValue}
          couponMinPurchase={couponMinPurchase}
          couponMaxDiscount={couponMaxDiscount}
          couponSegmentId={couponSegmentId}
          couponAutoCode={couponAutoCode}
          couponStackable={couponStackable}
          couponCode={couponCode}
          segments={segments}
          statusMessage={statusMessages.coupon}
          onNameChange={setCouponName}
          onTypeChange={setCouponType}
          onValueChange={setCouponValue}
          onMinPurchaseChange={setCouponMinPurchase}
          onMaxDiscountChange={setCouponMaxDiscount}
          onSegmentChange={setCouponSegmentId}
          onAutoCodeChange={setCouponAutoCode}
          onStackableChange={setCouponStackable}
          onCodeChange={setCouponCode}
          onSave={handleCreateCoupon}
        />
      </div>

      <div className="grid gap-lg lg:grid-cols-2">
        <UpsellPanel
          name={upsellName}
          type={upsellType}
          threshold={upsellThreshold}
          message={upsellMessage}
          statusMessage={statusMessages.upsell}
          onNameChange={setUpsellName}
          onTypeChange={setUpsellType}
          onThresholdChange={setUpsellThreshold}
          onMessageChange={setUpsellMessage}
          onSave={handleCreateUpsell}
        />
        <ExperimentPanel
          name={experimentName}
          hypothesis={experimentHypothesis}
          metric={experimentMetric}
          statusMessage={statusMessages.experiment}
          onNameChange={setExperimentName}
          onHypothesisChange={setExperimentHypothesis}
          onMetricChange={setExperimentMetric}
          onSave={handleCreateExperiment}
        />
      </div>

      <RoleAccessPanel
        rolePermissions={rolePermissions}
        statusMessages={statusMessages}
        onToggle={(role, permissionId) =>
          setRolePermissions((prev) => ({
            ...prev,
            [role]: {
              ...(prev[role] ?? {}),
              [permissionId]: !prev[role]?.[permissionId]
            }
          }))
        }
        onSave={(role) => handleSaveRole(role)}
      />

      {!menuItems.length && !loading ? (
        <Card title="No menu data" subtitle="Menu content is missing from the API.">
          <EmptyState title="Menu empty" description="Create menu items to enable editing." />
        </Card>
      ) : null}
    </div>
  );
}
