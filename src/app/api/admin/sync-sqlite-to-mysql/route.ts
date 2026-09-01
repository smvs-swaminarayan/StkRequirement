import { NextResponse } from 'next/server';
import { db } from '@/lib/sqlite-db';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "auth-db1408.hstgr.io",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "u339048620_stk",
      password: process.env.DB_PASSWORD || "8yc7zuc8z*A",
      database: process.env.DB_NAME || "u339048620_stk",
    });

    const prefix = process.env.DB_PREFIX || "StkRequirement_";

    // 1. Ensure columns exist in MySQL
    try {
      const [itemCols] = await connection.execute(`SHOW COLUMNS FROM \`${prefix}items\` LIKE 'hasVariants'`);
      if (!(itemCols as any[]).length) {
        await connection.execute(`ALTER TABLE \`${prefix}items\` ADD COLUMN \`hasVariants\` TINYINT(1) DEFAULT 0`);
        await connection.execute(`ALTER TABLE \`${prefix}items\` ADD COLUMN \`variants\` TEXT NULL`);
      }
    } catch (e: any) {
      console.warn("Item cols check:", e.message);
    }

    try {
      const [stockCols] = await connection.execute(`SHOW COLUMNS FROM \`${prefix}stockEntries\` LIKE 'variant'`);
      if (!(stockCols as any[]).length) {
        await connection.execute(`ALTER TABLE \`${prefix}stockEntries\` ADD COLUMN \`variant\` VARCHAR(255) NULL`);
      }
    } catch (e: any) {
      console.warn("Stock cols check:", e.message);
    }

    try {
      const [orderCols] = await connection.execute(`SHOW COLUMNS FROM \`${prefix}orders\` LIKE 'variant'`);
      if (!(orderCols as any[]).length) {
        await connection.execute(`ALTER TABLE \`${prefix}orders\` ADD COLUMN \`variant\` VARCHAR(255) NULL`);
      }
    } catch (e: any) {
      console.warn("Order cols check:", e.message);
    }

    // 2. Fetch existing IDs in MySQL
    const [mysqlItems] = await connection.execute(`SELECT id FROM \`${prefix}items\``);
    const mysqlItemIds = new Set((mysqlItems as any[]).map(i => Number(i.id)));

    // 3. Read from SQLite
    const sqliteItems = db.prepare("SELECT * FROM items").all() as any[];
    let itemsSynced = 0;

    for (const item of sqliteItems) {
      if (!mysqlItemIds.has(Number(item.id))) {
        await connection.execute(
          `INSERT INTO \`${prefix}items\` (
            id, productId, name, description, categoryId, unit, imageUrl, imageCrop, images,
            is_permission, hasVariants, variants, createdById, is_deleted, deletedAt, deletedById, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.productId || 'PD000',
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
            item.is_deleted ? 1 : 0,
            item.deletedAt || null,
            item.deletedById || null,
            item.createdAt || new Date().toISOString(),
            item.updatedAt || new Date().toISOString()
          ]
        );
        itemsSynced++;
      } else {
        await connection.execute(
          `UPDATE \`${prefix}items\` SET hasVariants = ?, variants = ?, productId = ? WHERE id = ?`,
          [
            item.hasVariants ? 1 : 0,
            item.variants ? (typeof item.variants === 'string' ? item.variants : JSON.stringify(item.variants)) : '[]',
            item.productId,
            item.id
          ]
        );
      }
    }

    // 4. Sync Stock Entries
    const [mysqlStock] = await connection.execute(`SELECT id FROM \`${prefix}stockEntries\``);
    const mysqlStockIds = new Set((mysqlStock as any[]).map(s => Number(s.id)));

    const sqliteStock = db.prepare("SELECT * FROM stockEntries").all() as any[];
    let stockSynced = 0;

    for (const se of sqliteStock) {
      if (!mysqlStockIds.has(Number(se.id))) {
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
            se.is_deleted ? 1 : 0,
            se.deletedAt || null,
            se.deletedById || null,
            se.createdAt || new Date().toISOString(),
            se.updatedAt || new Date().toISOString()
          ]
        );
        stockSynced++;
      }
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      itemsSynced,
      stockSynced,
      totalSqliteItems: sqliteItems.length,
      totalSqliteStock: sqliteStock.length,
      message: "Successfully synchronized all SQLite data to Hostinger MySQL database!"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
