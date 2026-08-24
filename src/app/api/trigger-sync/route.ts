import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    revalidatePath('/api/catalog');
    
    return NextResponse.json({ success: true, message: 'Sync complete (cache revalidated)' });
  } catch (error: any) {
    console.error("Failed Admin Sync:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
