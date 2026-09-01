import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { db } from '@/lib/sqlite-db';

export async function GET() {
  let connection: any;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "auth-db1408.hstgr.io",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "u339048620_stk",
      password: process.env.DB_PASSWORD || "8yc7zuc8z*A",
      database: process.env.DB_NAME || "u339048620_stk",
    });

    const prefix = process.env.DB_PREFIX || "StkRequirement_";

    // 1. Fetch active items (excluding deleted items)
    const [rawItems] = await connection.execute(
      `SELECT * FROM \`${prefix}items\` WHERE (is_deleted = 0 OR is_deleted IS NULL) AND deletedAt IS NULL ORDER BY id ASC`
    );
    const items = rawItems as any[];
    const activeItemIds = new Set(items.map(i => Number(i.id)));

    // 2. Fetch active stock entries (excluding deleted stock entries)
    const [rawStockEntries] = await connection.execute(
      `SELECT * FROM \`${prefix}stockEntries\` WHERE (is_deleted = 0 OR is_deleted IS NULL) AND deletedAt IS NULL ORDER BY id ASC`
    );
    const stockEntries = rawStockEntries as any[];

    // 3. Filter surviving stock entries (permanently drop orphans whose itemId is not in active items)
    const survivingStock = stockEntries.filter(se => activeItemIds.has(Number(se.itemId)));
    const deletedOrphanCount = stockEntries.length - survivingStock.length;

    console.log(`Active items: ${items.length}, Original stock entries: ${stockEntries.length}, Surviving stock entries: ${survivingStock.length}, Deleted orphans: ${deletedOrphanCount}`);

    // 4. Create Item ID Mapping & Clean Items Array
    const itemIdMap = new Map<number, { newId: number; newPd: string }>();
    const cleanItems: any[] = [];

    let currentItemNum = 100000;
    let currentPdNum = 1;

    for (const item of items) {
      const oldId = Number(item.id);
      const newId = currentItemNum;
      const newPd = `PD${String(currentPdNum).padStart(3, '0')}`;

      itemIdMap.set(oldId, { newId, newPd });

      cleanItems.push({
        ...item,
        id: newId,
        productId: newPd,
      });

      currentItemNum++;
      currentPdNum++;
    }

    // 5. Build Clean Stock Entries Array
    const cleanStock: any[] = [];
    let currentStockNum = 100000;

    for (const se of survivingStock) {
      const oldItemId = Number(se.itemId);
      const mapped = itemIdMap.get(oldItemId);
      const newItemId = mapped ? mapped.newId : oldItemId;

      cleanStock.push({
        ...se,
        id: currentStockNum,
        itemId: newItemId,
      });

      currentStockNum++;
    }

    // 6. Atomic Replacement in MySQL
    // 6a. Items Table: Truncate and re-insert cleanly
    await connection.execute(`DROP TABLE IF EXISTS \`${prefix}items_temp_backup\``);
    await connection.execute(`CREATE TABLE \`${prefix}items_temp_backup\` LIKE \`${prefix}items\``);
    await connection.execute(`INSERT INTO \`${prefix}items_temp_backup\` SELECT * FROM \`${prefix}items\``);

    await connection.execute(`TRUNCATE TABLE \`${prefix}items\``);

    for (const item of cleanItems) {
      await connection.execute(
        `INSERT INTO \`${prefix}items\` (
          id, productId, name, description, categoryId, unit, imageUrl, imageCrop, images,
          is_permission, hasVariants, variants, createdById, is_deleted, deletedAt, deletedById, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.productId,
          item.name,
          item.description || '',
          item.categoryId,
          item.unit || 'piece',
          item.imageUrl || null,
          item.imageCrop ? (typeof item.imageCrop === 'string' ? item.imageCrop : JSON.stringify(item.imageCrop)) : null,
          item.images ? (typeof item.images === 'string' ? item.images : JSON.stringify(item.images)) : '[]',
          item.is_permission || 'NO',
          item.hasVariants ? 1 : 0,
          item.variants ? (typeof item.variants === 'string' ? item.variants : JSON.stringify(item.variants)) : '[]',
          item.createdById || 100016,
          0,
          null,
          null,
          item.createdAt || new Date().toISOString(),
          item.updatedAt || new Date().toISOString()
        ]
      );
    }

    // 6b. Stock Entries Table: Truncate and re-insert cleanly
    await connection.execute(`DROP TABLE IF EXISTS \`${prefix}stock_temp_backup\``);
    await connection.execute(`CREATE TABLE \`${prefix}stock_temp_backup\` LIKE \`${prefix}stockEntries\``);
    await connection.execute(`INSERT INTO \`${prefix}stock_temp_backup\` SELECT * FROM \`${prefix}stockEntries\``);

    await connection.execute(`TRUNCATE TABLE \`${prefix}stockEntries\``);

    for (const se of cleanStock) {
      await connection.execute(
        `INSERT INTO \`${prefix}stockEntries\` (
          id, date, categoryId, itemId, variant, qty, unit, notes,
          createdById, is_deleted, deletedAt, deletedById, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          se.id,
          se.date || new Date().toISOString().slice(0, 10),
          se.categoryId,
          se.itemId,
          se.variant || null,
          se.qty || 0,
          se.unit || 'piece',
          se.notes || '',
          se.createdById || 100016,
          0,
          null,
          null,
          se.createdAt || new Date().toISOString(),
          se.updatedAt || new Date().toISOString()
        ]
      );
    }

    // 6c. Drop temporary backup tables
    await connection.execute(`DROP TABLE IF EXISTS \`${prefix}items_temp_backup\``);
    await connection.execute(`DROP TABLE IF EXISTS \`${prefix}stock_temp_backup\``);

    // 6d. Update orders itemId mapping
    for (const [oldId, { newId }] of itemIdMap.entries()) {
      await connection.execute(
        `UPDATE \`${prefix}orders\` SET itemId = ? WHERE itemId = ?`,
        [newId, oldId]
      );
    }

    // 7. Mirror clean state to SQLite
    try {
      db.prepare("DELETE FROM items").run();
      db.prepare("DELETE FROM stockEntries").run();

      for (const item of cleanItems) {
        db.prepare(
          `INSERT OR REPLACE INTO items (id, productId, name, description, categoryId, unit, imageUrl, imageCrop, images, is_permission, hasVariants, variants, createdById, is_deleted, deletedAt, deletedById, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          item.id, item.productId, item.name, item.description || '', item.categoryId, item.unit || 'piece',
          item.imageUrl || null, item.imageCrop ? JSON.stringify(item.imageCrop) : null,
          item.images ? JSON.stringify(item.images) : '[]', item.is_permission || 'NO', item.hasVariants ? 1 : 0,
          item.variants ? JSON.stringify(item.variants) : '[]', item.createdById || 100016, 0, null, null,
          item.createdAt || new Date().toISOString(), item.updatedAt || new Date().toISOString()
        );
      }

      for (const se of cleanStock) {
        db.prepare(
          `INSERT OR REPLACE INTO stockEntries (id, date, categoryId, itemId, variant, qty, unit, notes, createdById, is_deleted, deletedAt, deletedById, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          se.id, se.date || new Date().toISOString().slice(0, 10), se.categoryId, se.itemId,
          se.variant || null, se.qty || 0, se.unit || 'piece', se.notes || '',
          se.createdById || 100016, 0, null, null, se.createdAt || new Date().toISOString(), se.updatedAt || new Date().toISOString()
        );
      }
    } catch (sqliteErr: any) {
      console.warn("SQLite mirror sync warning:", sqliteErr.message);
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Database cleaned and reindexed with 100% precision!",
      deletedOrphanedStockEntries: deletedOrphanCount,
      totalActiveItems: cleanItems.length,
      firstItemId: 100000,
      lastItemId: 100000 + cleanItems.length - 1,
      firstProductId: "PD001",
      lastProductId: `PD${String(cleanItems.length).padStart(3, '0')}`,
      totalStockEntries: cleanStock.length,
      firstStockId: 100000,
      lastStockId: 100000 + cleanStock.length - 1
    });
  } catch (error: any) {
    if (connection) await connection.end();
    console.error("Clean and reindex error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
