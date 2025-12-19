import { NextResponse } from 'next/server';
import { getAllEntries } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'json';

        const entries = await getAllEntries();

        if (format === 'markdown') {
            // Markdownフォーマットでエクスポート
            let markdown = '# 開発日記エクスポート\n\n';
            markdown += `エクスポート日時: ${new Date().toLocaleString('ja-JP')}\n\n`;
            markdown += '---\n\n';

            for (const entry of entries) {
                markdown += `## ${entry.title}\n\n`;
                markdown += `**作成日**: ${new Date(entry.created_at!).toLocaleString('ja-JP')}\n\n`;

                if (entry.category_name) {
                    markdown += `**カテゴリ**: ${entry.category_name}\n\n`;
                }

                if (entry.tags && entry.tags.length > 0) {
                    markdown += `**タグ**: ${entry.tags.map(t => t.name).join(', ')}\n\n`;
                }

                if (entry.is_pinned) {
                    markdown += `📌 ピン留め\n\n`;
                }

                if (entry.is_favorite) {
                    markdown += `⭐ お気に入り\n\n`;
                }

                markdown += `${entry.content}\n\n`;
                markdown += '---\n\n';
            }

            return new NextResponse(markdown, {
                headers: {
                    'Content-Type': 'text/markdown; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="dev-diary-export.md"'
                }
            });
        }

        // JSONフォーマットでエクスポート
        const exportData = {
            exportedAt: new Date().toISOString(),
            totalEntries: entries.length,
            entries: entries.map(entry => ({
                id: entry.id,
                title: entry.title,
                content: entry.content,
                category: entry.category_name,
                tags: entry.tags?.map(t => t.name),
                isPinned: entry.is_pinned,
                isFavorite: entry.is_favorite,
                createdAt: entry.created_at,
                updatedAt: entry.updated_at
            }))
        };

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Disposition': 'attachment; filename="dev-diary-export.json"'
            }
        });
    } catch (error) {
        console.error('Error exporting data:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
