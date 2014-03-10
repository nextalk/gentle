# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.6.14)
# Database: gentle_test
# Generation Time: 2014-03-07 01:24:34 +0000
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

INSERT INTO `cities` (`id`, `name`)
VALUES
	(1,'New York'),
	(2,'Los Angeles');

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
	(2,2,2,'About us',1,'friend',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL);

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
  PRIMARY KEY (`id`),
  KEY `city` (`city_id`),
  CONSTRAINT `city` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `city_id`, `name`, `password`)
VALUES
	(1,1,'Jack','demo'),
	(2,2,'Lily','demo'),
	(3,2,'Lucy','demo'),
	(4,2,'Aaron','demo'),
	(5,1,'Abbott','demo'),
	(6,2,'Abel','demo'),
	(7,1,'Abner','demo'),
	(8,1,'Alan','demo'),
	(9,2,'Alfred','demo'),
	(10,1,'Algernon','demo'),
	(11,1,'Alva','demo'),
	(12,2,'Alvin','demo'),
	(13,1,'Amos','demo'),
	(14,1,'Beacher','demo'),
	(15,2,'Beck','demo'),
	(16,1,'Ben','demo'),
	(17,1,'Benjamin','demo'),
	(18,2,'Bennett','demo'),
	(19,1,'Berger','demo'),
	(20,2,'Bert','demo'),
	(21,1,'Berton','demo'),
	(22,1,'Bertram','demo'),
	(23,2,'Bevis','demo'),
	(24,1,'Charles','demo'),
	(25,2,'Chester','demo'),
	(26,1,'Christopher','demo'),
	(27,2,'Clarence','demo'),
	(28,1,'Clark','demo'),
	(29,2,'Claude','demo'),
	(30,1,'Clement','demo'),
	(31,1,'Colbert','demo');

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
