# STK Stock Management System - Developer Handover Guide

This guide contains the exact 3 items requested for server hosting and sub-domain integration.

---

## 1. Source Code Location
- **Local Clean Folder:** `Final_hosting_Website`
- **ZIP File for Server Upload:** `Final_hosting_Website.zip` (located in project root `STK_STOCK_Manage/`)
- **Environment Configuration (`.env.local`):**
  ```env
  DB_TYPE=mysql
  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=u339048620_stk
  DB_USER=u339048620_stk
  DB_PASSWORD=8yc7zuc8z*A
  DB_PREFIX=stk_
  ```

---

## 2. SQL Database Dump Files
We have provided **two database dump options** in the codebase:

1. **`database_dump_mysql_stk.sql` (RECOMMENDED FOR SUB-DOMAIN / SHARED DATABASE)**
   - All tables are prefixed with `stk_` to prevent clashes with existing database tables:
     - `stk_users`
     - `stk_categories`
     - `stk_items`
     - `stk_stockEntries`
     - `stk_orders`
     - `stk_auditLogs`
     - `stk_resetRequests`
     - `stk_specialRequests`
     - `stk_meta`
   - Set `DB_PREFIX=stk_` in `.env.local`.

2. **`database_dump_mysql.sql` (STANDARD SINGLE DATABASE)**
   - Standard table names without prefix (`users`, `categories`, `items`, etc.).
   - Leave `DB_PREFIX=` blank in `.env.local`.

---

## 3. Application Routes & API Endpoints Reference

### 🌐 Frontend Page Routes

| Route | Page Purpose | Required Access Roles |
|---|---|---|
| `/` | Storefront & Item Browsing Catalog | All (Guest, User, Leader, STK Dept) |
| `/login` | User Authentication Sign-In Screen | All |
| `/dashboard` | Main Analytics Dashboard & Overview | User, Leader, STK Dept |
| `/masters` | Categories, Items & Stock Management | Leader, STK Dept |
| `/orders` | Order Approval & Status Management | Leader, STK Dept |
| `/orders/cart` | User Shopping Cart & Checkout | User |
| `/orders/history` | User Order History Log | User |
| `/team` | User Account Management & Role Assignment | STK Dept (Super Admin) |
| `/reports` | Reports & Member-wise Consumption Analytics | Leader, STK Dept |
| `/requests` | Special Item Requests & Password Resets | User, Leader, STK Dept |

---

### ⚙️ Backend API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/catalog` | `GET` | Fetches active categories and inventory items for storefront |
| `/api/stock-availability` | `GET` | Verifies real-time item stock levels |
| `/api/auth/verify-username` | `POST` | Verifies username existence for self-service password reset |
| `/api/admin/update-auth` | `POST` | Updates user authentication credentials |
| `/api/trigger-sync` | `POST` | Triggers background data cache synchronization |

---
