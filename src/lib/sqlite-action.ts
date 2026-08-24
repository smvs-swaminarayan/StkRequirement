"use server";
import { db } from "./sqlite-db";

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

const selectQueries: Record<string, string> = {
  users: `SELECT users.*, LOWER(users.username) as usernameLower, u.displayName as deletedByName FROM users LEFT JOIN users u ON users.deletedById = u.uid`,
  categories: `SELECT categories.*, u.displayName as deletedByName FROM categories LEFT JOIN users u ON categories.deletedById = u.uid`,
  items: `SELECT items.*, c.name as categoryName, u1.displayName as createdByName, u1.role as createdByRole, u2.displayName as deletedByName FROM items LEFT JOIN categories c ON items.categoryId = c.id LEFT JOIN users u1 ON items.createdById = u1.uid LEFT JOIN users u2 ON items.deletedById = u2.uid`,
  stockEntries: `SELECT stockEntries.*, c.name as categoryName, i.name as itemName, u1.displayName as createdByName, u2.displayName as deletedByName FROM stockEntries LEFT JOIN categories c ON stockEntries.categoryId = c.id LEFT JOIN items i ON stockEntries.itemId = i.id LEFT JOIN users u1 ON stockEntries.createdById = u1.uid LEFT JOIN users u2 ON stockEntries.deletedById = u2.uid`,
  orders: `SELECT orders.*, c.name as categoryName, i.name as itemName, u1.displayName as requestedByName, u1.username as requestedByUsername, u2.displayName as decisionByName, u3.displayName as approvedByName, u4.displayName as rejectedByName, u5.displayName as deliveredByName FROM orders LEFT JOIN categories c ON orders.categoryId = c.id LEFT JOIN items i ON orders.itemId = i.id LEFT JOIN users u1 ON orders.requestedById = u1.uid LEFT JOIN users u2 ON orders.decisionById = u2.uid LEFT JOIN users u3 ON orders.approvedById = u3.uid LEFT JOIN users u4 ON orders.rejectedById = u4.uid LEFT JOIN users u5 ON orders.deliveredById = u5.uid`,
  specialRequests: `SELECT specialRequests.*, c.name as categoryName, i.name as itemName, u1.displayName as requestedByName, u1.username as requestedByUsername, u2.displayName as decisionByName FROM specialRequests LEFT JOIN categories c ON specialRequests.categoryId = c.id LEFT JOIN items i ON specialRequests.itemId = i.id LEFT JOIN users u1 ON specialRequests.requestedById = u1.uid LEFT JOIN users u2 ON specialRequests.decisionById = u2.uid`,
  resetRequests: `SELECT resetRequests.*, LOWER(u.username) as usernameLower, u.displayName, u2.displayName as resolvedByName FROM resetRequests LEFT JOIN users u ON resetRequests.username = u.username LEFT JOIN users u2 ON resetRequests.resolvedById = u2.uid`,
  auditLogs: `SELECT auditLogs.*, u.username FROM auditLogs LEFT JOIN users u ON auditLogs.userId = u.uid`
};

