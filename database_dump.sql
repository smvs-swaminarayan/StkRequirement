-- STK Stock Management Universal Standard SQL Dump
-- Exported at: 2026-08-07T09:21:54.426Z

-- --------------------------------------------------------
-- Table structure for table `categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE categories (
      id INTEGER PRIMARY KEY ,
      name TEXT,
      description TEXT,
      is_deleted INTEGER DEFAULT 0,
      deletedAt TEXT,
      deletedById INTEGER,
      createdAt TEXT,
      updatedAt TEXT
    );

-- Dumping data for table `categories` (4 rows)
INSERT INTO `categories` (`id`, `name`, `description`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100000, 'Electric', 'This is added Electric items.', 0, NULL, NULL, '2026-04-03T10:51:57.000Z', '2026-04-03T10:51:57.000Z');
INSERT INTO `categories` (`id`, `name`, `description`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100002, 'General Store Others', '', 0, NULL, NULL, '2026-04-06T08:24:07.000Z', '2026-07-11T07:25:40.000Z');
INSERT INTO `categories` (`id`, `name`, `description`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100003, 'General Store Clothes', 'Imported category', 0, NULL, NULL, '2026-06-27T12:41:52.000Z', '2026-07-11T07:25:20.000Z');
INSERT INTO `categories` (`id`, `name`, `description`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100004, 'Stationary', 'This in added Stationary Items.', 0, NULL, NULL, '2026-04-03T10:50:48.000Z', '2026-04-03T10:50:48.000Z');

-- --------------------------------------------------------
-- Table structure for table `stockEntries`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `stockEntries`;
CREATE TABLE stockEntries (
      id INTEGER PRIMARY KEY ,
      date TEXT,
      categoryId INTEGER,
      itemId INTEGER,
      qty REAL,
      unit TEXT,
      notes TEXT,
      createdById INTEGER,
      is_deleted INTEGER DEFAULT 0,
      deletedAt TEXT,
      deletedById INTEGER,
      createdAt TEXT,
      updatedAt TEXT
    );

-- Dumping data for table `stockEntries` (65 rows)
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100000, '2026-04-27', 100002, 100027, 8, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:54:15.000Z', '2026-04-27T13:54:15.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100001, '2026-04-27', 100002, 100037, 4, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:55:50.000Z', '2026-04-27T13:55:50.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100002, '2026-07-14', 100000, 100033, 5, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:05:37.000Z', '2026-07-14T10:05:37.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100003, '2026-04-11', 100000, 100046, 3, 'piece', 'saas', 100019, 0, NULL, NULL, '2026-04-11T13:19:30.000Z', '2026-04-11T13:19:30.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100004, '2026-04-04', 100000, 100002, 10, 'piece', 'From P.Santo', 100020, 1, '2026-04-06T08:25:19.000Z', 100020, '2026-04-04T16:31:05.000Z', '2026-04-06T08:25:19.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100005, '2026-07-14', 100000, 100045, 4, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:07:20.000Z', '2026-07-14T10:07:20.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100006, '2026-07-14', 100000, 100015, 2, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:05:54.000Z', '2026-07-14T10:05:54.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100007, '2026-04-05', 100004, 100006, 99, 'piece', '', 100020, 1, '2026-04-06T08:25:06.000Z', 100020, '2026-04-05T10:03:46.000Z', '2026-04-06T08:25:06.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100008, '2026-04-27', 100002, 100022, 5, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:58:57.000Z', '2026-04-27T13:58:57.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100009, '2026-04-27', 100002, 100041, 15, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:56:42.000Z', '2026-04-27T13:56:42.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100010, '2026-07-14', 100004, 100006, 50, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:12:00.000Z', '2026-07-14T10:12:00.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100011, '2026-07-14', 100002, 100035, 20, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T09:57:11.000Z', '2026-07-14T09:57:11.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100012, '2026-04-27', 100002, 100026, 13, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:53:55.000Z', '2026-04-27T13:53:55.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100013, '2026-07-14', 100003, 100031, 6, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:08:00.000Z', '2026-07-14T10:08:00.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100014, '2026-04-27', 100002, 100057, 25, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:58:40.000Z', '2026-04-27T13:58:40.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100015, '2026-04-27', 100002, 100042, 6, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:59:07.000Z', '2026-04-27T13:59:07.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100016, '2026-04-27', 100002, 100050, 20, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:57:26.000Z', '2026-04-27T13:57:26.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100017, '2026-07-14', 100004, 100029, 2, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:06:53.000Z', '2026-07-14T10:06:53.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100018, '2026-04-27', 100002, 100005, 3, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:55:20.000Z', '2026-04-27T13:55:20.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100019, '2026-04-27', 100002, 100013, 5, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:57:09.000Z', '2026-04-27T13:57:09.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100020, '2026-04-27', 100002, 100044, 9, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:55:01.000Z', '2026-04-27T13:55:01.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100021, '2026-04-27', 100002, 100017, 9, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:54:27.000Z', '2026-04-27T13:54:27.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100022, '2026-04-27', 100002, 100009, 1, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:58:48.000Z', '2026-04-27T13:58:48.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100023, '2026-07-14', 100000, 100002, 2, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:05:28.000Z', '2026-07-14T10:05:28.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100024, '2026-07-14', 100003, 100000, 1, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:07:53.000Z', '2026-07-31T08:22:25.909Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100025, '2026-04-11', 100000, 100032, 5, 'piece', '', 100019, 0, NULL, NULL, '2026-04-11T13:22:38.000Z', '2026-04-11T13:22:38.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100026, '2026-04-27', 100002, 100052, 2, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:51:16.000Z', '2026-04-27T13:51:16.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100027, '2026-04-27', 100002, 100054, 10, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:53:48.000Z', '2026-04-27T13:53:48.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100028, '2026-04-06', 100000, 100040, 1, 'piece', '', 100020, 0, NULL, NULL, '2026-04-06T08:39:38.000Z', '2026-04-06T08:39:38.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100029, '2026-04-27', 100002, 100038, 15, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:56:22.000Z', '2026-04-27T13:56:22.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100030, '2026-04-27', 100002, 100028, 1, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:55:08.000Z', '2026-04-27T13:55:08.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100031, '2026-04-27', 100002, 100043, 4, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:54:05.000Z', '2026-04-27T13:54:05.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100032, '2026-04-13', 100000, 100015, 1, 'piece', '', 100020, 0, NULL, NULL, '2026-04-13T13:30:37.000Z', '2026-04-13T13:30:37.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100033, '2026-07-14', 100004, 100049, 8, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T09:58:02.000Z', '2026-07-14T09:58:02.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100034, '2026-04-27', 100002, 100019, 8, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:56:08.000Z', '2026-04-27T13:56:08.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100035, '2026-07-14', 100000, 100060, 10, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T09:56:08.000Z', '2026-07-14T09:56:08.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100036, '2026-07-14', 100000, 100056, 12, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:08:37.000Z', '2026-07-14T10:08:37.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100037, '2026-07-14', 100000, 100007, 3, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:05:47.000Z', '2026-07-14T10:05:47.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100038, '2026-04-27', 100002, 100061, 24, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:51:34.000Z', '2026-04-27T13:51:34.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100039, '2026-04-27', 100002, 100010, 3, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:55:30.000Z', '2026-04-27T13:55:30.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100040, '2026-04-27', 100002, 100036, 3, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:55:42.000Z', '2026-04-27T13:55:42.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100041, '2026-07-14', 100002, 100027, 4, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:08:25.000Z', '2026-07-14T10:08:25.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100042, '2026-07-14', 100004, 100024, 9, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:07:10.000Z', '2026-07-14T10:07:10.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100043, '2026-04-27', 100002, 100048, 12, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:51:25.000Z', '2026-04-27T13:51:25.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100044, '2026-04-27', 100002, 100016, 10, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:54:35.000Z', '2026-04-27T13:54:35.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100045, '2026-04-02', 100001, 100014, 100, NULL, '', 100022, 1, '2026-04-03T10:50:22.000Z', 100018, '2026-04-02T08:21:17.000Z', '2026-04-03T10:50:22.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100046, '2026-07-14', 100002, 100054, 5, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:07:42.000Z', '2026-07-14T10:07:42.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100047, '2026-07-14', 100002, 100012, 10, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:09:10.000Z', '2026-07-14T10:09:10.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100048, '2026-07-14', 100002, 100051, 12, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:09:28.000Z', '2026-07-14T10:09:28.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100049, '2026-04-06', 100000, 100040, 5, 'piece', '', 100020, 0, NULL, NULL, '2026-04-06T10:39:41.000Z', '2026-04-06T10:39:41.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100050, '2026-07-14', 100003, 100020, 10, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:07:31.000Z', '2026-07-14T10:07:31.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100051, '2026-04-27', 100002, 100023, 5, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:54:51.000Z', '2026-04-27T13:54:51.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100052, '2026-04-05', 100004, 100049, 499, 'piece', '', 100020, 1, '2026-04-06T08:24:38.000Z', 100020, '2026-04-05T10:03:57.000Z', '2026-04-06T08:24:38.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100053, '2026-04-27', 100002, 100001, 10, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:53:34.000Z', '2026-04-27T13:53:34.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100054, '2026-04-27', 100002, 100057, 25, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:58:02.000Z', '2026-04-27T13:58:02.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100055, '2026-04-27', 100002, 100008, 9, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:56:34.000Z', '2026-04-27T13:56:34.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100056, '2026-07-14', 100000, 100053, 10, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T09:56:27.000Z', '2026-07-14T09:56:27.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100057, '2026-04-27', 100002, 100003, 18, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:51:44.000Z', '2026-04-27T13:51:44.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100058, '2026-07-14', 100002, 100027, 8, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:08:14.000Z', '2026-07-14T10:08:14.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100059, '2026-04-27', 100002, 100025, 5, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:57:47.000Z', '2026-04-27T13:57:47.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100060, '2026-04-27', 100002, 100000, 4, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:52:55.000Z', '2026-04-27T13:52:55.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100061, '2026-04-27', 100002, 100018, 4, 'piece', '', 100019, 0, NULL, NULL, '2026-04-27T13:56:52.000Z', '2026-04-27T13:56:52.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100062, '2026-07-14', 100000, 100059, 2, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:06:09.000Z', '2026-07-14T10:06:09.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100063, '2026-07-14', 100000, 100034, 4, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:08:50.000Z', '2026-07-14T10:08:50.000Z');
INSERT INTO `stockEntries` (`id`, `date`, `categoryId`, `itemId`, `qty`, `unit`, `notes`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`) VALUES (100064, '2026-07-14', 100002, 100027, 8, 'piece', '', 100013, 0, NULL, NULL, '2026-07-14T10:10:03.000Z', '2026-07-14T10:10:03.000Z');

