import { NextRequest, NextResponse } from 'next/server';
import { getEntry, updateEntry, deleteEntry } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const entry = await getEntry(parseInt(id));

        if (!entry) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json(entry);
    } catch (error) {
        console.error('Error fetching entry:', error);
        return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, content, category_id, is_pinned, is_favorite, tagIds } = body;

        await updateEntry(
            parseInt(id),
            { title, content, category_id, is_pinned, is_favorite },
            tagIds
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating entry:', error);
        return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await deleteEntry(parseInt(id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting entry:', error);
        return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }
}
