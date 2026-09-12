-- CreateTable
CREATE TABLE "TryOnWatch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "overlayUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "productId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TryOnWatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TryOnWatch_slug_key" ON "TryOnWatch"("slug");

-- AddForeignKey
ALTER TABLE "TryOnWatch" ADD CONSTRAINT "TryOnWatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
