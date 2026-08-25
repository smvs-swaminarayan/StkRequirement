const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('normalized_database.sqlite');
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

// 1. Generate PostgreSQL Dump
let pgDump = '-- STK Stock Management PostgreSQL Database Dump\n';
pgDump += '-- Exported at: ' + new Date().toISOString() + '\n\n';
pgDump += "SET session_replication_role = 'replica';\n\n";

for (const table of tables) {
  pgDump += '-- --------------------------------------------------------\n';
  pgDump += '-- Table structure for table "' + table.name + '"\n';
  pgDump += '-- --------------------------------------------------------\n';
  pgDump += 'DROP TABLE IF EXISTS "' + table.name + '" CASCADE;\n';
  
  // Clean SQLite schema to PostgreSQL schema
  let cleanSql = table.sql
    .replace(/`([^`]+)`/g, '"$1"')
    .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
    .replace(/AUTOINCREMENT/gi, '');
    
  pgDump += cleanSql + ';\n\n';
  
  const rows = db.prepare('SELECT * FROM `' + table.name + '`').all();
  if (rows.length > 0) {
    pgDump += '-- Dumping data for table "' + table.name + '" (' + rows.length + ' rows)\n';
    for (const row of rows) {
      const keys = Object.keys(row);
      const cols = keys.map(k => '"' + k + '"').join(', ');
      const vals = keys.map(k => {
        const val = row[k];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number') return val;
        return "'" + String(val).replace(/'/g, "''") + "'";
      }).join(', ');
      pgDump += 'INSERT INTO "' + table.name + '" (' + cols + ') VALUES (' + vals + ');\n';
    }
    pgDump += '\n';
  }
}

pgDump += "SET session_replication_role = 'origin';\n";
fs.writeFileSync('database_dump_postgres.sql', pgDump, 'utf8');
console.log('PostgreSQL dump created at database_dump_postgres.sql (' + fs.statSync('database_dump_postgres.sql').size + ' bytes)');

// 2. Generate Universal Standard SQL Dump (No PRAGMA, standard quotes)
let stdDump = '-- STK Stock Management Universal Standard SQL Dump\n';
stdDump += '-- Exported at: ' + new Date().toISOString() + '\n\n';

for (const table of tables) {
  stdDump += '-- --------------------------------------------------------\n';
  stdDump += '-- Table structure for table `' + table.name + '`\n';
  stdDump += '-- --------------------------------------------------------\n';
  stdDump += 'DROP TABLE IF EXISTS `' + table.name + '`;\n';
  
  let cleanSql = table.sql.replace(/AUTOINCREMENT/gi, '');
  stdDump += cleanSql + ';\n\n';
  
  const rows = db.prepare('SELECT * FROM `' + table.name + '`').all();
  if (rows.length > 0) {
    stdDump += '-- Dumping data for table `' + table.name + '` (' + rows.length + ' rows)\n';
    for (const row of rows) {
      const keys = Object.keys(row);
      const cols = keys.map(k => '`' + k + '`').join(', ');
      const vals = keys.map(k => {
        const val = row[k];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number') return val;
        return "'" + String(val).replace(/'/g, "''") + "'";
      }).join(', ');
      stdDump += 'INSERT INTO `' + table.name + '` (' + cols + ') VALUES (' + vals + ');\n';
    }
    stdDump += '\n';
  }
}

fs.writeFileSync('database_dump.sql', stdDump, 'utf8');
console.log('Universal SQL dump created at database_dump.sql (' + fs.statSync('database_dump.sql').size + ' bytes)');
