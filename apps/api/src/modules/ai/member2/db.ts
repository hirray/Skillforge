import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export const parseJson = <T>(
  value: string | null | undefined,
  fallback: T
): T => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};
export const fail = (status: number, code: string, message: string): never => {
  throw { status, code, message };
};

export async function actor(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) fail(401, 'UNAUTHENTICATED', 'Choose a valid signed-in account.');
  return user!;
}

export async function admin(id: string) {
  const user = await actor(id);
  const roles = parseJson<string[]>(user.roles, [user.roles]);
  if (!roles.includes('admin'))
    fail(
      403,
      'FORBIDDEN',
      'Analytics is available to platform administrators only.'
    );
  return user;
}

export async function projectAccess(
  id: string,
  userId: string,
  ownerOnly = false
) {
  await actor(userId);
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: { where: { status: 'active' } },
      requirements: true,
      roles: true,
    },
  });
  if (!project) fail(404, 'NOT_FOUND', 'Project not found.');
  if (
    project!.ownerId !== userId &&
    (ownerOnly || !project!.members.some((m) => m.userId === userId))
  )
    fail(
      403,
      'FORBIDDEN',
      ownerOnly
        ? 'Only the project owner can do this.'
        : 'Active project membership is required.'
    );
  return project!;
}
