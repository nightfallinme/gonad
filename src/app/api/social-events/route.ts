import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { SocialEvent, SocialEventType } from '@/types/SocialEvent';

export async function POST(request: NextRequest) {
  try {
    const event: SocialEvent = await request.json();
    const filePath = path.join(process.cwd(), 'src', 'data', 'socialEvents.json');
    
    // Mevcut event'leri oku
    const fileContents = await fs.readFile(filePath, 'utf8');
    const socialEventsData = JSON.parse(fileContents);
    
    // Yeni event'i ekle ve son 50'yi tut
    const updatedEvents = [
      {
        ...event,
        type: event.type === SocialEventType.MEME ? 'meme' :
              event.type === SocialEventType.FLEX ? 'flex' :
              'catchphrase'
      }, 
      ...socialEventsData.events
    ].slice(0, 50);
    
    // Dosyayı güncelle
    await fs.writeFile(filePath, JSON.stringify({ events: updatedEvents }, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save social event:', error);
    return NextResponse.json({ success: false, error: 'Failed to save event' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'socialEvents.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const socialEventsData = JSON.parse(fileContents);
    
    return NextResponse.json(socialEventsData.events);
  } catch (error) {
    console.error('Failed to read social events:', error);
    return NextResponse.json({ events: [] });
  }
} 