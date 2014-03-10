# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.6.14)
# Database: gentle_test
# Generation Time: 2014-03-10 09:25:57 +0000
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
  `role` int(2) NOT NULL DEFAULT '0',
  `city_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Admin';

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;

INSERT INTO `admin` (`id`, `login`, `password`, `role`, `city_id`, `created_at`)
VALUES
	(1,'admin','admin',0,NULL,NULL),
	(2,'jack','jack',1,1,NULL),
	(3,'visitor','visitor',2,NULL,NULL);

/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table cities
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cities`;

CREATE TABLE `cities` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` char(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;

INSERT INTO `cities` (`id`, `name`, `created_at`)
VALUES
	(1,'New York',NULL),
	(2,'Los Angeles',NULL);

/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table posts
# ------------------------------------------------------------

DROP TABLE IF EXISTS `posts`;

CREATE TABLE `posts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `city_id` int(11) unsigned NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
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
  PRIMARY KEY (`id`),
  KEY `user` (`user_id`),
  CONSTRAINT `user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Post//My blog posts';

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;

INSERT INTO `posts` (`id`, `city_id`, `user_id`, `title`, `category`, `relation`, `post_to`, `post_date`, `post_time`, `retry`, `price`, `publish`, `pic`, `content`, `created_at`)
VALUES
	(1,1,1,'Hello world',0,NULL,'facebook',NULL,NULL,1,NULL,NULL,NULL,X'546869732069732074686520666972737420706F73742E',NULL),
	(2,2,2,'About us',1,'friend',NULL,'2014-03-13','09:45:00',NULL,NULL,0,NULL,NULL,NULL);

/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `city_id` int(11) unsigned DEFAULT '1',
  `name` char(50) DEFAULT NULL,
  `password` char(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `city` (`city_id`),
  CONSTRAINT `city` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `city_id`, `name`, `password`, `created_at`)
VALUES
	(1,1,'Jack','demo',NULL),
	(2,2,'Lily','demo',NULL),
	(3,2,'Lucy','demo',NULL),
	(4,2,'Aaron','demo',NULL),
	(5,1,'Abbott','demo',NULL),
	(6,2,'Abel','demo',NULL),
	(7,1,'Abner','demo',NULL),
	(8,1,'Alan','demo',NULL),
	(9,2,'Alfred','demo',NULL),
	(10,1,'Algernon','demo',NULL),
	(11,1,'Alva','demo',NULL),
	(12,2,'Alvin','demo',NULL),
	(13,1,'Amos','demo',NULL),
	(14,1,'Beacher','demo',NULL),
	(15,2,'Beck','demo',NULL),
	(16,1,'Ben','demo',NULL),
	(17,1,'Benjamin','demo',NULL),
	(18,2,'Bennett','demo',NULL),
	(19,1,'Berger','demo',NULL),
	(20,2,'Bert','demo',NULL),
	(21,1,'Berton','demo',NULL),
	(22,1,'Bertram','demo',NULL),
	(23,2,'Bevis','demo',NULL),
	(24,1,'Charles','demo',NULL),
	(25,2,'Chester','demo',NULL),
	(26,1,'Christopher','demo',NULL),
	(27,2,'Clarence','demo',NULL),
	(28,1,'Clark','demo',NULL),
	(29,2,'Claude','demo',NULL),
	(30,1,'Clement','demo',NULL),
	(31,1,'Colbert','demo',NULL);

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
