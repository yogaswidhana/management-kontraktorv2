-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/

-- Konfigurasi Database
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Database: kontraktor_db

-- --------------------------------------------------------
-- Tabel Users
-- --------------------------------------------------------

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `jabatan` varchar(100) NOT NULL CHECK (`jabatan` <> ''),
  `organisasi` varchar(100) NOT NULL CHECK (`organisasi` <> ''),
  `role` enum('contractor','consultant','owner') NOT NULL CHECK (`role` in ('contractor','consultant','owner')),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`id`, `username`, `password`, `jabatan`, `organisasi`, `role`, `created_at`) VALUES
(1, 'owner1', '$2b$10$WEl3V3JS0bZwlUtUS673CeiH46vS3.aGaDtVUAZuGd5D9wsQvBWha', 'owner', 'WIKA', 'owner', '2024-12-15 17:38:37'),
(2, 'konsultan1', '$2b$10$XXMNIXQIyvJumkBo1nFu4OyV2C5xsX.o328j1sAvaTbEXYJFeixK2', 'konsultan', 'WIKA', 'consultant', '2024-12-15 17:39:43'),
(4, 'kontraktor', '$2b$10$2ER8J11eekYxV8PydtTtcu22VcgfQgEreuqOSqfsOLmI.YG2EUSZO', 'kontraktor', 'WIKA', 'contractor', '2024-12-15 17:40:57');

-- --------------------------------------------------------
-- Tabel Projects 
-- --------------------------------------------------------

CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kegiatan` varchar(100) NOT NULL,
  `nama_pekerjaan` varchar(100) NOT NULL,
  `lokasi` varchar(255) NOT NULL,
  `nomor_kontrak` varchar(50) NOT NULL,
  `tanggal_kontrak` date NOT NULL,
  `nilai_kontrak` decimal(20,2) NOT NULL,
  `nama_kontraktor_pelaksana` varchar(100) NOT NULL,
  `nama_konsultan_pengawas` varchar(100) NOT NULL,
  `lama_pekerjaan` int NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `provisional_hand_over` varchar(50) NOT NULL,
  `final_hand_over` varchar(50) NOT NULL,
  `jumlah_item_pekerjaan_mayor` int NOT NULL,
  `status` enum('Aktif','Selesai','Tertunda','Dibatalkan') DEFAULT 'Aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `projects` (`nama_kegiatan`, `nama_pekerjaan`, `lokasi`, `nomor_kontrak`, `tanggal_kontrak`, `nilai_kontrak`, `nama_kontraktor_pelaksana`, `nama_konsultan_pengawas`, `lama_pekerjaan`, `tanggal_mulai`, `tanggal_selesai`, `provisional_hand_over`, `final_hand_over`, `jumlah_item_pekerjaan_mayor`, `status`) VALUES
('Pembangunan Gedung A', 'Konstruksi Gedung Perkantoran', 'Jakarta Pusat', 'KTR/2024/001', '2024-01-01', 5000000000.00, 'PT Kontraktor Utama', 'PT Konsultan Prima', 12, '2024-01-15', '2024-12-15', 'Provisional Hand Over 1', 'Final Hand Over 1', 5, 'Aktif'),
('Renovasi Jalan', 'Perbaikan Jalan Raya', 'Bandung', 'KTR/2024/002', '2024-01-05', 3000000000.00, 'PT Karya Jaya', 'PT Pengawas Andal', 6, '2024-02-01', '2024-07-31', 'Provisional Hand Over 2', 'Final Hand Over 2', 3, 'Aktif'), 
('Pembangunan Jembatan', 'Konstruksi Jembatan', 'Surabaya', 'KTR/2024/003', '2024-01-10', 8000000000.00, 'PT Bangun Infrastruktur', 'PT Konsultan Teknik', 18, '2024-03-01', '2025-08-31', 'Provisional Hand Over 3', 'Final Hand Over 3', 4, 'Aktif');

-- --------------------------------------------------------
-- Tabel Project Progress
-- --------------------------------------------------------

CREATE TABLE `project_progress` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `item_pekerjaan` VARCHAR(100) NOT NULL,
  `nama_item_pekerjaan` VARCHAR(255) NOT NULL, 
  `volume_pekerjaan` DECIMAL(10,2) NOT NULL,
  `satuan_pekerjaan` VARCHAR(50) NOT NULL,
  `harga_satuan` DECIMAL(20,2) NOT NULL,
  `rencana_waktu_kerja` INT NOT NULL COMMENT 'dalam minggu',
  `minggu` VARCHAR(100) NOT NULL DEFAULT 'Minggu 1',
  `progress` INT NOT NULL DEFAULT 0,
  `update_date` DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_project_progress_project`
  FOREIGN KEY (`project_id`) 
  REFERENCES `projects`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `project_progress` (
  `project_id`, 
  `item_pekerjaan`, 
  `nama_item_pekerjaan`, 
  `volume_pekerjaan`, 
  `satuan_pekerjaan`, 
  `harga_satuan`, 
  `rencana_waktu_kerja`, 
  `minggu`, 
  `progress`, 
  `update_date`
) 
VALUES
(1, 'PEK001', 'Pekerjaan Fondasi', 100.50, 'm3', 1500000.00, 4, 'Minggu 1', 25, '2024-12-29'),
(1, 'PEK002', 'Pekerjaan Struktur', 200.00, 'm2', 2500000.00, 6, 'Minggu 2', 40, '2024-12-29'),
(2, 'PEK003', 'Pekerjaan Dinding', 150.75, 'm2', 1800000.00, 5, 'Minggu 3', 30, '2024-12-29'),
(2, 'PEK004', 'Pekerjaan Atap', 50.00, 'm2', 3000000.00, 3, 'Minggu 4', 50, '2024-12-29'),
(3, 'PEK005', 'Pekerjaan Lantai', 75.25, 'm2', 2200000.00, 2, 'Minggu 5', 70, '2024-12-29');


