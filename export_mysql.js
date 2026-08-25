const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('normalized_database.sqlite');
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

function generateDump(prefix = '') {
  let mysqlDump = '-- STK Stock Management MySQL / phpMyAdmin Database Dump\n';
  mysqlDump += '-- Exported at: ' + new Date().toISOString() + '\n';
  mysqlDump += '-- Table Prefix: "' + prefix + '"\n\n';
  mysqlDump += 'SET FOREIGN_KEY_CHECKS = 0;\n';
  mysqlDump += 'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n';
  mysqlDump += 'SET time_zone = "+00:00";\n\n';

  for (const table of tables) {
    const prefixedTableName = prefix + table.name;

    mysqlDump += '-- --------------------------------------------------------\n';
    mysqlDump += '-- Table structure for table `' + prefixedTableName + '`\n';
    mysqlDump += '-- --------------------------------------------------------\n';
    mysqlDump += 'DROP TABLE IF EXISTS `' + prefixedTableName + '`;\n';
    
    // Replace table name in SQL definition if prefixed
    let cleanSql = table.sql;
    if (prefix) {
      cleanSql = cleanSql.replace(new RegExp(`CREATE TABLE (IF NOT EXISTS )?["\`]?${table.name}["\`]?`, 'i'), `CREATE TABLE $1\`${prefixedTableName}\``);
    }

    // Convert SQLite schema to MySQL / MariaDB schema
    cleanSql = cleanSql
      .replace(/"/g, '`')
      .replace(/TEXT PRIMARY KEY/gi, 'VARCHAR(255) PRIMARY KEY')
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY')
      .replace(/PRIMARY KEY AUTOINCREMENT/gi, 'PRIMARY KEY AUTO_INCREMENT')
      .replace(/AUTOINCREMENT/gi, 'AUTO_INCREMENT');
      
    mysqlDump += cleanSql + ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n';
    
    const rows = db.prepare('SELECT * FROM `' + table.name + '`').all();
    if (rows.length > 0) {
      mysqlDump += '-- Dumping data for table `' + prefixedTableName + '` (' + rows.length + ' rows)\n';
      for (const row of rows) {
        const keys = Object.keys(row);
        const cols = keys.map(k => '`' + k + '`').join(', ');
        const vals = keys.map(k => {
          const val = row[k];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          return "'" + String(val).replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
        }).join(', ');
        mysqlDump += 'INSERT INTO `' + prefixedTableName + '` (' + cols + ') VALUES (' + vals + ');\n';
      }
      mysqlDump += '\n';
    }
  }

  mysqlDump += 'SET FOREIGN_KEY_CHECKS = 1;\n';
  return mysqlDump;
}

// Generate official StkRequirement-prefixed SQL dump
const stkReqDump = generateDump('StkRequirement_');
fs.writeFileSync('database_dump_mysql_StkRequirement.sql', stkReqDump, 'utf8');
console.log('Official StkRequirement MySQL dump created at database_dump_mysql_StkRequirement.sql (' + fs.statSync('database_dump_mysql_StkRequirement.sql').size + ' bytes)');
