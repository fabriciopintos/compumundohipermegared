-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: fitpower
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `fitpower`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `fitpower` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `fitpower`;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activities_name_unique` (`name`),
  UNIQUE KEY `activities_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (1,'Boxeo','boxeo','/imagenes/Rectangle 8.png','2026-09-19 01:29:51'),(2,'Hidrogimnasia','hidrogimnasia','/imagenes/Rectangle 10.png','2026-09-19 01:29:51'),(3,'Pilates','pilates','/imagenes/Rectangle 7.png','2026-09-19 01:29:51'),(4,'Zumba','zumba','/imagenes/Rectangle 11.png','2026-09-19 01:29:51'),(5,'Musculaci├│n','musculacion','/imagenes/Rectangle 6.png','2026-09-19 01:29:51'),(6,'Spinning','spinning','/imagenes/Rectangle 12.png','2026-09-19 01:29:51');
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_sessions`
--

DROP TABLE IF EXISTS `class_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `day_of_week` tinyint NOT NULL,
  `start_time` time NOT NULL,
  `duration_minutes` int NOT NULL DEFAULT '60',
  `capacity` int NOT NULL DEFAULT '20',
  `professor_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_class_sessions_activity` (`activity_id`),
  KEY `idx_class_sessions_day` (`day_of_week`),
  CONSTRAINT `fk_class_sessions_activity` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_sessions_capacity_check` CHECK ((`capacity` > 0)),
  CONSTRAINT `class_sessions_day_check` CHECK ((`day_of_week` between 1 and 7))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_sessions`
--

LOCK TABLES `class_sessions` WRITE;
/*!40000 ALTER TABLE `class_sessions` DISABLE KEYS */;
INSERT INTO `class_sessions` VALUES (1,1,1,'07:30:00',60,16,'Mart├¡n P├®rez','2026-09-19 01:29:51'),(2,3,1,'09:00:00',60,12,'Laura G├│mez','2026-09-19 01:29:51'),(3,2,1,'10:00:00',60,10,'Ana Ruiz','2026-09-19 01:29:51'),(4,4,1,'18:00:00',60,20,'Sof├¡a D├¡az','2026-09-19 01:29:51'),(5,1,2,'18:00:00',60,16,'Mart├¡n P├®rez','2026-09-19 01:29:51'),(6,3,2,'09:00:00',60,12,'Laura G├│mez','2026-09-19 01:29:51'),(7,4,3,'19:30:00',60,20,'Sof├¡a D├¡az','2026-09-19 01:29:51'),(8,2,3,'11:00:00',60,10,'Ana Ruiz','2026-09-19 01:29:51'),(9,1,4,'18:00:00',60,16,'Mart├¡n P├®rez','2026-09-19 01:29:51'),(10,3,4,'19:00:00',60,12,'Laura G├│mez','2026-09-19 01:29:51'),(11,4,5,'18:30:00',60,20,'Sof├¡a D├¡az','2026-09-19 01:29:51'),(12,2,5,'10:00:00',60,10,'Ana Ruiz','2026-09-19 01:29:51'),(13,6,6,'09:00:00',60,18,'Diego L├│pez','2026-09-19 01:29:51'),(14,5,6,'11:00:00',60,15,'Mart├¡n P├®rez','2026-09-19 01:29:51');
/*!40000 ALTER TABLE `class_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_low_id` int NOT NULL,
  `user_high_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversations_pair_unique` (`user_low_id`,`user_high_id`),
  KEY `idx_conversations_user_low` (`user_low_id`),
  KEY `idx_conversations_user_high` (`user_high_id`),
  KEY `idx_conversations_updated` (`updated_at`),
  CONSTRAINT `fk_conversations_user_high` FOREIGN KEY (`user_high_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversations_user_low` FOREIGN KEY (`user_low_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_distinct_users` CHECK ((`user_low_id` < `user_high_id`))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,2,3,'2026-09-19 07:21:12','2026-09-19 07:22:37'),(2,1,2,'2026-09-19 07:21:12','2026-09-19 07:27:25');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `class_session_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollments_user_session_unique` (`user_id`,`class_session_id`),
  KEY `fk_enrollments_session` (`class_session_id`),
  KEY `idx_enrollments_user` (`user_id`),
  CONSTRAINT `fk_enrollments_session` FOREIGN KEY (`class_session_id`) REFERENCES `class_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,3,1,'2026-09-19 01:29:51');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_login_attempts_ip_time` (`ip`,`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_events`
--

DROP TABLE IF EXISTS `login_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `logged_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_login_events_user_time` (`user_id`,`logged_at`),
  CONSTRAINT `fk_login_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_events`
--

LOCK TABLES `login_events` WRITE;
/*!40000 ALTER TABLE `login_events` DISABLE KEYS */;
INSERT INTO `login_events` VALUES (3,1,'2026-09-19 07:26:02'),(1,2,'2026-09-19 01:59:04'),(4,2,'2026-09-19 07:28:03'),(2,3,'2026-09-19 07:22:19');
/*!40000 ALTER TABLE `login_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_messages_sender` (`sender_id`),
  KEY `idx_messages_conversation` (`conversation_id`,`created_at`),
  KEY `idx_messages_unread` (`conversation_id`,`sender_id`,`read_at`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,2,'hola patola','2026-09-19 07:21:23','2026-09-19 07:22:29'),(2,1,3,'funciona la mensajeria','2026-09-19 07:22:37','2026-09-19 07:28:19'),(3,2,1,'hola','2026-09-19 07:26:16','2026-09-19 07:28:18'),(4,2,1,'mimioso','2026-09-19 07:27:25','2026-09-19 07:28:18');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schema_migrations`
--

DROP TABLE IF EXISTS `schema_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schema_migrations` (
  `version` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schema_migrations`
--

LOCK TABLES `schema_migrations` WRITE;
/*!40000 ALTER TABLE `schema_migrations` DISABLE KEYS */;
INSERT INTO `schema_migrations` VALUES ('001_init.sql','2026-09-19 01:28:22'),('002_roles.sql','2026-09-19 01:29:50'),('003_messages.sql','2026-09-19 01:29:51');
/*!40000 ALTER TABLE `schema_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'usuario',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  CONSTRAINT `users_role_check` CHECK ((`role` in (_utf8mb4'admin',_utf8mb4'entrenador',_utf8mb4'usuario')))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Administrador','admin@fitpower.com','$2y$10$7.KSIhcX0mI4bQnOuRA94eknr57NecncdeFmj7Gj5sIavQXcXVfpu','admin','2026-09-19 01:29:51','2026-09-19 01:29:51'),(2,'Entrenador','entrenador@fitpower.com','$2y$10$7.KSIhcX0mI4bQnOuRA94eknr57NecncdeFmj7Gj5sIavQXcXVfpu','entrenador','2026-09-19 01:29:51','2026-09-19 01:29:51'),(3,'Usuario','usuario@fitpower.com','$2y$10$7.KSIhcX0mI4bQnOuRA94eknr57NecncdeFmj7Gj5sIavQXcXVfpu','usuario','2026-09-19 01:29:51','2026-09-19 01:29:51'),(4,'jacinta','jaci@mail.com','$2y$10$kDJrFFVMC.eKyl86parXBuGANQiu4pNxJxOHAgGEWO94nxjEJJ8ma','entrenador','2026-09-19 07:27:05','2026-09-19 07:27:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'fitpower'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-19 16:49:11