-- --------------------------------------------------------
-- Table structure for table `specialRequests`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `specialRequests`;
CREATE TABLE specialRequests (
      id INTEGER PRIMARY KEY ,
      type TEXT,
      itemId INTEGER,
      categoryId INTEGER,
      newItemName TEXT,
      newItemDescription TEXT,
      newItemCategoryGuess TEXT,
      newItemImageUrl TEXT,
      qty REAL,
      notes TEXT,
      status TEXT,
      requestedById INTEGER,
      decisionById INTEGER,
      decisionNote TEXT,
      decidedAt TEXT,
      createdAt TEXT,
      updatedAt TEXT
    , is_deleted INTEGER DEFAULT 0, deletedAt TEXT);

-- --------------------------------------------------------
-- Table structure for table `resetRequests`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `resetRequests`;
CREATE TABLE resetRequests (
      id INTEGER PRIMARY KEY ,
      username TEXT,
      status TEXT,
      temporaryPasswordIssued INTEGER,
      createdAt TEXT,
      resolvedAt TEXT,
      resolvedById INTEGER
    );

-- Dumping data for table `resetRequests` (2 rows)
INSERT INTO `resetRequests` (`id`, `username`, `status`, `temporaryPasswordIssued`, `createdAt`, `resolvedAt`, `resolvedById`) VALUES (100000, 'savan', 'OPEN', 0, '2026-04-02T09:22:00.000Z', NULL, NULL);
INSERT INTO `resetRequests` (`id`, `username`, `status`, `temporaryPasswordIssued`, `createdAt`, `resolvedAt`, `resolvedById`) VALUES (100001, 'sevak_32', 'OPEN', 0, '2026-04-02T10:18:55.000Z', NULL, NULL);

