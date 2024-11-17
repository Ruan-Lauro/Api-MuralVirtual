-- CreateTable
CREATE TABLE "NotificationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificationToken" ADD CONSTRAINT "NotificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
