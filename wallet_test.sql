-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               10.4.14-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for wallet_test
CREATE DATABASE IF NOT EXISTS `wallet_test` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `wallet_test`;

-- Dumping structure for table wallet_test.blacklist
CREATE TABLE IF NOT EXISTS `blacklist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `update_timestamp` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_block_userinfo` (`id_user`),
  CONSTRAINT `FK_block_userinfo` FOREIGN KEY (`id_user`) REFERENCES `userinfo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table wallet_test.blacklist: ~0 rows (approximately)
/*!40000 ALTER TABLE `blacklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `blacklist` ENABLE KEYS */;

-- Dumping structure for table wallet_test.currency
CREATE TABLE IF NOT EXISTS `currency` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `price` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `update_timestamp` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table wallet_test.currency: ~7 rows (approximately)
/*!40000 ALTER TABLE `currency` DISABLE KEYS */;
INSERT INTO `currency` (`id`, `type`, `price`, `update_timestamp`) VALUES
	(1, 'USDT', '1', '2022-02-20 21:07:19'),
	(2, 'BTC', '38000', '2022-02-20 21:51:05'),
	(3, 'ETH', '2600', '2022-02-20 21:51:28'),
	(4, 'LTC', '110', '2022-02-20 22:00:46'),
	(5, 'BNB', '390', '2022-02-21 12:39:17'),
	(6, 'SOL', '95', '2022-02-21 13:06:55'),
	(7, 'MATIC', '1.6', '2022-02-21 13:03:12');
/*!40000 ALTER TABLE `currency` ENABLE KEYS */;

-- Dumping structure for table wallet_test.datainfo
CREATE TABLE IF NOT EXISTS `datainfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `balance` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `typecoin` int(11) DEFAULT NULL,
  `create_timestamp` timestamp NULL DEFAULT current_timestamp(),
  `update_timestamp` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_userinfo_currency` (`typecoin`),
  KEY `FK_datainfo_userinfo` (`id_user`),
  CONSTRAINT `FK_datainfo_userinfo` FOREIGN KEY (`id_user`) REFERENCES `userinfo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_userinfo_currency` FOREIGN KEY (`typecoin`) REFERENCES `currency` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table wallet_test.datainfo: ~2 rows (approximately)
/*!40000 ALTER TABLE `datainfo` DISABLE KEYS */;
/*!40000 ALTER TABLE `datainfo` ENABLE KEYS */;

-- Dumping structure for table wallet_test.transaction
CREATE TABLE IF NOT EXISTS `transaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from` int(11) DEFAULT NULL,
  `type_currency_from` int(11) DEFAULT NULL,
  `value` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `to` int(11) DEFAULT NULL,
  `type_currency_to` int(11) DEFAULT NULL,
  `create_timestamp` timestamp NULL DEFAULT current_timestamp(),
  `update_timestamp` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_transaction_currency` (`type_currency_from`),
  KEY `FK_transaction_currency_2` (`type_currency_to`),
  KEY `FK_transaction_userinfo` (`from`),
  KEY `FK_transaction_userinfo_2` (`to`),
  CONSTRAINT `FK_transaction_currency` FOREIGN KEY (`type_currency_from`) REFERENCES `currency` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_transaction_currency_2` FOREIGN KEY (`type_currency_to`) REFERENCES `currency` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_transaction_userinfo` FOREIGN KEY (`from`) REFERENCES `userinfo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_transaction_userinfo_2` FOREIGN KEY (`to`) REFERENCES `userinfo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table wallet_test.transaction: ~0 rows (approximately)
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;

-- Dumping structure for table wallet_test.userinfo
CREATE TABLE IF NOT EXISTS `userinfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `card_id` varchar(13) DEFAULT NULL,
  `account_id` varchar(50) DEFAULT NULL,
  `create_timestamp` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table wallet_test.userinfo: ~7 rows (approximately)
/*!40000 ALTER TABLE `userinfo` DISABLE KEYS */;
INSERT INTO `userinfo` (`id`, `name`, `card_id`, `account_id`, `create_timestamp`) VALUES
	(1, 'nameA', '1111111111111', '542048246', '2022-02-21 22:56:54'),
	(2, 'nameB', '2222222222222', '724973091', '2022-02-21 22:56:54'),
	(3, 'nameC', '3333333333333', '595178190', '2022-02-21 22:56:54'),
	(4, 'nameD', '4444444444444', '454117346', '2022-02-21 22:56:54'),
	(5, 'nameE', '5555555555555', '845420603', '2022-02-21 22:56:54'),
	(6, 'nameF', '6666666666666', '739139253', '2022-02-21 22:56:54'),
	(7, 'nameG', '7777777777777', '545769645', '2022-02-21 22:56:54');
/*!40000 ALTER TABLE `userinfo` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