-- --------------------------------------------------------
-- Tabel Dimension Reports
-- --------------------------------------------------------

CREATE TABLE `dimension_reports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT(11) DEFAULT NULL,
    `no_kontrak` VARCHAR(50) NOT NULL,
    `id_dimensi` VARCHAR(50) NOT NULL,
    `item_pekerjaan` VARCHAR(255) NOT NULL,
    `panjang_pengukuran` DECIMAL(10, 2) NOT NULL,
    `foto_dokumentasi_panjang` VARCHAR(255) NOT NULL,
    `lokasi_gps_panjang` VARCHAR(255) NOT NULL,
    `tanggal_waktu_panjang` DATETIME NOT NULL,
    `lebar_pengukuran` DECIMAL(10, 2) NOT NULL,
    `foto_dokumentasi_lebar` VARCHAR(255) NOT NULL,
    `lokasi_gps_lebar` VARCHAR(255) NOT NULL,
    `tanggal_waktu_lebar` DATETIME NOT NULL,
    `tinggi_pengukuran` DECIMAL(10, 2) NOT NULL,
    `foto_dokumentasi_tinggi` VARCHAR(255) NOT NULL,
    `lokasi_gps_tinggi` VARCHAR(255) NOT NULL,
    `tanggal_waktu_tinggi` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabel Compaction Reports
-- --------------------------------------------------------

CREATE TABLE `compaction_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `work_item_id` int(11) DEFAULT NULL,
  `roller_specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`roller_specs`)),
  `compaction_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`compaction_data`)),
  `segment` varchar(50) DEFAULT NULL,
  `density_estimation` decimal(5,2) DEFAULT NULL,
  `status` enum('submitted','reviewed','approved','rejected') DEFAULT 'submitted',
  `consultant_notes` text DEFAULT NULL,
  `owner_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabel Lab Data
-- --------------------------------------------------------

CREATE TABLE `lab_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `jmf_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`jmf_data`)),
  `gyratory_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gyratory_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabel Method Reports
-- --------------------------------------------------------