-- --------------------------------------------------------
-- Table structure for table `auditLogs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `auditLogs`;
CREATE TABLE auditLogs (
      id INTEGER PRIMARY KEY ,
      action TEXT,
      entityType TEXT,
      entityId INTEGER,
      userId INTEGER,
      details TEXT,
      createdAt TEXT
    );

-- Dumping data for table `auditLogs` (427 rows)
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100000, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:05:47.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100001, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-07-08T09:10:15.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100002, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-05T10:03:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100003, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:52:15.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100004, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-11T13:08:22.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100005, 'STOCK_ENTRY_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-06T08:24:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100006, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-07T16:32:33.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100007, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:49:43.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100008, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-04-06T13:03:28.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100009, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-07-15T12:48:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100010, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:57:47.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100011, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:54:49.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100012, 'APPROVE', NULL, NULL, NULL, NULL, '2026-07-22T09:05:49.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100013, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:09.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100014, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:48:53.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100015, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:48:15.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100016, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:51:16.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100017, 'CATEGORY_CREATED', NULL, NULL, NULL, NULL, '2026-04-06T08:24:07.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100018, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-04T16:24:02.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100019, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-04-28T09:17:11.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100020, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T11:13:59.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100021, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:24:00.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100022, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-06-30T04:56:13.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100023, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:19:57.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100024, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:16:08.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100025, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:57:09.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100026, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:25:04.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100027, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-06T08:24:28.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100028, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:49:29.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100029, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:32.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100030, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-27T08:01:26.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100031, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:45.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100032, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:53:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100033, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:05:54.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100034, 'ITEM_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-07T16:16:33.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100035, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:37:17.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100036, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:45:58.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100037, 'SELF_RESET_PASSWORD', NULL, NULL, NULL, NULL, '2026-04-11T13:15:40.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100038, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:35:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100039, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-04-09T09:21:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100040, 'CREATE', NULL, NULL, NULL, NULL, '2026-07-26T07:54:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100041, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:54:15.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100042, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:49:19.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100043, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:11:26.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100044, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:51:25.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100045, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100046, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:18:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100047, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:54:49.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100048, 'CATEGORY_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-03T10:50:08.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100049, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-25T15:49:47.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100050, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:23:39.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100051, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T10:46:25.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100052, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:48:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100053, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-08T09:10:53.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100054, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-07T09:55:39.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100055, 'USER_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T06:54:53.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100056, 'STOCK_ENTRY_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-06T08:24:37.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100057, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:54:51.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100058, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:33:18.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100059, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T10:40:50.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100060, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:23:34.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100061, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:23:08.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100062, 'STOCK_ENTRY_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-06T08:24:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100063, 'ITEM_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-08T05:44:32.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100064, 'USER_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-06T08:40:23.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100065, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:09:11.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100066, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:20:35.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100067, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:53:34.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100068, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:26.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100069, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-12T08:03:49.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100070, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100071, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:58:48.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100072, 'CREATE', NULL, NULL, NULL, NULL, '2026-07-22T08:54:26.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100073, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-03T10:50:14.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100074, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-12T08:03:30.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100075, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:07:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100076, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:23:49.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100077, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:53:48.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100078, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-08T09:11:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100079, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:45.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100080, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:25:21.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100081, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-08T09:10:39.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100082, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:19.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100083, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:14:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100084, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-05-11T04:25:42.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100085, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:37:19.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100086, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-25T15:48:17.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100087, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:11:23.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100088, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:10:03.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100089, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:11:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100090, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-07-08T09:10:16.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100091, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:30:04.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100092, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:19:52.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100093, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:57:35.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100094, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:14:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100095, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-22T09:02:48.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100096, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T08:09:12.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100097, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-07-08T09:10:17.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100098, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:49:24.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100099, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-27T13:59:34.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100100, 'CATEGORY_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-03T10:50:03.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100101, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:16:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100102, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:23:22.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100103, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T12:57:09.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100104, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:14:43.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100105, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:16:22.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100106, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:49:14.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100107, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:52.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100108, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T09:56:09.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100109, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:30:54.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100110, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:06:19.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100111, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:15:39.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100112, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:12:11.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100113, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T11:04:05.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100114, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-25T15:50:00.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100115, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-08T09:11:45.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100116, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-05T10:04:24.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100117, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-11T13:06:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100118, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:54:35.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100119, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-06T08:39:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100120, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-06T08:24:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100121, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:26:21.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100122, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:08:00.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100123, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:44.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100124, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-04-28T10:04:44.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100125, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-04T16:25:09.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100126, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:44:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100127, 'CATEGORY_UPDATED', NULL, NULL, NULL, NULL, '2026-07-11T07:25:40.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100128, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-04T12:27:00.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100129, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:54.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100130, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:28:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100131, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-04T16:27:17.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100132, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:56.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100133, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:48:25.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100134, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:23:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100135, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:26:33.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100136, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:51:44.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100137, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:23:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100138, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:15:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100139, 'USER_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T11:25:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100140, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-06-30T04:55:54.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100141, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:26:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100142, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T11:05:07.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100143, 'USER_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T06:55:34.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100144, 'CATEGORY_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:50:48.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100145, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-05T10:04:24.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100146, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-03T10:50:12.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100147, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T08:05:32.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100148, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:46:37.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100149, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-25T15:50:10.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100150, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-08T09:11:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100151, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:11:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100152, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:20:03.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100153, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:07:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100154, 'USER_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T06:54:32.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100155, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:58:44.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100156, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-05T10:05:11.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100157, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:37.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100158, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:28:02.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100159, 'STOCK_ENTRY_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-06T08:25:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100160, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:20:19.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100161, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-27T13:46:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100162, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:55:50.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100163, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-07-08T09:10:18.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100164, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:11:29.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100165, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-05-11T04:25:21.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100166, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T11:28:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100167, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-07T09:55:57.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100168, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-08T09:11:05.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100169, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-04T16:23:52.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100170, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:05:28.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100171, 'STOCK_ENTRY_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-06T08:25:06.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100172, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-06T13:19:24.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100173, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:12:12.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100174, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:19:33.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100175, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-06T10:39:41.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100176, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:48:00.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100177, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:22.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100178, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:11:23.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100179, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:55:42.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100180, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:33:26.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100181, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:26:27.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100182, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:17.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100183, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T09:58:41.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100184, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-11T13:07:37.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100185, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-07-08T09:04:41.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100186, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:31:28.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100187, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-12T08:04:02.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100188, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:41:29.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100189, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:12:40.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100190, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:01.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100191, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-04T16:28:07.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100192, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:44:07.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100193, 'SELF_RESET_PASSWORD', NULL, NULL, NULL, NULL, '2026-07-14T09:54:48.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100194, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:58:40.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100195, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:56:08.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100196, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:25:27.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100197, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-06-30T04:55:11.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100198, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:19:28.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100199, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:23:00.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100200, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-03T10:50:15.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100201, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:28:12.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100202, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:42:24.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100203, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:28:04.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100204, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:56.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100205, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T11:23:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100206, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:54.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100207, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-25T15:49:56.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100208, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T08:04:27.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100209, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:23:21.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100210, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:00:32.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100211, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:47:43.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100212, 'ITEM_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-09T09:08:06.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100213, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:49:01.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100214, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:45.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100215, 'STOCK_ENTRY_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-06T08:25:10.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100216, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:07:10.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100217, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:34:16.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100218, 'CATEGORY_UPDATED', NULL, NULL, NULL, NULL, '2026-07-11T07:25:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100219, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-06T08:24:22.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100220, 'STOCK_ENTRY_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-03T10:50:23.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100221, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:54:06.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100222, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-04-06T08:41:02.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100223, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T10:46:52.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100224, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:56:42.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100225, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:19:14.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100226, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T10:48:07.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100227, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T09:31:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100228, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:12:12.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100229, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:35:07.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100230, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:19:45.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100231, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100232, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:06:54.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100233, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-05T10:05:41.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100234, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T08:06:05.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100235, 'CATEGORY_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:51:57.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100236, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T10:48:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100237, 'SELF_RESET_PASSWORD', NULL, NULL, NULL, NULL, '2026-04-03T09:53:37.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100238, 'SELF_RESET_PASSWORD', NULL, NULL, NULL, NULL, '2026-04-03T12:27:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100239, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:23:42.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100240, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T10:42:59.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100241, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:25:33.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100242, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:51.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100243, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-08T09:11:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100244, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:20:14.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100245, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:55:25.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100246, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-05-11T04:26:16.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100247, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:39:53.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100248, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:20:45.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100249, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:25:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100250, 'ITEM_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-11T13:17:45.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100251, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-04T16:27:56.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100252, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:25:52.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100253, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:45.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100254, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:08:14.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100255, 'USER_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:44:25.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100256, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:26:09.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100257, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T09:56:28.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100258, 'USER_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-05T10:00:05.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100259, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:47:04.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100260, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-06T13:19:13.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100261, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:20:08.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100262, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:49:48.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100263, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:53.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100264, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-04T16:25:59.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100265, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:47:35.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100266, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-07-08T09:10:21.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100267, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:56:42.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100268, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-11T13:19:30.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100269, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:23:18.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100270, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:26:13.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100271, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T09:57:11.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100272, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:03:54.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100273, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-04T16:31:05.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100274, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:49:07.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100275, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-07-08T09:10:14.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100276, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:15:54.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100277, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T08:04:48.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100278, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:20:43.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100279, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:08:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100280, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:28:08.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100281, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-11T13:22:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100282, 'USER_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-06T08:40:15.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100283, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:19:39.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100284, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:11:27.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100285, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-08T09:11:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100286, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:12:49.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100287, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:48:47.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100288, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T08:05:48.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100289, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:28:17.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100290, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:54:49.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100291, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:20:37.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100292, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:23:52.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100293, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:49:33.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100294, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-06T08:37:13.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100295, 'SELF_RESET_PASSWORD', NULL, NULL, NULL, NULL, '2026-07-25T14:14:08.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100296, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:52:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100297, 'USER_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-06T08:40:27.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100298, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-05T12:43:16.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100299, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:08:37.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100300, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T09:58:02.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100301, 'USER_CREATED', NULL, NULL, NULL, NULL, '2026-04-05T10:01:00.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100302, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:57:27.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100303, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:23:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100304, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:23:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100305, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:05:12.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100306, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:23:25.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100307, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T08:04:18.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100308, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T11:23:14.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100309, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-04-09T09:21:58.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100310, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-06-30T04:55:18.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100311, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:47:19.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100312, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:03:57.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100313, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-06-30T04:55:46.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100314, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:11:21.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100315, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T08:08:52.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100316, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:54:28.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100317, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-13T13:30:37.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100318, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:52:26.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100319, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T08:04:36.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100320, 'SELF_RESET_PASSWORD', NULL, NULL, NULL, NULL, '2026-04-03T12:28:04.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100321, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:28:15.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100322, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:46:29.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100323, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-04T12:26:30.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100324, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-05T12:43:58.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100325, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:30.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100326, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:55:01.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100327, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:12:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100328, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:45:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100329, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:19:22.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100330, 'USER_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-03T11:24:53.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100331, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:42.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100332, 'USER_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-03T11:24:49.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100333, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:19:10.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100334, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:23:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100335, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:56.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100336, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:48:42.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100337, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-22T09:01:54.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100338, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T08:23:07.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100339, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:25:40.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100340, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:47:26.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100341, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:35.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100342, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-25T14:16:01.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100343, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-03T10:50:13.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100344, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:56:52.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100345, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:20:31.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100346, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:12:22.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100347, 'SELF_RESET_PASSWORD', NULL, NULL, NULL, NULL, '2026-04-03T09:53:04.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100348, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-08T09:19:13.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100349, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:12:00.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100350, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:16:15.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100351, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-06-27T16:16:01.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100352, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-09T08:05:22.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100353, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:47:50.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100354, 'USER_CREATED', NULL, NULL, NULL, NULL, '2026-04-04T16:21:32.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100355, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-05T10:04:24.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100356, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:59.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100357, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:16.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100358, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:16:02.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100359, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:22:05.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100360, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:25:10.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100361, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:43.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100362, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:07:53.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100363, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:58:57.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100364, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-04-09T09:21:59.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100365, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:06:10.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100366, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:07:42.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100367, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:23:43.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100368, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-07-08T09:10:19.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100369, 'ITEM_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-05T10:20:10.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100370, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-04T16:27:23.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100371, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:49:37.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100372, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:30.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100373, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:39.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100374, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:09:28.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100375, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:21:42.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100376, 'USER_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T06:55:09.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100377, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-05T10:03:57.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100378, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:08:25.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100379, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:25:58.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100380, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:12.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100381, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:05:37.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100382, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:52:33.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100383, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:53:34.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100384, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-06-30T04:55:01.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100385, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:47:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100386, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-07T16:31:42.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100387, 'USER_DEACTIVATED', NULL, NULL, NULL, NULL, '2026-04-03T11:24:41.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100388, 'SELF_RESET_PASSWORD', NULL, NULL, NULL, NULL, '2026-07-22T08:54:51.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100389, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:55:08.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100390, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-07-14T10:08:51.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100391, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:52:55.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100392, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T12:26:54.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100393, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:56:35.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100394, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:39:53.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100395, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:59:07.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100396, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:50.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100397, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:11:25.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100398, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:58:02.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100399, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:22:38.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100400, 'CREATE', NULL, NULL, NULL, NULL, '2026-07-25T10:57:18.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100401, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:26:39.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100402, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:56:22.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100403, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-04-11T13:18:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100404, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-07-24T12:20:25.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100405, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:48:33.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100406, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-04-09T09:22:00.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100407, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-07T09:23:49.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100408, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:12:14.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100409, 'ORDER_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T11:23:14.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100410, 'USER_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T11:28:03.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100411, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:51:34.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100412, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-04-27T13:44:58.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100413, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:54:59.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100414, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-06T13:19:27.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100415, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T07:53:27.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100416, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-14T13:27:40.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100417, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-07-08T09:04:32.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100418, 'ORDER_STATUS_UPDATED', NULL, NULL, NULL, NULL, '2026-04-03T12:31:13.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100419, 'SELF_RESET_PASSWORD', NULL, NULL, NULL, NULL, '2026-04-11T13:16:29.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100420, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-03T10:56:21.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100421, 'ITEM_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:47:13.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100422, 'ITEM_UPDATED', NULL, NULL, NULL, NULL, '2026-07-27T08:07:12.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100423, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:55:30.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100424, 'STOCK_ENTRY_CREATED', NULL, NULL, NULL, NULL, '2026-04-27T13:55:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100425, 'ITEM_RECOVERED', NULL, NULL, NULL, NULL, '2026-07-08T09:10:20.000Z');
INSERT INTO `auditLogs` (`id`, `action`, `entityType`, `entityId`, `userId`, `details`, `createdAt`) VALUES (100426, 'ITEM_SOFT_DELETED', NULL, NULL, NULL, NULL, '2026-07-14T10:11:22.000Z');

-- --------------------------------------------------------
-- Table structure for table `meta`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `meta`;
CREATE TABLE meta (
      id TEXT PRIMARY KEY,
      nextProductId INTEGER DEFAULT 1
    );

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE "users" (
      uid INTEGER PRIMARY KEY ,
      username TEXT,
      displayName TEXT,
      password TEXT,
      role TEXT,
      assignedCategoryIds TEXT,
      defaultLeaderCategoryId INTEGER,
      is_deleted INTEGER DEFAULT 0,
      deletedAt TEXT,
      deletedById INTEGER,
      createdAt TEXT,
      updatedAt TEXT,
      lastLoginAt TEXT
    );

-- Dumping data for table `users` (18 rows)
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100000, 's111', 'Sahaj Maharaj (1)', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:42:06.000Z', '2026-07-24T12:20:08.000Z', '2026-07-30T10:03:26.679Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100001, 's113', 'Ghanshyam Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:42:08.000Z', '2026-07-24T12:19:57.000Z', '2026-06-27T12:42:08.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100002, '64', 'H. Gunanidhi Swami', 'password123', 'SUPER_ADMIN', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:41:54.000Z', '2026-07-27T07:59:45.000Z', '2026-08-01T10:00:33.312Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100003, 's112', 'Khush Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:42:07.000Z', '2026-07-24T12:20:03.000Z', '2026-06-27T12:42:07.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100004, 's119', 'Jaydeep Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-07-14T06:55:09.000Z', '2026-07-24T12:19:22.000Z', '2026-07-14T06:55:09.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100005, '107', 'H. Rajeshwar Swami', 'password123', 'SUPER_ADMIN', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:41:55.000Z', '2026-07-24T08:20:47.000Z', '2026-07-24T08:20:47.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100006, 's118', 'Savan Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-07-14T06:54:53.000Z', '2026-07-24T12:19:28.000Z', '2026-07-14T06:54:53.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100007, 's87', 'Jigar Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:41:58.000Z', '2026-07-24T12:20:37.000Z', '2026-06-27T12:41:58.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100008, 's69', 'Sukham Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:42:00.000Z', '2026-07-24T12:20:30.000Z', '2026-06-27T12:42:00.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100009, 's109', 'Sahdev Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:42:04.000Z', '2026-07-24T12:20:14.000Z', '2026-06-27T12:42:04.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100010, 's116', 'Abhishek Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:42:13.000Z', '2026-07-24T12:19:38.000Z', '2026-06-27T12:49:11.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100011, 's106', 'Ketul Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:42:01.000Z', '2026-07-24T12:20:25.000Z', '2026-06-27T12:42:01.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100012, 's114', 'Darshan Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:42:10.000Z', '2026-07-24T12:19:52.000Z', '2026-07-21T15:02:39.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100013, 's115', 'Sahaj Maharaj (2)', 'password123', 'LEADER', '[100000,100003,100002,100004]', 100003, 0, NULL, NULL, '2026-06-27T12:42:11.000Z', '2026-07-27T05:43:43.000Z', '2026-07-27T05:43:43.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100014, 's117', 'Dixit Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-07-14T06:54:31.000Z', '2026-07-24T12:19:33.000Z', '2026-07-14T06:54:31.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100015, 's108', 'Chintan Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:42:03.000Z', '2026-07-24T12:20:19.000Z', '2026-06-27T12:42:03.000Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100016, 's120', 'Parthiv Maharaj', '120120', 'USER', '[100000,100003,100002,100004]', 100000, 0, NULL, NULL, '2026-07-14T06:55:34.000Z', '2026-07-26T09:00:13.000Z', '2026-08-05T09:48:40.523Z');
INSERT INTO `users` (`uid`, `username`, `displayName`, `password`, `role`, `assignedCategoryIds`, `defaultLeaderCategoryId`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES (100017, 's4', 'Sanyam Maharaj', 'password123', 'USER', '[]', NULL, 0, NULL, NULL, '2026-06-27T12:41:57.000Z', '2026-07-24T12:20:43.000Z', '2026-06-27T16:10:33.000Z');

-- --------------------------------------------------------
-- Table structure for table `items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `items`;
CREATE TABLE "items" (
      id INTEGER PRIMARY KEY ,
      productId TEXT,
      name TEXT,
      description TEXT,
      categoryId INTEGER,
      unit TEXT,
      imageUrl TEXT,
      imageCrop TEXT,
      images TEXT,
      createdById INTEGER,
      is_deleted INTEGER DEFAULT 0,
      deletedAt TEXT,
      deletedById INTEGER,
      createdAt TEXT,
      updatedAt TEXT,
      is_permission TEXT DEFAULT 'NO'
    );