function parseRow(row: any) {
  if (!row) return row;
  const parsed = { ...row };
  
  for (const field of jsonFields) {
    if (parsed[field] !== undefined) {
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
  
  if (parsed.is_deleted !== undefined) {
    parsed.is_deleted = parsed.is_deleted === 1;
    parsed.active = !parsed.is_deleted;
  }
  
  return parsed;
}

const integerFields = [
  "id", "categoryId", "itemId", "createdById", "deletedById",
  "requestedById", "decisionById", "approvedById", "rejectedById",
  "deliveredById", "resolvedById", "qty"
];

function sanitizeValue(collection: string, key: string, val: any) {
  if (val === undefined || val === null) return null;
  if (key === 'is_deleted') return val ? 1 : 0;
  if (jsonFields.includes(key)) return typeof val === 'string' ? val : JSON.stringify(val);
  if (booleanFields.includes(key)) return val ? 1 : 0;
  
  if (integerFields.includes(key)) {
    if (typeof val === 'number') return Math.floor(val);
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }
  
  return val;
}

function prepareDataForSql(data: any) {
  const prepared = { ...data };
  if (prepared.active !== undefined && prepared.is_deleted === undefined) {
    prepared.is_deleted = prepared.active ? 0 : 1;
  }
  return prepared;
}

function buildUpdateQuery(collection: string, data: any, id: string | number) {
  const prepared = prepareDataForSql(data);
  const ignored = removedFields[collection] || [];
  const keys = Object.keys(prepared).filter(k => k !== 'id' && k !== 'active' && !ignored.includes(k));
  const setClauses = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => sanitizeValue(collection, k, prepared[k]));
  
  const isUserCol = collection === "users" || collection === "usernames";
  const finalId = isUserCol ? id : (parseInt(String(id), 10) || id);

  return {
    query: `UPDATE ${collection} SET ${setClauses} WHERE id = ?`,
    values: [...values, finalId]
  };
}

function buildInsertQuery(collection: string, data: any) {
  const prepared = prepareDataForSql(data);
  const ignored = removedFields[collection] || [];
  const isUserCol = collection === "users" || collection === "usernames";
  
  const keys = Object.keys(prepared).filter(k => {
    if (k === 'active' || ignored.includes(k)) return false;
    if (k === 'id' && !isUserCol) {
      const parsed = parseInt(String(prepared[k]), 10);
      if (isNaN(parsed)) return false;
    }
    return true;
  });

  const columns = keys.join(", ");
  const placeholders = keys.map(() => "?").join(", ");
  const values = keys.map(k => sanitizeValue(collection, k, prepared[k]));

  return {
    query: `INSERT INTO ${collection} (${columns}) VALUES (${placeholders})`,
    values
  };
}

function resolveColName(input: any): string {
  let name = "";
  if (typeof input === "string") name = input;
  else if (input && typeof input === "object") {
    if (typeof input.path === "string") name = input.path;
    else if (input.path && typeof input.path === "object") name = resolveColName(input.path);
  } else {
    name = String(input || "");
  }
  if (name === "usernames") return "users";
  return name;
}

import { executeMysqlQuery } from "./mysql-action";

export async function executeDbQuery(payload: any) {
  if (process.env.DB_TYPE === "mysql") {
    return await executeMysqlQuery(payload);
  }
  try {
    const { action, collection, id, data, constraints } = payload;
    const colName = resolveColName(collection);
    
    // Safety check for collection names to prevent SQL injection
    const allowedCollections = ['users', 'usernames', 'categories', 'items', 'stockEntries', 'orders', 'auditLogs', 'resetRequests', 'specialRequests', 'meta'];
    if (!allowedCollections.includes(colName)) {
      console.error(`Invalid collection name requested: "${collection}" (resolved: "${colName}")`);
      throw new Error(`Invalid collection name: ${colName}`);
    }

    const getIdField = (col: string) => col === "users" ? "uid" : "id";

    if (action === "getDocs") {
      let query = selectQueries[colName] || `SELECT * FROM ${colName}`;
      const rows = db.prepare(query).all() as any[];
      
      let results = rows.map(parseRow);
      
      if (constraints && constraints.length > 0) {
         results = results.filter((item: any) => {
            return constraints.every((c: any) => {
               if (c.op === '==') return item[c.field] === c.value;
               if (c.op === 'in') return c.value.includes(item[c.field]);
               if (c.op === 'array-contains') return item[c.field] && item[c.field].includes(c.value);
               return true;
            });
         });
      }
      return results;
    }
    
    if (action === "getDoc") {
      const idField = getIdField(colName);
      const baseQuery = selectQueries[colName] || `SELECT * FROM ${colName}`;
      const query = `${baseQuery} WHERE ${colName}.${idField} = ?`;
      const row = db.prepare(query).get(id) as any;
      if (!row) return null;
      return parseRow(row);
    }
    
    if (action === "addDoc") {
      const { query, values } = buildInsertQuery(colName, data);
      const info = db.prepare(query).run(...values);
      return info.lastInsertRowid;
    }
    
    if (action === "setDoc") {
      const idField = getIdField(colName);
      const isUserCol = colName === "users" || colName === "usernames";
      const numId = !isUserCol ? parseInt(String(id), 10) : NaN;
      const targetId = !isNaN(numId) ? numId : id;

      let existing = null;
      if (isUserCol || !isNaN(numId)) {
        existing = db.prepare(`SELECT * FROM ${colName} WHERE ${idField} = ?`).get(targetId) as any;
      }

      if (existing) {
         const { query, values } = buildUpdateQuery(colName, data, targetId);
         const finalQuery = query.replace('WHERE id = ?', `WHERE ${idField} = ?`);
         db.prepare(finalQuery).run(...values);
         return targetId;
      } else {
         const docData = { ...data };
         if (isUserCol) {
           docData[idField] = id;
         } else if (!isNaN(numId)) {
           docData[idField] = numId;
         }
         const { query, values } = buildInsertQuery(colName, docData);
         const info = db.prepare(query).run(...values);
         return info.lastInsertRowid || targetId;
      }
    }
    
    if (action === "updateDoc") {
       const idField = getIdField(colName);
       const { query, values } = buildUpdateQuery(colName, data, id);
       const finalQuery = query.replace('WHERE id = ?', `WHERE ${idField} = ?`);
       db.prepare(finalQuery).run(...values);
       return id;
    }
    
    if (action === "deleteDoc") {
       const idField = getIdField(colName);
       db.prepare(`UPDATE ${colName} SET is_deleted = 1, deletedAt = ? WHERE ${idField} = ?`).run(new Date().toISOString(), id);
       return true;
    }
    
  } catch (error: any) {
    console.error("executeDbQuery error:", error);
    throw new Error(error.message);
  }
}
