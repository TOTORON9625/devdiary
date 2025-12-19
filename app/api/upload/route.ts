import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // アップロードディレクトリが存在しない場合は作成
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        // ユニークなファイル名を生成
        const timestamp = Date.now();
        const ext = path.extname(file.name);
        const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // ファイルを保存
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fs.writeFileSync(filepath, buffer);

        // 公開URLを返す
        const url = `/uploads/${filename}`;

        return NextResponse.json({
            url,
            filename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size
        }, { status: 201 });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
