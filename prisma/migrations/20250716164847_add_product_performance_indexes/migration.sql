-- CreateIndex
CREATE INDEX "Product_shopId_createdAt_idx" ON "Product"("shopId", "createdAt");

-- CreateIndex
CREATE INDEX "Product_shopId_name_idx" ON "Product"("shopId", "name");

-- CreateIndex
CREATE INDEX "Product_shopId_categoryId_idx" ON "Product"("shopId", "categoryId");
