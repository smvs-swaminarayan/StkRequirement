"use server";

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "u339048620_stk",
  password: process.env.DB_PASSWORD || "8yc7zuc8z*A",
  database: process.env.DB_NAME || "u339048620_stk",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const jsonFields = ["roles", "assignedCategoryIds", "images", "imageCrop"];
const booleanFields = ["temporaryPasswordIssued"];

const removedFields: Record<string, string[]> = {
  users: ['usernameLower', 'deletedByName', 'primaryRole', 'categoryIds'],
  categories: ['deletedByName'],
  items: ['categoryName', 'createdByName', 'createdByRole', 'deletedByName', 'imagePath'],
  stockEntries: ['categoryName', 'itemName', 'createdByName', 'deletedByName', 'deletedById'],
  orders: ['itemName', 'categoryName', 'requestedByName', 'requestedByUsername', 'decisionByName', 'approvedByName', 'rejectedByName', 'deliveredByName', 'deletedByName', 'summary'],
  specialRequests: ['itemName', 'categoryName', 'requestedByName', 'requestedByUsername', 'decisionByName', 'deletedByName', 'resolvedAt', 'resolvedByUsername', 'resolvedMessage', 'resolvedByName', 'deletedById'],
  resetRequests: ['usernameLower', 'displayName', 'resolvedByName'],
  auditLogs: ['username']
};

function getTable(colName: string) {
  const prefix = process.env.DB_PREFIX || "";
  return `\`${prefix}${colName}\``;
}

function getSelectQuery(colName: string) {
  const prefix = process.env.DB_PREFIX || "";
  const tUsers = `\`${prefix}users\``;
  const tCat = `\`${prefix}categories\``;
  const tItems = `\`${prefix}items\``;
  const tStock = `\`${prefix}stockEntries\``;
  const tOrders = `\`${prefix}orders\``;
  const tReset = `\`${prefix}resetRequests\``;
  const tSpecial = `\`${prefix}specialRequests\``;
  const tAudit = `\`${prefix}auditLogs\``;

  if (colName === "users") {
    return `SELECT ${tUsers}.*, LOWER(${tUsers}.username) as usernameLower, u.displayName as deletedByName FROM ${tUsers} LEFT JOIN ${tUsers} u ON ${tUsers}.deletedById = u.uid`;
  }
  if (colName === "categories") {
    return `SELECT ${tCat}.*, u.displayName as deletedByName FROM ${tCat} LEFT JOIN ${tUsers} u ON ${tCat}.deletedById = u.uid`;
  }
  if (colName === "items") {
    return `SELECT ${tItems}.*, c.name as categoryName, u1.displayName as createdByName, u1.role as createdByRole, u2.displayName as deletedByName FROM ${tItems} LEFT JOIN ${tCat} c ON ${tItems}.categoryId = c.id LEFT JOIN ${tUsers} u1 ON ${tItems}.createdById = u1.uid LEFT JOIN ${tUsers} u2 ON ${tItems}.deletedById = u2.uid`;
  }
  if (colName === "stockEntries") {
    return `SELECT ${tStock}.*, c.name as categoryName, i.name as itemName, u1.displayName as createdByName, u2.displayName as deletedByName FROM ${tStock} LEFT JOIN ${tCat} c ON ${tStock}.categoryId = c.id LEFT JOIN ${tItems} i ON ${tStock}.itemId = i.id LEFT JOIN ${tUsers} u1 ON ${tStock}.createdById = u1.uid LEFT JOIN ${tUsers} u2 ON ${tStock}.deletedById = u2.uid`;
  }
  if (colName === "orders") {
    return `SELECT ${tOrders}.*, c.name as categoryName, i.name as itemName, u1.displayName as requestedByName, u1.username as requestedByUsername, u2.displayName as decisionByName, u3.displayName as approvedByName, u4.displayName as rejectedByName, u5.displayName as deliveredByName FROM ${tOrders} LEFT JOIN ${tCat} c ON ${tOrders}.categoryId = c.id LEFT JOIN ${tItems} i ON ${tOrders}.itemId = i.id LEFT JOIN ${tUsers} u1 ON ${tOrders}.requestedById = u1.uid LEFT JOIN ${tUsers} u2 ON ${tOrders}.decisionById = u2.uid LEFT JOIN ${tUsers} u3 ON ${tOrders}.approvedById = u3.uid LEFT JOIN ${tUsers} u4 ON ${tOrders}.rejectedById = u4.uid LEFT JOIN ${tUsers} u5 ON ${tOrders}.deliveredById = u5.uid`;
  }
  if (colName === "specialRequests") {
    return `SELECT ${tSpecial}.*, c.name as categoryName, i.name as itemName, u1.displayName as requestedByName, u1.username as requestedByUsername, u2.displayName as decisionByName FROM ${tSpecial} LEFT JOIN ${tCat} c ON ${tSpecial}.categoryId = c.id LEFT JOIN ${tItems} i ON ${tSpecial}.itemId = i.id LEFT JOIN ${tUsers} u1 ON ${tSpecial}.requestedById = u1.uid LEFT JOIN ${tUsers} u2 ON ${tSpecial}.decisionById = u2.uid`;
  }
  if (colName === "resetRequests") {
    return `SELECT ${tReset}.*, LOWER(u.username) as usernameLower, u.displayName, u2.displayName as resolvedByName FROM ${tReset} LEFT JOIN ${tUsers} u ON ${tReset}.username = u.username LEFT JOIN ${tUsers} u2 ON ${tReset}.resolvedById = u2.uid`;
  }
  if (colName === "auditLogs") {
    return `SELECT ${tAudit}.*, u.username FROM ${tAudit} LEFT JOIN ${tUsers} u ON ${tAudit}.userId = u.uid`;
  }

  return `SELECT * FROM ${getTable(colName)}`;
}

