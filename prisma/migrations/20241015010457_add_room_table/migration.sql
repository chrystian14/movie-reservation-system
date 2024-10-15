-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "rows" SMALLINT NOT NULL,
    "columns" SMALLINT NOT NULL,
    "baseSeatPrice" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);
