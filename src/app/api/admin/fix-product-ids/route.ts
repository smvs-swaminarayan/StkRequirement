import { NextResponse } from 'next/server';
import { executeDbQuery } from '@/lib/sqlite-action';

export async function GET() {
  try {
    const items = await executeDbQuery({ action: "getDocs", collection: "items" }) as any[];
    
    // Sort by numeric id ascending to preserve creation order
    items.sort((a, b) => Number(a.id) - Number(b.id));

    let maxNum = 0;
    const usedPds = new Set<string>();
    const fixedItems: Array<{ id: number; name: string; oldPd: string; newPd: string }> = [];

    // First pass: find existing valid non-duplicate PDs
    for (const item of items) {
      const match = String(item.productId || '').match(/^PD(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!usedPds.has(item.productId)) {
          usedPds.add(item.productId);
          if (num > maxNum) maxNum = num;
        }
      }
    }

    // Second pass: fix duplicates or missing PDs
    const seen = new Set<string>();
    for (const item of items) {
      const pd = String(item.productId || '').trim();
      const match = pd.match(/^PD(\d+)$/i);
      
      if (!match || seen.has(pd)) {
        maxNum++;
        const newPd = `PD${String(maxNum).padStart(3, '0')}`;
        seen.add(newPd);
        fixedItems.push({ id: Number(item.id), name: item.name, oldPd: pd, newPd });
        
        await executeDbQuery({
          action: "setDoc",
          collection: "items",
          id: item.id,
          data: { productId: newPd }
        });
      } else {
        seen.add(pd);
      }
    }

    return NextResponse.json({
      success: true,
      totalItems: items.length,
      fixedCount: fixedItems.length,
      fixedItems,
      maxProductId: `PD${String(maxNum).padStart(3, '0')}`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
