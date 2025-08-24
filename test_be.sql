-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.4.0.6659
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for service_app
CREATE DATABASE IF NOT EXISTS `service_app` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `service_app`;

-- Dumping structure for table service_app.dealers
CREATE TABLE IF NOT EXISTS `dealers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table service_app.dealers: ~0 rows (approximately)
INSERT INTO `dealers` (`id`, `name`, `username`, `password`, `address`, `created_at`, `updated_at`) VALUES
	(1, 'Dealer Admin', 'admin', '$2b$10$kkOo0Vo1J5S.3K7dkD0E/uLIl7b4v78GaaMxwOKtNukTqV.Hixu8a', 'Jl. Contoh No. 1', '2025-08-23 08:07:24', '2025-08-23 08:07:24');

-- Dumping structure for table service_app.service_bookings
CREATE TABLE IF NOT EXISTS `service_bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `phone_no` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `vehicle_type` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `license_plate` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `vehicle_problem` text COLLATE utf8mb4_general_ci NOT NULL,
  `service_schedule_id` int NOT NULL,
  `service_time` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `service_status_id` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_sched_time` (`service_schedule_id`,`service_time`,`license_plate`),
  KEY `service_schedule_id` (`service_schedule_id`),
  KEY `service_status_id` (`service_status_id`),
  CONSTRAINT `fk_booking_schedule` FOREIGN KEY (`service_schedule_id`) REFERENCES `service_schedules` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_booking_status` FOREIGN KEY (`service_status_id`) REFERENCES `service_statuses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table service_app.service_bookings: ~0 rows (approximately)
INSERT INTO `service_bookings` (`id`, `name`, `phone_no`, `vehicle_type`, `license_plate`, `vehicle_problem`, `service_schedule_id`, `service_time`, `service_status_id`, `created_at`, `updated_at`) VALUES
	(1, 'Budi', '08123456789', 'Avanza', 'B 1234 CD', 'Mesin bunyi keras', 1, '09:00', 2, '2025-08-23 08:16:57', '2025-08-23 08:19:07');

-- Dumping structure for table service_app.service_schedules
CREATE TABLE IF NOT EXISTS `service_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `schedule_date` date NOT NULL,
  `quota` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `schedule_date` (`schedule_date`),
  CONSTRAINT `service_schedules_chk_1` CHECK ((`quota` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table service_app.service_schedules: ~0 rows (approximately)
INSERT INTO `service_schedules` (`id`, `schedule_date`, `quota`, `created_at`, `updated_at`) VALUES
	(1, '2025-08-25', 10, '2025-08-23 08:14:45', '2025-08-23 08:19:07');

-- Dumping structure for table service_app.service_statuses
CREATE TABLE IF NOT EXISTS `service_statuses` (
  `id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table service_app.service_statuses: ~5 rows (approximately)
INSERT INTO `service_statuses` (`id`, `name`) VALUES
	(5, 'datang'),
	(2, 'konfirmasi batal'),
	(3, 'konfirmasi datang'),
	(1, 'menunggu konfirmasi'),
	(4, 'tidak datang');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
