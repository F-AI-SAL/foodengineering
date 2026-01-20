-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_assignedRiderId_idx" ON "Order"("assignedRiderId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Redemption_couponId_idx" ON "Redemption"("couponId");

-- CreateIndex
CREATE INDEX "Redemption_promotionId_idx" ON "Redemption"("promotionId");

-- CreateIndex
CREATE INDEX "Redemption_orderId_idx" ON "Redemption"("orderId");

-- CreateIndex
CREATE INDEX "Redemption_userId_idx" ON "Redemption"("userId");

-- CreateIndex
CREATE INDEX "Redemption_createdAt_idx" ON "Redemption"("createdAt");

-- CreateIndex
CREATE INDEX "Segment_name_idx" ON "Segment"("name");

-- CreateIndex
CREATE INDEX "Segment_isDynamic_createdAt_idx" ON "Segment"("isDynamic", "createdAt");
