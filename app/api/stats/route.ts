import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        const stats = await getStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({
            error: 'Failed to fetch stats',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
