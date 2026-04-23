import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const org = await prisma.organization.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!org) redirect("/onboarding");

  return <>{children}</>;
}