-- Dumping data for table `items` (62 rows)
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100000, 'PD055', 'Innerwear - 100', '', 100000, 'piece', 'https://m.media-amazon.com/images/I/61PPz4qFaVL._SY741_.jpg', '{"zoom":1,"aspect":"square","focusX":50,"focusY":50}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:52:25.000Z', '2026-07-27T07:25:58.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100001, 'PD057', 'Innerwear - 110', '', 100003, 'piece', 'https://m.media-amazon.com/images/I/61PPz4qFaVL._SY741_.jpg', '{"aspect":"square","focusX":50,"focusY":50,"zoom":1}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:52:38.000Z', '2026-07-27T07:26:21.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100002, 'PD001', 'Pagariya Player', 'Pagariya Player', 100000, 'piece', 'https://m.media-amazon.com/images/I/41KKv-ItoNL._SX300_SY300_QL70_FMwebp_.jpg', '{"aspect":"square","zoom":1,"focusX":50,"focusY":50}', '[{"url":"https://m.media-amazon.com/images/I/71Tm0st8KEL._SX522_.jpg","crop":null},{"url":"https://m.media-amazon.com/images/I/718pXTiUWwL._SX522_.jpg","crop":null},{"url":"https://m.media-amazon.com/images/I/71ewBIeemXL._SX522_.jpg","crop":null}]', 100018, 0, NULL, NULL, '2026-04-03T10:56:21.000Z', '2026-04-09T09:22:00.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100003, 'PD027', 'Innerwear 95', '', 100003, 'piece', 'https://m.media-amazon.com/images/I/61PPz4qFaVL._SY741_.jpg', '{"focusX":50,"focusY":50,"aspect":"square","zoom":1}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:23:55.000Z', '2026-07-27T07:26:46.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100004, 'PD019', 'Underwear 95', '', 100000, 'piece', NULL, NULL, '[]', 100020, 1, '2026-07-14T10:12:12.000Z', 100013, '2026-04-07T09:23:38.000Z', '2026-07-14T10:12:12.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100005, 'PD037', 'બોટલ', '', 100002, 'piece', 'https://m.media-amazon.com/images/I/61u9eMxFd0L._SL1500_.jpg', '{"zoom":1,"focusY":50,"focusX":50,"aspect":"square"}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:47:55.000Z', '2026-07-27T08:07:12.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100006, 'PD059', 'Pen', '', 100004, 'piece', 'https://m.media-amazon.com/images/I/71C5dsaJ0JL._SX522_.jpg', '{"aspect":"square","zoom":1,"focusX":50,"focusY":50}', '[{"url":"https://m.media-amazon.com/images/I/715Bh7FOkML._SX522_.jpg","crop":null},{"url":"https://m.media-amazon.com/images/I/71+nqPCbfbL._SX522_.jpg","crop":null},{"url":"https://m.media-amazon.com/images/I/71OCjJDk0eL._SX522_.jpg","crop":null}]', 100018, 0, NULL, 100013, '2026-04-03T10:53:34.000Z', '2026-07-25T15:49:56.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100007, 'PD005', 'Player - Amkette', '', 100000, 'piece', 'https://m.media-amazon.com/images/I/41aiTGcl6DL._SY300_SX300_QL70_FMwebp_.jpg', '{"focusY":50,"focusX":50,"zoom":1,"aspect":"square"}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:20:35.000Z', '2026-07-27T07:31:27.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100008, 'PD045', 'સફેદ ગૌમુખી', '', 100002, 'piece', NULL, NULL, '[]', 100019, 0, NULL, NULL, '2026-04-27T13:48:53.000Z', '2026-07-14T13:28:04.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100009, 'PD052', 'તિલકિયું', '', 100002, 'piece', 'https://i.postimg.cc/fR00T1cf/Tilakiyu.jpg', '{"zoom":1,"focusY":50,"focusX":50,"aspect":"square"}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:49:33.000Z', '2026-07-27T07:44:07.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100010, 'PD038', 'બોટલ કવર', '', 100002, 'piece', 'https://m.media-amazon.com/images/I/61vQVBJ0CjL._SL1500_.jpg', '{"focusX":50,"aspect":"square","focusY":50,"zoom":1}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:48:00.000Z', '2026-07-27T08:08:37.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100011, 'PD010', 'Adapter', '', 100000, 'piece', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT4tpSnDuaa5wgr2atmilA_pyp_AdCbnefsYyaij9Li3NskfsFI6wGm5oM4AK01horsFvKxWPRboaSCJE8CYrJyvoA9KnFOase1gR1U6UcIYnCH8AOhaRQDdA', '{"aspect":"square","zoom":1,"focusX":50,"focusY":50}', '[{"url":"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSpxuIGJGJEO2R0TZvsOZ3l1HhtR4CnkWiPRrpB4Q4hQ0T0HMppf5AasoIczL9zf2ZFob9XIPksBhRXIwU9fEVYTgWiVXj5pyPzuLHgPJo","crop":{"aspect":"square","zoom":1,"focusX":50,"focusY":50}},{"url":"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTargAhe5ms18eY7vL5QNvUj7WzRTOMMotb2mWg8rozfACRYjxvKrf2-YzGLU9ImgC4izAzloVa6CxLA5OGmAYjd30iW0QnLtWpWOcFmUXcoqeqxNthtjn4SOw","crop":{"aspect":"square","zoom":1,"focusX":50,"focusY":50}}]', 100020, 1, '2026-07-08T09:11:46.000Z', 100013, '2026-04-07T09:21:30.000Z', '2026-07-08T09:11:46.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100012, 'PD041', 'ટંગ ક્લીનર', '', 100002, 'piece', 'https://m.media-amazon.com/images/I/71zf6VvDqCL._SL1254_.jpg', '{"focusX":50,"aspect":"square","zoom":1,"focusY":50}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:48:25.000Z', '2026-07-27T07:55:24.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100013, 'PD048', 'ઓરસિયુ', '', 100002, 'piece', NULL, NULL, '[]', 100019, 1, '2026-07-14T10:11:27.000Z', 100013, '2026-04-27T13:49:14.000Z', '2026-07-14T10:11:27.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100014, 'PD058', 'Pen', '', 100001, 'piece', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJgAAACUCAMAAABY3hBoAAAA9lBMVEX///8kUJv5+fkAAAC7ubokT5wiICHAvr/8/PyPjY7DwcLo6Oja2tqzs7OZl5iEgoPx9vpWVlZKSUng4OCurK2hn6Bvbm4mTpIjUZnx8fFAQEB9fH11c3SnpaYAPY7Pz89lY2QXSZoZFxgANIsAGkE5OTnAzNsfJjjo7fMhHRcjNlwnRX4oSogAIEsiKDUPDA0AI1QmQXNAQUkxOk5YcqgAAEISFB1fXFcAKojZ3eikscwABSARNWyYqMpEZqUTLlovLS2AlLUSKU1jeaUdKEI9WpoSGy4NHDkiMlAhICiywNRGZZoADjUAACcQQ4xDUGpwfJZ9i7QCKO+RAAAKVElEQVR4nO2ce1ubyhaHgWFIIAEEwyUJJARNNCaVZh9Pu1Pbmlptrd3bc/b3/zJnrSFqEsgdiH+cefpEo4Jvf2vNuswMcgL3Rsf/wdaOumUYhmnVp2/fDFil4VfgtWlMyd4KWNU8htdyVdGCGOmNgFUN5OKUkqKabfaVtwHWDtCAZdVXlJqtsS+9CbB2UMEPolYDsKbMvnZgsMpxGQzI9OJUD8FUW2XfOSyY/8e/7LYYc7VtnSlmVg8OVg/eO1fDf38Q8U216TEwPbbkIcHqH9//2ePGn0bXPscdazqCtX1TOBRYpRY0Gg1Tq04+uz3AG39xTpuVGgNTfbPCHQasLBtNXyyJokcGJz3u6MvXTovyp4GIYJbWfeYqGqzUkEui6vuqdj186nG9kw7lcdwYluzpeuOFq2Aw2aiVfK87MT+eOa0e960VY/G8exvIXnNSff3RIsGOA11RdVOvC8Gt6/aOvk+58NW9C7zuDFeRYFVTU2oBpELBvqWt8dHvTszEUwr/nMtGe/aniwMrmWrJajQF7rj7ueOMz792+NlBB3/MsRQGVjNEUetCgq52P1N+fHS/wEWHH6xDgGm2oja7YCzlcgB6jRe4YDyEk8rMBQWByZ5S87AWVC6HHeccuSidU2zUl8iskxUD1tQVP8DSVD0bdu7Px05Cr4EkSaToWVkGLstoItcPB/VKcFHnDATTZy8qAKwM4cs3sGio/XQ6X496DuXpPJj7AFz23FX5gwmerFgNnHF+zPW0QAVvL/pSZNbnL8ubq/zKdcp3fgsJLpgFI0mKjMr8dXmDlXXgmmC1bJ26raukXsAFjh81FrhyB0OuBhSCoJfbmXLNooG7DS77YaO6eGHOYLI+1UsDO14t2NGlbEIC1yTBlTOY3AS9avCJ/x78K8WOPHXvpLDbTl6aK5jmKVYXubR3S/weA0UYJfXKF8yyFctk/vWO6dVJ6IWBIpyk6JUrmGgovolxAvRqXQmPSTvy9EIKSZpeeYIpRqlmYpbx37udr+VeK8HlQuYOpVS9cgSrGqJqNMuoFwX/enQoTXjYCPRawpUbWMVQxQCznwXz8Z5L0QsCWF8KS8tukBOYEPglD+scnI8Qv5wUvx/8koiy/A75gDW1kmcIK/Si/LDfD9Xld8gHTNMVGRdT0b+uyilxFfXqkxVc+YCJgaJhHY12/ApxNYlFh2BHbdU98gCzJoaMWYb511Fa/OKHoNdKrjzArEC0JCvmuj9K8y86vFwopIsA842SqJkCcLlL9AKuPsEQVyiYaIgly6gxrq9peoEdQa9g3X2yBmt3xZKvm4LM8naKXpTpZa/RK3Owilkr1WTPYnXOeVqcgMJQIsZarqzBoGJVZc2wb6Z6JcGgYI2C9VxZgzVUUZOb/QvU67GTzNvABY3aJr80a8UM2wgY19FjSl2IHfdiA1kMmNCuqf0HF/0rrV517vrJRq0QMBge8y+ME0k7bqxXDmDBDT/VK1EXOg/9qHu84X2yNmWAefu810q6F+/e9cPuZnbMHuzjrYtcT0kzol5pjW0hYELw/jkPuYtk4F/bcGULNtUrNU6AXtLyQjpXMOEj1NGg10kCy6Uu6BUua4jyBvt4y/yeT+nTQK8VDVG+YOBfrI4+ScmPqNeKhihfsCDWK+H0uKCDK6yrGo8cwQQb+zQhxb9Ar8v+qgYyXzCb6TVOrkfH/kX8re+YCZhgn2LfMU7TC/L29nbMCsz7ifFrfJ8evyQi73DPDMAE+y+M9+M/U9YBnMud7JgNWPOH07k/P0/V625HvTIAE7y/cb9jfNLhE47P9FrdcOcHpuO+1TipF53q5e143z3BmF735+OT5Dom9LW4o7ZBQ5QHGOrFg14dNxkncKdvk0YtB7CyHevVWtyvZetMaMedufYDe/avTsKOdHgmSWSjBjJ7sLL3olciTqBeUbDP/3qPa/WfDn1K04tnfh9NNmzUMgYrexDvwY5PKfFrAHqFxl5cu4PJpw49SZw3YQFsKEmg18aNWrZgOugFcSJ5ToHyI+AKG/vptTOY9c6lJ700/8KNZCkMN224MwaTyYBSZsdExB/1gWtfO+4KZtnq30894WqZHbdr1LIDswyodezz3ylx4gL1krZouLMEK2FAr5v/6SyqxbuMK9y68cgGTDXYh3r3xuUXligekCvKwI67gFWfA2eNjOjr4gll++54pGmHxiMTMG8qSLWkfRi8crnYbqNemdhxB7CyHe8dHIuiol87L9UOHd4xvWoZcW0LJgSE/e5jVRTFkv5jOC3EWDkBXNstnGQHVrcJ0RoVropcQNa8HrLemw7OGNdOjVoGYHWThCr3X7MtTgdqhqtOgzBLv98arA52FLl/Ojem8kImo2aj2I47Nmp7g1UaUVji/mnx/K1XeiHTJgMMq1n6/ZZgdYMQBbmg8f+hv2pW60ZS5nptAVYxoxDs2GKzcHgtv2jmy8EkzNTvtwKrPOvFemw6DOVYs5Ivy5ruZa3XxmCoV4n79rLhQYfXOtNMk2FogbX+FrmAoX+J3LfZemL4oQmaWYzLyFyvDcFi//o2s0GESyY/DZVxyUbW/rUpGOqlcl/mDpzgHLiZ2GjJRg56bQQGcTWqcV8SBxXoKAy7QdDIMt5vA1aG/OgnuPD86i+IXk1/735oRzDBI8TiPs1z4VMeI+CK8lFrIzCdEBm4FtSK28eMs9BWYHLMtXjMndkxypFrHZhGiMc9Jv1+kHH1tS2YyriSB37Rv/LlWg0mRsTgkg8GgF79XP1rHVgbuOrjBS6KdWHO/rUGrNol3fq5k4xfWVfRW4IJEulWz+87i4IVotcKMEiQ0fFRYsEw1iu7Lm17MEiQytH3BBfoFYZi/lxLwTQswL7Pn4SJ/Wv5ue0iwPwIiuUviyd06Eha9lxAQWBtQvSFBMn8vi9F+6+u7gEGgcLk5k40sbyNzzWZWawW7gommKRRH7sz+1bsM3zQcM9dhT3BmoQcHyUC6wWECbswrjQwi0QwITuzclGKy6vrjkfnDAaOr2FHROfseNcPcy4n1oFVuiTgHueOduDuYz+Uck+Pq8Fs0qiM5xej8bG5qKDwtRSsRkh1zvFZmOiTxccfiwarTsDB5jJkPB332qzNAKxsEHtuKYDn8XBh9ms524L5RKo/znGh2+dfFa4Dq0pEeXV8yrK2RMyCsuNyMCGAHvJqtmTFqBoU7fZJMB9S97eT18iKZoyyX5LbGqwyIe0xH28oINfgUoomWW0N7QFW9ogV/7EHLCvi5BgUl7SXgyloyNZzUHXOoIb2C49eKWDlLql+os9/SuQCg31RNeFqMJFoz7U0dR5ALv2AcnEzYNrtUysuoXnMjYWV0MvGC5j1VzwZqXMhQYt0OK+fjmewSuA/MDuO8AGwg8T6+fEMJvucfwsp+0Iikrr7ObnsxhTsOIAX+Xb0i4TyW8B6AcOzAWU7IiQ4tNM/jxhMaeKBCo0T3oZaOGIw45hTjYKL+jWDgWm1SrDbiej8BoJVgtobk4uLwVRyqKJrxWCKvZWZODsOm6lXjLcK9j/AoQFYSWcG0QAAAABJRU5ErkJggg==', '{"aspect":"square","zoom":1,"focusX":50,"focusY":50}', '[]', NULL, 1, '2026-04-03T10:50:14.000Z', 100018, '2026-04-02T08:20:40.000Z', '2026-04-03T10:50:14.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100015, 'PD006', 'Player - OUD, Bit', '', 100000, 'piece', 'https://i.postimg.cc/8c8092mM/BKK-Player.jpg', '{"zoom":1,"focusX":57.431563295797616,"focusY":50,"aspect":"landscape"}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:20:45.000Z', '2026-07-27T08:23:38.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100016, 'PD033', 'Underwear - 110', '', 100002, 'piece', NULL, NULL, '[]', 100019, 1, '2026-07-14T10:11:20.000Z', 100013, '2026-04-27T13:47:26.000Z', '2026-07-14T10:11:20.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100017, 'PD032', 'Underwear - 100', '', 100002, 'piece', NULL, NULL, '[]', 100019, 1, '2026-07-14T10:11:20.000Z', 100013, '2026-04-27T13:47:19.000Z', '2026-07-14T10:11:20.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100018, 'PD047', 'પ્રસાદીની વાટકી', '', 100002, 'piece', NULL, NULL, '[]', 100019, 0, NULL, NULL, '2026-04-27T13:49:06.000Z', '2026-07-14T13:27:43.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100019, 'PD043', 'સ્ટેશનરી પાઉચ (નાનું)', '', 100002, 'piece', NULL, NULL, '[]', 100019, 0, NULL, NULL, '2026-04-27T13:48:41.000Z', '2026-07-14T13:28:08.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100020, 'PD020', 'Underwear 100', '', 100003, 'piece', NULL, NULL, '[]', 100020, 1, '2026-07-14T10:11:24.000Z', 100013, '2026-04-07T09:23:42.000Z', '2026-07-14T10:11:24.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100021, 'PD021', 'Sample Item', 'Seed item', 100005, 'piece', NULL, NULL, '[]', NULL, 1, '2026-04-03T10:50:15.000Z', 100018, '2026-04-03T10:30:34.000Z', '2026-04-03T10:50:15.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100022, 'PD053', 'એકાંતની થેલી (Yellow)', '', 100002, 'piece', NULL, NULL, '[]', 100019, 0, NULL, NULL, '2026-04-27T13:49:37.000Z', '2026-07-14T13:27:17.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100023, 'PD035', 'સ્લીપર - 9 No.', '', 100002, 'piece', 'https://i.postimg.cc/j2pt83Lv/Orthorest-Old.jpg', '{"focusX":50,"aspect":"square","focusY":50,"zoom":1}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:47:42.000Z', '2026-07-27T08:14:43.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100024, 'PD061', 'Study Light', '', 100004, 'piece', NULL, NULL, '[]', 100020, 0, NULL, 100002, '2026-04-07T09:19:10.000Z', '2026-07-27T08:01:25.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100025, 'PD050', 'કંકુની ડબ્બી', '', 100002, 'piece', 'https://i.postimg.cc/m2nH4THW/Kanku-Dabbi.jpg', '{"zoom":1,"focusX":50,"focusY":50,"aspect":"square"}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:49:24.000Z', '2026-07-27T07:53:27.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100026, 'PD029', 'Underwear - 85', '', 100002, 'piece', NULL, NULL, '[]', 100019, 1, '2026-07-14T10:11:21.000Z', 100013, '2026-04-27T13:46:37.000Z', '2026-07-14T10:11:21.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100027, 'PD031', 'Underwear - 95', '', 100002, 'piece', NULL, NULL, '[]', 100019, 1, '2026-07-14T10:11:23.000Z', 100013, '2026-04-27T13:47:13.000Z', '2026-07-14T10:11:23.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100028, 'PD036', 'સ્લીપર - 10 No.', '', 100002, 'piece', 'https://i.postimg.cc/j2pt83Lv/Orthorest-Old.jpg', '{"aspect":"square","focusX":50,"zoom":1,"focusY":50}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:47:50.000Z', '2026-07-27T08:14:31.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100029, 'PD062', 'Study Lamp', '', 100000, 'piece', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYRMaIThFy_H4y0Bk5vB1sOhIWjUIe2rulDTrZAWKmUsLr05dCVJmP4k9T&s=10', '{"zoom":1,"focusX":50,"aspect":"portrait","focusY":45}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:21:51.000Z', '2026-07-27T07:37:16.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100030, 'PD017', 'Underwear 85', '', 100003, 'piece', NULL, NULL, '[]', 100020, 1, '2026-07-14T10:12:11.000Z', 100013, '2026-04-07T09:23:25.000Z', '2026-07-14T10:12:11.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100031, 'PD018', 'Underwear 90', '', 100003, 'piece', NULL, NULL, '[]', 100020, 1, '2026-07-14T10:12:14.000Z', 100013, '2026-04-07T09:23:33.000Z', '2026-07-14T10:12:14.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100032, 'PD014', 'Cell', '', 100000, 'piece', NULL, NULL, '[]', 100020, 1, '2026-07-25T14:16:01.000Z', 100013, '2026-04-07T09:21:45.000Z', '2026-07-25T14:16:01.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100033, 'PD008', 'Pendrive', '', 100000, 'piece', 'https://i.postimg.cc/rs6P3BNd/32-GB-Pendrive.jpg', '{"focusY":50,"focusX":50,"aspect":"square","zoom":1}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:21:16.000Z', '2026-07-27T07:30:54.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100034, 'PD012', 'USB Mini', '', 100000, 'piece', 'https://i.postimg.cc/kGrpz0v1/Mini-USB-Charging-Cabel.jpg', '{"aspect":"square","focusY":50,"focusX":50,"zoom":1}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:21:38.000Z', '2026-07-27T08:22:05.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100035, 'PD023', 'Navaniyu', '', 100003, 'piece', 'https://m.media-amazon.com/images/I/41ywheQ52RL.jpg', '{"focusY":50,"focusX":50,"zoom":1,"aspect":"square"}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:23:18.000Z', '2026-07-27T07:30:04.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100036, 'PD039', 'એલાર્મ (એનાલોગ)', '', 100002, 'piece', 'https://i.postimg.cc/gJLbQ91N/alarm.png', '{"aspect":"square","zoom":1,"focusY":50,"focusX":51.47999267578125}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:48:15.000Z', '2026-07-27T08:05:11.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100037, 'PD040', 'બ્રશ', '', 100002, 'piece', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn9FRU4r_qzVMuiRVnOO2FZo_Mf9YlkPw5O_1Ya8Ni4tlAUXXHRxsPxLKS&s=10', '{"aspect":"square","focusY":50,"zoom":1,"focusX":50}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:48:20.000Z', '2026-07-27T07:41:29.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100038, 'PD044', 'સ્ટેશનરી પાઉચ (મોટું)', '', 100002, 'piece', NULL, NULL, '[]', 100019, 0, NULL, NULL, '2026-04-27T13:48:47.000Z', '2026-07-14T13:28:12.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100039, 'PD004', 'Pagaria Player', '', 100000, 'piece', NULL, NULL, '[]', 100020, 1, '2026-07-14T10:03:56.000Z', 100013, '2026-04-07T09:18:55.000Z', '2026-07-14T10:03:56.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100040, 'PD002', 'Power Bank (10000 mAH)', '', 100000, 'piece', 'https://i.postimg.cc/Cx0dm6Df/71qjkw0k6d-L-SL1500.jpg', '{"aspect":"square","zoom":1,"focusX":53,"focusY":50}', '[]', 100020, 0, NULL, NULL, '2026-04-06T08:37:13.000Z', '2026-04-06T08:37:13.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100041, 'PD046', 'માળા', '', 100002, 'piece', 'https://i.postimg.cc/8zrrPxRP/Mala-Nana-Manka.jpg', '{"aspect":"square","zoom":1,"focusX":50,"focusY":50}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:49:01.000Z', '2026-07-27T07:42:23.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100042, 'PD054', 'એકાંતની થેલી (Red)', '', 100002, 'piece', NULL, NULL, '[]', 100019, 0, NULL, NULL, '2026-04-27T13:49:42.000Z', '2026-07-14T13:27:12.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100043, 'PD030', 'Underwear - 90', '', 100002, 'piece', NULL, NULL, '[]', 100019, 1, '2026-07-14T10:11:22.000Z', 100013, '2026-04-27T13:47:04.000Z', '2026-07-14T10:11:22.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100044, 'PD034', 'સ્લીપર - 8 No.', '', 100002, 'piece', 'https://i.postimg.cc/j2pt83Lv/Orthorest-Old.jpg', '{"zoom":1,"focusY":50,"aspect":"square","focusX":50}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:47:34.000Z', '2026-07-27T08:14:38.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100045, 'PD011', 'Type - C Cable', '', 100000, 'piece', 'https://i.postimg.cc/4yzSgWW2/Type-C-Cable.jpg', '{"aspect":"square","focusY":50,"focusX":50,"zoom":1}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:21:34.000Z', '2026-07-27T07:57:35.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100046, 'PD003', 'handsfree wired', '', 100000, 'piece', 'https://i.postimg.cc/j5SDKDq7/61ev3M9Lm-QL-SL1500.jpg', '{"aspect":"square","zoom":1,"focusX":50,"focusY":50}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:16:01.000Z', '2026-07-31T09:28:59.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100047, 'PD022', 'Leader Item 1775212633585', '', 100005, 'piece', NULL, NULL, '[]', 100021, 1, '2026-04-03T10:50:13.000Z', 100018, '2026-04-03T10:37:19.000Z', '2026-04-03T10:50:13.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100048, 'PD025', 'Innerwear 85', '', 100003, 'piece', 'https://m.media-amazon.com/images/I/61PPz4qFaVL._SY741_.jpg', '{"aspect":"square","focusX":50,"focusY":50,"zoom":1}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:23:49.000Z', '2026-07-27T07:26:33.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100049, 'PD060', 'Small Notebook (Swaminarayan Amrut)', 'This is simple Notebook.', 100004, 'piece', 'https://m.media-amazon.com/images/I/41BczLImOAL._SY300_SX300_QL70_FMwebp_.jpg', '{"aspect":"square","zoom":1,"focusX":50,"focusY":50}', '[{"url":"https://m.media-amazon.com/images/I/71ngjYee5CL._SX522_.jpg","crop":null},{"url":"https://m.media-amazon.com/images/I/81B+eczr5tL._SX522_.jpg","crop":null},{"url":"https://m.media-amazon.com/images/I/81m01Tjro7L._SX522_.jpg","crop":null}]', 100018, 0, NULL, 100013, '2026-04-03T10:54:59.000Z', '2026-07-25T15:50:00.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100050, 'PD049', 'ચંદનની ગોટી', '', 100002, 'piece', 'https://i.postimg.cc/bNrt4ZdS/Chandan-Stick.jpg', '{"focusY":50,"aspect":"square","focusX":50,"zoom":1}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:49:19.000Z', '2026-07-27T07:44:38.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100051, 'PD042', 'બ્રશ પાઉચ', '', 100002, 'piece', 'https://i.postimg.cc/8cJTmgPK/Brush-Pouch-Plastic.jpg', '{"aspect":"square","focusY":50,"focusX":50,"zoom":1}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:48:32.000Z', '2026-07-27T07:56:42.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100052, 'PD024', 'Innerwear 80', '', 100003, 'piece', 'https://m.media-amazon.com/images/I/61PPz4qFaVL._SY741_.jpg', '{"zoom":1,"aspect":"square","focusY":50,"focusX":50}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:23:45.000Z', '2026-07-27T07:26:27.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100053, 'PD015', 'Earplug', '', 100000, 'piece', NULL, NULL, '[]', 100020, 1, '2026-07-25T15:49:47.000Z', 100013, '2026-04-07T09:21:54.000Z', '2026-07-25T15:49:47.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100054, 'PD028', 'Underwear - 80', '', 100002, 'piece', NULL, NULL, '[]', 100019, 1, '2026-07-14T10:11:21.000Z', 100013, '2026-04-27T13:46:29.000Z', '2026-07-14T10:11:21.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100055, 'PD016', 'Underwear 80', '', 100000, 'piece', NULL, NULL, '[]', 100020, 1, '2026-07-14T10:11:26.000Z', 100013, '2026-04-07T09:23:21.000Z', '2026-07-14T10:11:26.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100056, 'PD013', 'USB Micro', '', 100000, 'piece', 'https://i.postimg.cc/1XpjQvv2/Type-B-Cable.jpg', '{"focusY":50,"aspect":"square","zoom":1,"focusX":50}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:21:42.000Z', '2026-07-27T08:22:38.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100057, 'PD051', 'કંઠી', '', 100002, 'piece', 'https://i.postimg.cc/Pr7wHdwr/Kanthi-Nana-Manka.jpg', '{"zoom":1,"focusY":50,"focusX":50,"aspect":"square"}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:49:28.000Z', '2026-07-27T07:45:30.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100058, 'PD056', 'Innerwear - 105', '', 100003, 'piece', 'https://m.media-amazon.com/images/I/61PPz4qFaVL._SY741_.jpg', '{"focusX":50,"focusY":50,"aspect":"square","zoom":1}', '[]', 100019, 0, NULL, NULL, '2026-04-27T13:52:33.000Z', '2026-07-27T07:26:13.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100060, 'PD007', 'Earbud Tip', '', 100000, 'piece', NULL, NULL, '[]', 100020, 1, '2026-07-25T15:48:17.000Z', 100013, '2026-04-07T09:21:09.000Z', '2026-07-25T15:48:17.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100061, 'PD026', 'Innerwear 90', '', 100003, 'piece', 'https://m.media-amazon.com/images/I/61PPz4qFaVL._SY741_.jpg', '{"zoom":1,"aspect":"square","focusY":50,"focusX":50}', '[]', 100020, 0, NULL, NULL, '2026-04-07T09:23:52.000Z', '2026-07-27T07:26:39.000Z', 'NO');
INSERT INTO `items` (`id`, `productId`, `name`, `description`, `categoryId`, `unit`, `imageUrl`, `imageCrop`, `images`, `createdById`, `is_deleted`, `deletedAt`, `deletedById`, `createdAt`, `updatedAt`, `is_permission`) VALUES (100062, 'PD001', 'underwear - 85', '', 100003, 'piece', NULL, NULL, '[]', 100016, 0, NULL, NULL, '2026-08-05T09:34:19.466Z', '2026-08-05T09:56:29.978Z', 'NO');

