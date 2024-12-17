-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 16 Des 2024 pada 07.25
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kontraktor_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `compaction_reports`
--

CREATE TABLE `compaction_reports` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `work_item_id` int(11) DEFAULT NULL,
  `roller_specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`roller_specs`)),
  `compaction_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`compaction_data`)),
  `segment` varchar(50) DEFAULT NULL,
  `density_estimation` decimal(5,2) DEFAULT NULL,
  `status` enum('submitted','reviewed','approved','rejected') DEFAULT 'submitted',
  `consultant_notes` text DEFAULT NULL,
  `owner_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `project_progress` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `project_id` INT NOT NULL,
    `task_name` VARCHAR(100) NOT NULL,
    `progress` INT NOT NULL,
    `description` TEXT,
    `pic` VARCHAR(100),
    `update_date` DATE,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `dimension_reports`
--

CREATE TABLE `dimension_reports` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `work_item_id` int(11) DEFAULT NULL,
  `dimension_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dimension_data`)),
  `documentation_url` text DEFAULT NULL,
  `status` enum('submitted','reviewed','approved','rejected') DEFAULT 'submitted',
  `consultant_notes` text DEFAULT NULL,
  `owner_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `lab_data`
--

CREATE TABLE `lab_data` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `jmf_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`jmf_data`)),
  `gyratory_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gyratory_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `method_reports`
--

CREATE TABLE `method_reports` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `work_type` enum('excavation','embankment','subgrade','granular_pavement','asphalt_pavement') DEFAULT NULL,
  `method_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`method_data`)),
  `process_flow` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`process_flow`)),
  `status` enum('submitted','reviewed','approved','rejected') DEFAULT 'submitted',
  `consultant_notes` text DEFAULT NULL,
  `owner_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `contract_number` varchar(50) NOT NULL,
  `contractor_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `volume` decimal(10,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `budget` decimal(20,2) DEFAULT NULL,
  `status` enum('Aktif','Selesai','Tertunda','Dibatalkan') DEFAULT 'Aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `trial_mix_data`
--

CREATE TABLE `trial_mix_data` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `mix_design_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mix_design_data`)),
  `test_results` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`test_results`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `jabatan` varchar(100) NOT NULL CHECK (`jabatan` <> ''),
  `organisasi` varchar(100) NOT NULL CHECK (`organisasi` <> ''),
  `role` enum('contractor','consultant','owner') NOT NULL CHECK (`role` in ('contractor','consultant','owner')),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `jabatan`, `organisasi`, `role`, `created_at`) VALUES
(1, 'owner1', '$2b$10$WEl3V3JS0bZwlUtUS673CeiH46vS3.aGaDtVUAZuGd5D9wsQvBWha', 'owner', 'WIKA', 'owner', '2024-12-15 17:38:37'),
(2, 'konsultan1', '$2b$10$XXMNIXQIyvJumkBo1nFu4OyV2C5xsX.o328j1sAvaTbEXYJFeixK2', 'konsultan', 'WIKA', 'consultant', '2024-12-15 17:39:43'),
(4, 'kontraktor', '$2b$10$2ER8J11eekYxV8PydtTtcu22VcgfQgEreuqOSqfsOLmI.YG2EUSZO', 'kontraktor', 'WIKA', 'contractor', '2024-12-15 17:40:57');

-- --------------------------------------------------------

--
-- Struktur dari tabel `work_items`
--

CREATE TABLE `work_items` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `planned_volume` decimal(10,2) DEFAULT NULL,
  `actual_volume` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `work_progress`
--

CREATE TABLE `work_progress` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `work_item_id` int(11) DEFAULT NULL,
  `planned_progress` decimal(5,2) DEFAULT NULL,
  `actual_progress` decimal(5,2) DEFAULT NULL,
  `deviation` decimal(5,2) DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `compaction_reports`
--
ALTER TABLE `compaction_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `work_item_id` (`work_item_id`);

--
-- Indeks untuk tabel `dimension_reports`
--
ALTER TABLE `dimension_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `work_item_id` (`work_item_id`);

--
-- Indeks untuk tabel `lab_data`
--
ALTER TABLE `lab_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indeks untuk tabel `method_reports`
--
ALTER TABLE `method_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indeks untuk tabel `trial_mix_data`
--
ALTER TABLE `trial_mix_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indeks untuk tabel `work_items`
--
ALTER TABLE `work_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indeks untuk tabel `work_progress`
--
ALTER TABLE `work_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `work_item_id` (`work_item_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `compaction_reports`
--
ALTER TABLE `compaction_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `dimension_reports`
--
ALTER TABLE `dimension_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `lab_data`
--
ALTER TABLE `lab_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `method_reports`
--
ALTER TABLE `method_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `trial_mix_data`
--
ALTER TABLE `trial_mix_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `work_items`
--
ALTER TABLE `work_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `work_progress`
--
ALTER TABLE `work_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `compaction_reports`
--
ALTER TABLE `compaction_reports`
  ADD CONSTRAINT `compaction_reports_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `compaction_reports_ibfk_2` FOREIGN KEY (`work_item_id`) REFERENCES `work_items` (`id`);

--
-- Ketidakleluasaan untuk tabel `dimension_reports`
--
ALTER TABLE `dimension_reports`
  ADD CONSTRAINT `dimension_reports_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `dimension_reports_ibfk_2` FOREIGN KEY (`work_item_id`) REFERENCES `work_items` (`id`);

--
-- Ketidakleluasaan untuk tabel `lab_data`
--
ALTER TABLE `lab_data`
  ADD CONSTRAINT `lab_data_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Ketidakleluasaan untuk tabel `method_reports`
--
ALTER TABLE `method_reports`
  ADD CONSTRAINT `method_reports_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Ketidakleluasaan untuk tabel `trial_mix_data`
--
ALTER TABLE `trial_mix_data`
  ADD CONSTRAINT `trial_mix_data_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Ketidakleluasaan untuk tabel `work_items`
--
ALTER TABLE `work_items`
  ADD CONSTRAINT `work_items_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Ketidakleluasaan untuk tabel `work_progress`
--
ALTER TABLE `work_progress`
  ADD CONSTRAINT `work_progress_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `work_progress_ibfk_2` FOREIGN KEY (`work_item_id`) REFERENCES `work_items` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
