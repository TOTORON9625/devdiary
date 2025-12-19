import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // デフォルトカテゴリ
    const categories = [
        { name: '開発', color: '#3b82f6' },
        { name: 'バグ修正', color: '#ef4444' },
        { name: '学習', color: '#10b981' },
        { name: 'メモ', color: '#f59e0b' },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        });
    }

    // デフォルトタグ
    const tags = [
        { name: '重要', color: '#ef4444' },
        { name: '進行中', color: '#f59e0b' },
        { name: '完了', color: '#10b981' },
        { name: 'レビュー待ち', color: '#8b5cf6' },
    ];

    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { name: tag.name },
            update: {},
            create: tag,
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