function parseRow(row: any) {
  if (!row) return row;
  const parsed = { ...row };
  
  if (parsed.is_deleted !== undefined) {
    parsed.active = parsed.is_deleted === 0;
    if (parsed.is_deleted === 0) {
      parsed.deletedAt = null;
    }
  }

  for (const field of jsonFields) {
    if (parsed[field] !== undefined && typeof parsed[field] === "string") {
      try {
        parsed[field] = parsed[field] ? JSON.parse(parsed[field]) : null;
      } catch (e) {
        parsed[field] = null;
      }
    }
  }

  for (const field of booleanFields) {
    if (parsed[field] !== undefined) {
      parsed[field] = parsed[field] === 1;
    }
  }

  if (parsed.uid && !parsed.id) {
    parsed.id = parsed.uid;
  }

  return parsed;
}

export async function executeMysqlQuery(payload: any) {
  try {
    const { action, collection, id, data, constraints } = payload;
    let colName = typeof collection === "string" ? collection : collection?.path || String(collection || "");
    if (colName === "usernames") colName = "users";
    
    const allowedCollections = ['users', 'usernames', 'categories', 'items', 'stockEntries', 'orders', 'auditLogs', 'resetRequests', 'specialRequests', 'meta'];
    if (!allowedCollections.includes(colName)) {
      throw new Error(`Invalid collection name: ${colName}`);
    }

    const getIdField = (col: string) => col === "users" ? "uid" : "id";
    const tableName = getTable(colName);

    if (action === "getDocs") {
      const query = getSelectQuery(colName);
      const [rows] = await pool.execute(query);
      let results = (rows as any[]).map(parseRow);
      
      if (constraints && constraints.length > 0) {
        results = results.filter((item: any) => {
          return constraints.every((c: any) => {
            const { field, op, value } = c;
            const itemVal = item[field];
            if (op === "==") return itemVal == value;
            if (op === "!=") return itemVal != value;
            if (op === "in") return Array.isArray(value) && value.includes(itemVal);
            if (op === "array-contains") return Array.isArray(itemVal) && itemVal.includes(value);
            return true;
          });
        });
      }
      return results;
    }

    if (action === "getDoc") {
      const idField = getIdField(colName);
      const baseQuery = getSelectQuery(colName);
      const query = `${baseQuery} WHERE ${tableName}.\`${idField}\` = ?`;
      const [rows] = await pool.execute(query, [id]);
      const row = (rows as any[])[0];
      return row ? parseRow(row) : null;
    }

    function prepareDataForMysql(col: string, inputData: any) {
      const preparedData = { ...inputData };
      if (preparedData.active !== undefined && preparedData.is_deleted === undefined) {
        preparedData.is_deleted = preparedData.active ? 0 : 1;
      }
      for (const field of jsonFields) {
        if (preparedData[field] !== undefined) {
          preparedData[field] = typeof preparedData[field] === "string" ? preparedData[field] : JSON.stringify(preparedData[field]);
        }
      }
      for (const field of booleanFields) {
        if (preparedData[field] !== undefined) {
          preparedData[field] = preparedData[field] ? 1 : 0;
        }
      }
      const ignored = [...(removedFields[col] || []), "active", "id", "uid"];
      const keys = Object.keys(preparedData).filter(k => !ignored.includes(k));
      return { preparedData, keys };
    }

    if (action === "addDoc") {
      const { preparedData, keys } = prepareDataForMysql(colName, data);
      const columns = keys.map(k => `\`${k}\``).join(", ");
      const placeholders = keys.map(() => "?").join(", ");
      const values = keys.map(k => preparedData[k]);
      
      const [result] = await pool.execute(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`, values);
      const insertId = (result as any).insertId || id;
      return { id: insertId, ...preparedData };
    }

    if (action === "updateDoc") {
      const { preparedData, keys } = prepareDataForMysql(colName, data);
      const idField = getIdField(colName);
      const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
      const values = keys.map(k => preparedData[k]);
      values.push(id);

      await pool.execute(`UPDATE ${tableName} SET ${setClause} WHERE \`${idField}\` = ?`, values);
      return { id, ...preparedData };
    }

    if (action === "deleteDoc") {
      const idField = getIdField(colName);
      await pool.execute(`DELETE FROM ${tableName} WHERE \`${idField}\` = ?`, [id]);
      return { id };
    }

    throw new Error(`Unsupported action: ${action}`);
  } catch (error: any) {
    console.error("MySQL Query Error:", error);
    throw error;
  }
}
