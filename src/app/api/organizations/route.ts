import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const createOrgSchema = z.object({
  name: z.string().min(1),
  locations: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as unknown;
  const parsed = createOrgSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, locations } = parsed.data;

  const existing = await prisma.organization.findFirst({
    where: { ownerId: session.user.id },
  });
  if (existing) return NextResponse.json({ error: "Organization already exists" }, { status: 409 });

  const org = await prisma.organization.create({
    data: {
      name,
      slug: slugify(name),
      ownerId: session.user.id,
      locations: {
        create: locations.map((locationName) => ({ name: locationName })),
      },
    },
  });

  return NextResponse.json({ orgId: org.id }, { status: 201 });
}
