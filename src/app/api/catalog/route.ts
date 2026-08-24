import { NextResponse } from 'next/server';
import { executeDbQuery } from '@/lib/sqlite-action';



export async function GET() {
  try {
    const [categoriesResult, itemsResult] = await Promise.all([
      executeDbQuery({ action: "getDocs", collection: "categories" }),
      executeDbQuery({ action: "getDocs", collection: "items" })
    ]);

    const categories = (categoriesResult as any[])
      .filter((c: any) => c.active !== false && !c.deletedAt && !c.is_deleted)
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));

    const items = (itemsResult as any[])
      .filter((i: any) => i.active !== false && !i.deletedAt && !i.is_deleted)
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));

    const catalogData = {
      categories,
      items,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(catalogData, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    });
  } catch (error: any) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