-- --------------------------------------------------------
-- Table structure for table `orders`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE "orders" (
      id INTEGER PRIMARY KEY ,
      date TEXT,
      itemId INTEGER,
      categoryId INTEGER,
      qty REAL,
      status TEXT,
      notes TEXT,
      requestedById INTEGER,
      decisionById INTEGER,
      decisionNote TEXT,
      approvedById INTEGER,
      approvedCustomNote TEXT,
      approvedAt TEXT,
      rejectedById INTEGER,
      rejectedCustomNote TEXT,
      rejectedAt TEXT,
      deliveredById INTEGER,
      deliveredCustomNote TEXT,
      deliveredAt TEXT,
      decidedAt TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

-- Dumping data for table `orders` (1 rows)
INSERT INTO `orders` (`id`, `date`, `itemId`, `categoryId`, `qty`, `status`, `notes`, `requestedById`, `decisionById`, `decisionNote`, `approvedById`, `approvedCustomNote`, `approvedAt`, `rejectedById`, `rejectedCustomNote`, `rejectedAt`, `deliveredById`, `deliveredCustomNote`, `deliveredAt`, `decidedAt`, `createdAt`, `updatedAt`) VALUES (100000, '2026-07-11', 100040, 100000, 1, 'DELIVERED', 'Sevak ni power bank 6 mo pahela Lab ma khovai gayli charging ma mukya pachhi.', 100000, 100005, '', 100005, '', '2026-07-15T12:48:19.000Z', NULL, NULL, NULL, 100005, '', '2026-07-24T08:23:06.000Z', '2026-07-24T08:23:06.000Z', '2026-07-11T12:51:22.000Z', '2026-07-24T08:23:06.000Z');

