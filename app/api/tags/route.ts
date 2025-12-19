import { NextRequest, NextResponse } from 'next/server';
import { getAllTags, createTag, deleteTag } from '@/lib/db';

export async function GET() {
    try {
        const tags = await getAllTags();
        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, color } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const id = await createTag(name, color || '#8b5cf6');
        return NextResponse.json({ id }, { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await deleteTag(parseInt(id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
    }
}
