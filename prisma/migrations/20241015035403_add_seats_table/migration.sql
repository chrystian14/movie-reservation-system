-- CreateTable
CREATE TABLE "seats" (
    "id" TEXT NOT NULL,
    "column" VARCHAR(1) NOT NULL,
    "row" SMALLINT NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "room_id" TEXT NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
