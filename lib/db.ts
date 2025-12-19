import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ===== Types =====

export interface EntryWithRelations {
  id: number;
  title: string;
  content: string | null;
  categoryId: number | null;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: number;
    name: string;
    color: string;
  } | null;
  tags?: {
    tag: {
      id: number;
      name: string;
      color: string;
    };
  }[];
}

// ===== Entry CRUD =====

export async function getAllEntries(options?: {
  search?: string;
  categoryId?: number;
  tagId?: number;
  startDate?: string;
  endDate?: string;
  pinnedOnly?: boolean;
  favoriteOnly?: boolean;
}) {
  const where: Record<string, unknown> = {};

  if (options?.search) {
    where.OR = [
      { title: { contains: options.search, mode: 'insensitive' } },
      { content: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  if (options?.categoryId) {
    where.categoryId = options.categoryId;
  }

  if (options?.tagId) {
    where.tags = {
      some: { tagId: options.tagId },
    };
  }

  if (options?.startDate) {
    where.createdAt = { ...((where.createdAt as object) || {}), gte: new Date(options.startDate) };
  }

  if (options?.endDate) {
    where.createdAt = { ...((where.createdAt as object) || {}), lte: new Date(options.endDate) };
  }

  if (options?.pinnedOnly) {
    where.isPinned = true;
  }

  if (options?.favoriteOnly) {
    where.isFavorite = true;
  }

  const entries = await prisma.entry.findMany({
    where,
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  });

  return entries.map(formatEntry);
}

export async function getEntry(id: number) {
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return entry ? formatEntry(entry) : null;
}

export async function createEntry(
  data: {
    title: string;
    content?: string;
    category_id?: number | null;
    is_pinned?: boolean;
    is_favorite?: boolean;
  },
  tagIds?: number[]
) {
  const entry = await prisma.entry.create({
    data: {
      title: data.title,
      content: data.content || '',
      categoryId: data.category_id || null,
      isPinned: data.is_pinned || false,
      isFavorite: data.is_favorite || false,
      tags: tagIds?.length
        ? {
          create: tagIds.map((tagId) => ({ tagId })),
        }
        : undefined,
    },
  });

  return entry.id;
}

export async function updateEntry(
  id: number,
  data: {
    title?: string;
    content?: string;
    category_id?: number | null;
    is_pinned?: boolean;
    is_favorite?: boolean;
  },
  tagIds?: number[]
) {
  await prisma.entry.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      categoryId: data.category_id,
      isPinned: data.is_pinned,
      isFavorite: data.is_favorite,
    },
  });

  if (tagIds !== undefined) {
    await prisma.entryTag.deleteMany({ where: { entryId: id } });
    if (tagIds.length > 0) {
      await prisma.entryTag.createMany({
        data: tagIds.map((tagId) => ({ entryId: id, tagId })),
      });
    }
  }
}

export async function deleteEntry(id: number) {
  await prisma.entry.delete({ where: { id } });
}

// ===== Tag CRUD =====

export async function getAllTags() {
  return prisma.tag.findMany({ orderBy: { name: 'asc' } });
}

export async function createTag(name: string, color: string) {
  const tag = await prisma.tag.create({
    data: { name, color },
  });
  return tag.id;
}

export async function deleteTag(id: number) {
  await prisma.tag.delete({ where: { id } });
}

// ===== Category CRUD =====

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function createCategory(name: string, color: string) {
  const category = await prisma.category.create({
    data: { name, color },
  });
  return category.id;
}

export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } });
}

// ===== Statistics =====

export async function getStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalEntries,
    thisMonthEntries,
    pinnedEntries,
    favoriteEntries,
    entriesByCategory,
    entriesByTag,
  ] = await Promise.all([
    prisma.entry.count(),
    prisma.entry.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.entry.count({ where: { isPinned: true } }),
    prisma.entry.count({ where: { isFavorite: true } }),
    prisma.category.findMany({
      include: { _count: { select: { entries: true } } },
    }),
    prisma.tag.findMany({
      include: { _count: { select: { entries: true } } },
    }),
  ]);

  return {
    totalEntries,
    thisMonthEntries,
    pinnedEntries,
    favoriteEntries,
    entriesByCategory: entriesByCategory.map((c) => ({
      name: c.name,
      count: c._count.entries,
      color: c.color,
    })),
    entriesByTag: entriesByTag.map((t) => ({
      name: t.name,
      count: t._count.entries,
      color: t.color,
    })),
  };
}

// ===== Helper Functions =====

function formatEntry(entry: EntryWithRelations) {
  return {
    id: entry.id,
    title: entry.title,
    content: entry.content,
    category_id: entry.categoryId,
    is_pinned: entry.isPinned,
    is_favorite: entry.isFavorite,
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString(),
    category_name: entry.category?.name,
    category_color: entry.category?.color,
    tags: entry.tags?.map((et) => ({
      id: et.tag.id,
      name: et.tag.name,
      color: et.tag.color,
    })),
  };
}
