import { NextRequest, NextResponse } from 'next/server';
import { getAllEntries, createEntry } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const options = {
            search: searchParams.get('search') || undefined,
            categoryId: searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined,
            tagId: searchParams.get('tagId') ? parseInt(searchParams.get('tagId')!) : undefined,
            startDate: searchParams.get('startDate') || undefined,
            endDate: searchParams.get('endDate') || undefined,
            pinnedOnly: searchParams.get('pinnedOnly') === 'true',
            favoriteOnly: searchParams.get('favoriteOnly') === 'true',
        };

        const entries = await getAllEntries(options);
        return NextResponse.json(entries);
    } catch (error) {
        console.error('Error fetching entries:', error);
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, content, category_id, is_pinned, is_favorite, tagIds } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const id = await createEntry(
            { title, content, category_id, is_pinned, is_favorite },
            tagIds
        );

        return NextResponse.json({ id }, { status: 201 });
    } catch (error) {
        console.error('Error creating entry:', error);
        return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }
}
