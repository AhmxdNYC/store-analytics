import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/forms/OnboardingForm";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const org = await prisma.organization.findFirst({
    where: { ownerId: session.user.id },
  });

  if (org) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set up your workspace</h1>
        <p className="text-sm text-gray-500 mb-6">
          Tell us about your business and your store locations.
        </p>
        <OnboardingForm />
      </div>
    </main>
  );
}
