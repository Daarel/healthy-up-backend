-- CreateTable
CREATE TABLE "calorieLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "loggedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calorieLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calorieLog_userId_idx" ON "calorieLog"("userId");

-- AddForeignKey
ALTER TABLE "calorieLog" ADD CONSTRAINT "calorieLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
