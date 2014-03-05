# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.6.14)
# Database: gentle_test
# Generation Time: 2014-03-05 01:54:05 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table admin
# ------------------------------------------------------------

DROP TABLE IF EXISTS `admin`;

CREATE TABLE `admin` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `login` char(20) NOT NULL DEFAULT '' COMMENT '//Username for login',
  `password` char(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='!Admin';

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;

INSERT INTO `admin` (`id`, `login`, `password`)
VALUES
	(1,'admin','111111'),
	(2,'demo','demo');

/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table posts
# ------------------------------------------------------------

DROP TABLE IF EXISTS `posts`;

CREATE TABLE `posts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` char(100) NOT NULL DEFAULT '' COMMENT '//Max length 50',
  `category` tinyint(2) NOT NULL DEFAULT '0' COMMENT 'Category|select([[0,"Default"],[1,"Life"],[2,"News"]])//Select the category',
  `relation` enum('personal','family','friend','classmate') DEFAULT NULL,
  `post_to` set('twitter','facebook','google') DEFAULT NULL,
  `post_date` date DEFAULT NULL,
  `post_time` time DEFAULT NULL,
  `retry` int(5) DEFAULT NULL,
  `price` decimal(5,2) DEFAULT NULL,
  `publish` tinyint(1) DEFAULT NULL,
  `pic` char(30) DEFAULT NULL COMMENT 'Picture',
  `content` blob,
  `created_at` timestamp NULL DEFAULT NULL COMMENT '!',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Post//My blog posts';

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;

INSERT INTO `posts` (`id`, `user_id`, `title`, `category`, `relation`, `post_to`, `post_date`, `post_time`, `retry`, `price`, `publish`, `pic`, `content`, `created_at`)
VALUES
	(1,1,'Hello world',0,NULL,'facebook',NULL,NULL,1,NULL,NULL,NULL,X'546869732069732074686520666972737420706F73742E',NULL);

/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` char(50) DEFAULT NULL,
  `password` char(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `name`, `password`)
VALUES
	(1,'Jack','demo'),
	(2,'Lily','demo'),
	(3,'Lucy','demo'),
	(4,'Aaron','demo'),
	(5,'Abbott','demo'),
	(6,'Abel','demo'),
	(7,'Abner','demo'),
	(8,'Alan','demo'),
	(9,'Alfred','demo'),
	(10,'Algernon','demo'),
	(11,'Alva','demo'),
	(12,'Alvin','demo'),
	(13,'Amos','demo'),
	(14,'Beacher','demo'),
	(15,'Beck','demo'),
	(16,'Ben','demo'),
	(17,'Benjamin','demo'),
	(18,'Bennett','demo'),
	(19,'Berger','demo'),
	(20,'Bert','demo'),
	(21,'Berton','demo'),
	(22,'Bertram','demo'),
	(23,'Bevis','demo'),
	(24,'Charles','demo'),
	(25,'Chester','demo'),
	(26,'Christopher','demo'),
	(27,'Clarence','demo'),
	(28,'Clark','demo'),
	(29,'Claude','demo'),
	(30,'Clement','demo'),
	(31,'Colbert','demo');

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
