-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category" USING GIN ("name" gin_trgm_ops);
