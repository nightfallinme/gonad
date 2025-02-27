import { NextResponse, NextRequest } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/gladiatorImages.json');
const DEFAULT_IMAGE = '/images/gonad.png';

export async function GET(request: NextRequest) {
  // URL'den image parametresini kontrol et
  const imageUrl = request.nextUrl.searchParams.get('url');
  
  if (imageUrl) {
    // Eğer url parametresi varsa, resmi getir
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return new NextResponse('Failed to fetch image', { status: 500 });
      }
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        headers: { 'Content-Type': 'image/jpeg' }
      });
    } catch {
      return new NextResponse('Failed to fetch image', { status: 500 });
    }
  }

  // URL parametresi yoksa, gladyatör resimlerinin listesini getir
  try {
    const data = await readFile(DB_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ images: {} });
  }
}

export async function POST(request: Request) {
  try {
    const { address, imageUrl, name } = await request.json();
    
    // Mevcut veritabanını oku
    let data;
    try {
      data = JSON.parse(await readFile(DB_PATH, 'utf-8'));
    } catch {
      data = { images: {} };
    }

    // Yeni gladyatör verilerini ekle
    data.images[`gladiator${address}`] = {
      id: address,
      imageUrl: imageUrl || DEFAULT_IMAGE,
      timestamp: new Date().toISOString(),
      name: name || `Gladiator ${address}`
    };

    // Veritabanını güncelle
    await writeFile(DB_PATH, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating gladiator image:', error);
    return NextResponse.json(
      { error: 'Failed to update gladiator image' },
      { status: 500 }
    );
  }
} 