CREATE TABLE `method_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `work_type` enum('excavation','embankment','subgrade','granular_pavement','asphalt_pavement') DEFAULT NULL,
  `method_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`method_data`)),
  `process_flow` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`process_flow`)),
  `status` enum('submitted','reviewed','approved','rejected') DEFAULT 'submitted',
  `consultant_notes` text DEFAULT NULL,
  `owner_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabel Trial Mix Data
-- --------------------------------------------------------

CREATE TABLE `trial_mix_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `mix_design_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mix_design_data`)),
  `test_results` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`test_results`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabel Work Items
-- --------------------------------------------------------

CREATE TABLE `work_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `planned_volume` decimal(10,2) DEFAULT NULL,
  `actual_volume` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabel Work Progress
-- --------------------------------------------------------

CREATE TABLE `work_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `work_item_id` int(11) DEFAULT NULL,
  `planned_progress` decimal(5,2) DEFAULT NULL,
  `actual_progress` decimal(5,2) DEFAULT NULL,
  `deviation` decimal(5,2) DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Indexes
-- --------------------------------------------------------

ALTER TABLE `compaction_reports`
  ADD KEY `project_id` (`project_id`),
  ADD KEY `work_item_id` (`work_item_id`);

ALTER TABLE `dimension_reports`
  ADD KEY `project_id` (`project_id`);

ALTER TABLE `lab_data`
  ADD KEY `project_id` (`project_id`);

ALTER TABLE `method_reports`
  ADD KEY `project_id` (`project_id`);

ALTER TABLE `trial_mix_data`
  ADD KEY `project_id` (`project_id`);

ALTER TABLE `users`
  ADD UNIQUE KEY `username` (`username`);

ALTER TABLE `work_items`
  ADD KEY `project_id` (`project_id`);

ALTER TABLE `work_progress`
  ADD KEY `project_id` (`project_id`),
  ADD KEY `work_item_id` (`work_item_id`);

-- --------------------------------------------------------
-- Foreign Keys
-- --------------------------------------------------------

ALTER TABLE `compaction_reports`
  ADD CONSTRAINT `compaction_reports_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `compaction_reports_ibfk_2` FOREIGN KEY (`work_item_id`) REFERENCES `work_items` (`id`);

ALTER TABLE `dimension_reports`
  ADD CONSTRAINT `dimension_reports_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `lab_data`
  ADD CONSTRAINT `lab_data_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `method_reports`
  ADD CONSTRAINT `method_reports_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `trial_mix_data`
  ADD CONSTRAINT `trial_mix_data_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `work_items`
  ADD CONSTRAINT `work_items_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `work_progress`
  ADD CONSTRAINT `work_progress_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `work_progress_ibfk_2` FOREIGN KEY (`work_item_id`) REFERENCES `work_items` (`id`);

COMMIT;

ALTER TABLE dimension_reports
MODIFY COLUMN project_id INT NOT NULL,
MODIFY COLUMN no_kontrak VARCHAR(50) NOT NULL,
MODIFY COLUMN id_dimensi VARCHAR(50) NOT NULL,
MODIFY COLUMN item_pekerjaan VARCHAR(255) NOT NULL,
MODIFY COLUMN panjang_pengukuran DECIMAL(10,2) NOT NULL,
MODIFY COLUMN foto_dokumentasi_panjang VARCHAR(255) NOT NULL,
MODIFY COLUMN lokasi_gps_panjang VARCHAR(255) NOT NULL,
MODIFY COLUMN tanggal_waktu_panjang DATETIME NOT NULL,
MODIFY COLUMN lebar_pengukuran DECIMAL(10,2) NOT NULL,
MODIFY COLUMN foto_dokumentasi_lebar VARCHAR(255) NOT NULL,
MODIFY COLUMN lokasi_gps_lebar VARCHAR(255) NOT NULL,
MODIFY COLUMN tanggal_waktu_lebar DATETIME NOT NULL,
MODIFY COLUMN tinggi_pengukuran DECIMAL(10,2) NOT NULL,
MODIFY COLUMN foto_dokumentasi_tinggi VARCHAR(255) NOT NULL,
MODIFY COLUMN lokasi_gps_tinggi VARCHAR(255) NOT NULL,
MODIFY COLUMN tanggal_waktu_tinggi DATETIME NOT NULL;
