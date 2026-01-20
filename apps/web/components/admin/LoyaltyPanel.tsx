"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiFetchList, apiFetchPage } from "@/lib/api";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { FieldWrapper, Input, Select, Textarea } from "@/components/design-system/Form";
import { PaginationControls } from "@/components/design-system/Pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

type LoyaltyTier = {
  tier: string;
  minPoints: number;
  multiplier: number;
};

type LoyaltyMember = {
  userId: string;
  points: number;
  tier: string;
  lifetimeSpend: number;
  orderCount: number;
  lastOrderAt?: string;
  user?: { name: string };
};

type LoyaltyRewards = {
  regularGuestReward: { minOrders: number; maxOrders: number; reward: string };
  birthdayGift: { percent: number; windowDays: number };
  winback: { inactiveDays: number; percent: number; validityDays: number };
};

const DEFAULT_REWARDS: LoyaltyRewards = {
  regularGuestReward: { minOrders: 5, maxOrders: 20, reward: "Bonus points" },
  birthdayGift: { percent: 20, windowDays: 14 },
  winback: { inactiveDays: 60, percent: 25, validityDays: 30 }
};

export function LoyaltyPanel() {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [rewards, setRewards] = useState<LoyaltyRewards>(DEFAULT_REWARDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [customerId, setCustomerId] = useState("");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("reward");

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      apiFetch<LoyaltyTier[]>("/loyalty/tiers"),
      apiFetchPage<LoyaltyMember>("/loyalty/members", {}, page, pageSize),
      apiFetch<{ key: string; valueJson: LoyaltyRewards }>("/settings/loyalty_rewards")
    ])
      .then(([tiersResult, membersResult, rewardsResult]) => {
        if (!active) {
          return;
        }
        if (tiersResult.status === "fulfilled") {
          setTiers(tiersResult.value);
        } else {
          setError("Unable to load loyalty tiers.");
        }
        if (membersResult.status === "fulfilled") {
          setMembers(membersResult.value.data);
          setTotalPages(membersResult.value.totalPages);
          setTotal(membersResult.value.total);
        } else {
          setError("Unable to load loyalty members.");
        }
        if (rewardsResult.status === "fulfilled" && rewardsResult.value?.valueJson) {
          setRewards(rewardsResult.value.valueJson);
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
  }, [page, pageSize]);

  const handleAdjust = async () => {
    setStatusMessage("Saving...");
    try {
      await apiFetch("/loyalty/adjust", {
        method: "POST",
        body: JSON.stringify({ userId: customerId, points, reason })
      });
      setStatusMessage("Updated.");
    } catch (adjustError) {
      setStatusMessage("Update failed.");
    }
  };

  const handleTierChange = (tier: string, field: "minPoints" | "multiplier", value: number) => {
    setTiers((prev) =>
      prev.map((entry) => (entry.tier === tier ? { ...entry, [field]: value } : entry))
    );
  };

  const handleSaveTiers = async () => {
    setStatusMessage("Saving tiers...");
    try {
      const valueJson = tiers.reduce<Record<string, { minPoints: number; multiplier: number }>>((acc, tier) => {
        acc[tier.tier] = { minPoints: tier.minPoints, multiplier: tier.multiplier };
        return acc;
      }, {});
      await apiFetch("/settings", {
        method: "POST",
        body: JSON.stringify({ key: "loyalty_tiers", valueJson })
      });
      setStatusMessage("Tiers saved.");
    } catch (saveError) {
      setStatusMessage("Save failed.");
    }
  };

  const handleSaveRewards = async () => {
    setStatusMessage("Saving rewards...");
    try {
      await apiFetch("/settings", {
        method: "POST",
        body: JSON.stringify({ key: "loyalty_rewards", valueJson: rewards })
      });
      setStatusMessage("Rewards saved.");
    } catch (saveError) {
      setStatusMessage("Save failed.");
    }
  };

  const handleCreateAutomation = async (type: "birthday" | "winback") => {
    setStatusMessage("Creating automation...");
    try {
      const payload =
        type === "birthday"
          ? {
              name: "Birthday Week Gift",
              triggerType: "event",
              triggerConfigJson: { event: "birthday_week", windowDays: rewards.birthdayGift.windowDays },
              actionType: "send_coupon",
              actionConfigJson: { type: "percent", value: rewards.birthdayGift.percent }
            }
          : {
              name: "Inactive Customer Winback",
              triggerType: "condition",
              triggerConfigJson: { inactiveDays: rewards.winback.inactiveDays },
              actionType: "send_coupon",
              actionConfigJson: { type: "percent", value: rewards.winback.percent, validityDays: rewards.winback.validityDays }
            };

      await apiFetch("/automation", {
        method: "POST",
        body: JSON.stringify({ ...payload, isActive: true })
      });
      setStatusMessage("Automation activated.");
    } catch (saveError) {
      setStatusMessage("Automation failed.");
    }
  };

  return (
    <div className="space-y-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Loyalty</h1>
        <p className="text-sm text-muted">Manage points, tiers, and automated rewards.</p>
      </div>

      {loading ? <LoadingState message="Loading loyalty..." /> : null}
      {error ? <ErrorState message={error} /> : null}

      <Card title="Tier Rules" subtitle="Points and tier multipliers.">
        <div className="grid gap-md md:grid-cols-2">
          {tiers.map((tier) => (
            <div key={tier.tier} className="rounded-lg border border-border bg-surface p-md">
              <p className="text-sm font-semibold capitalize">{tier.tier}</p>
              <div className="mt-sm grid gap-sm">
                <FieldWrapper label="Min points">
                  <Input
                    type="number"
                    value={tier.minPoints}
                    onChange={(event) => handleTierChange(tier.tier, "minPoints", Number(event.target.value))}
                  />
                </FieldWrapper>
                <FieldWrapper label="Points multiplier">
                  <Input
                    type="number"
                    value={tier.multiplier}
                    onChange={(event) => handleTierChange(tier.tier, "multiplier", Number(event.target.value))}
                  />
                </FieldWrapper>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-md flex flex-wrap items-center gap-sm">
          <Button variant="primary" onClick={handleSaveTiers}>
            Save tier rules
          </Button>
        </div>
      </Card>

      <Card title="Automated Rewards" subtitle="Configure birthday gifts, winback, and regular guest rewards.">
        <div className="grid gap-md md:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Regular guest reward</p>
            <div className="mt-sm grid gap-sm">
              <FieldWrapper label="Min orders">
                <Input
                  type="number"
                  value={rewards.regularGuestReward.minOrders}
                  onChange={(event) =>
                    setRewards((prev) => ({
                      ...prev,
                      regularGuestReward: { ...prev.regularGuestReward, minOrders: Number(event.target.value) }
                    }))
                  }
                />
              </FieldWrapper>
              <FieldWrapper label="Max orders">
                <Input
                  type="number"
                  value={rewards.regularGuestReward.maxOrders}
                  onChange={(event) =>
                    setRewards((prev) => ({
                      ...prev,
                      regularGuestReward: { ...prev.regularGuestReward, maxOrders: Number(event.target.value) }
                    }))
                  }
                />
              </FieldWrapper>
              <FieldWrapper label="Reward message">
                <Textarea
                  value={rewards.regularGuestReward.reward}
                  onChange={(event) =>
                    setRewards((prev) => ({
                      ...prev,
                      regularGuestReward: { ...prev.regularGuestReward, reward: event.target.value }
                    }))
                  }
                />
              </FieldWrapper>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Birthday week gift</p>
            <div className="mt-sm grid gap-sm">
              <FieldWrapper label="Discount percent">
                <Input
                  type="number"
                  value={rewards.birthdayGift.percent}
                  onChange={(event) =>
                    setRewards((prev) => ({
                      ...prev,
                      birthdayGift: { ...prev.birthdayGift, percent: Number(event.target.value) }
                    }))
                  }
                />
              </FieldWrapper>
              <FieldWrapper label="Gift window (days)">
                <Input
                  type="number"
                  value={rewards.birthdayGift.windowDays}
                  onChange={(event) =>
                    setRewards((prev) => ({
                      ...prev,
                      birthdayGift: { ...prev.birthdayGift, windowDays: Number(event.target.value) }
                    }))
                  }
                />
              </FieldWrapper>
            </div>
            <div className="mt-sm flex flex-wrap gap-sm">
              <Button variant="outline" onClick={() => handleCreateAutomation("birthday")}>
                Activate birthday automation
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Inactive customer winback</p>
            <div className="mt-sm grid gap-sm">
              <FieldWrapper label="Inactive days">
                <Input
                  type="number"
                  value={rewards.winback.inactiveDays}
                  onChange={(event) =>
                    setRewards((prev) => ({
                      ...prev,
                      winback: { ...prev.winback, inactiveDays: Number(event.target.value) }
                    }))
                  }
                />
              </FieldWrapper>
              <FieldWrapper label="Discount percent">
                <Input
                  type="number"
                  value={rewards.winback.percent}
                  onChange={(event) =>
                    setRewards((prev) => ({
                      ...prev,
                      winback: { ...prev.winback, percent: Number(event.target.value) }
                    }))
                  }
                />
              </FieldWrapper>
              <FieldWrapper label="Validity (days)">
                <Input
                  type="number"
                  value={rewards.winback.validityDays}
                  onChange={(event) =>
                    setRewards((prev) => ({
                      ...prev,
                      winback: { ...prev.winback, validityDays: Number(event.target.value) }
                    }))
                  }
                />
              </FieldWrapper>
            </div>
            <div className="mt-sm flex flex-wrap gap-sm">
              <Button variant="outline" onClick={() => handleCreateAutomation("winback")}>
                Activate winback automation
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-md flex flex-wrap items-center gap-sm">
          <Button variant="primary" onClick={handleSaveRewards}>
            Save reward settings
          </Button>
        </div>
      </Card>

      <Card title="Adjust Points" subtitle="Manual point adjustments with audit trail.">
        <div className="grid gap-md md:grid-cols-3">
          <FieldWrapper label="Customer ID">
            <Input value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Points">
            <Input type="number" value={points} onChange={(event) => setPoints(Number(event.target.value))} />
          </FieldWrapper>
          <FieldWrapper label="Reason">
            <Select value={reason} onChange={(event) => setReason(event.target.value)}>
              <option value="reward">Reward</option>
              <option value="correction">Correction</option>
              <option value="promotion">Promotion</option>
            </Select>
          </FieldWrapper>
        </div>
        <div className="mt-md flex flex-wrap items-center gap-sm">
          <Button variant="secondary" onClick={handleAdjust}>Apply adjustment</Button>
          <span className="text-xs text-muted">{statusMessage}</span>
        </div>
      </Card>

      <Card title="Member Directory" subtitle="Track member engagement and tiers.">
        {members.length === 0 ? (
          <EmptyState title="No loyalty members" description="Members will appear here." />
        ) : (
          <div className="space-y-sm">
            {members.map((member) => (
              <div key={member.userId} className="rounded-lg border border-border bg-surface p-md">
                <div className="flex flex-wrap items-center justify-between gap-sm">
                  <div>
                    <p className="text-sm font-semibold">{member.user?.name ?? member.userId}</p>
                    <p className="text-xs text-muted">Tier: {member.tier}</p>
                  </div>
                  <span className="text-xs text-muted">Points: {member.points}</span>
                </div>
                <p className="mt-xs text-xs text-muted">
                  Lifetime spend: ?{Number(member.lifetimeSpend ?? 0)} | Orders: {member.orderCount}
                </p>
              </div>
            ))}
          </div>
        )}
        <PaginationControls
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </Card>
    </div>
  );
}
