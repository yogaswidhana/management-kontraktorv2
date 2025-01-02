require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const dbPort = 3306; // Port untuk server MySQL
const appPort = 5000; // Ubah port ke 5000 untuk menghindari konflik dengan frontend
const multer = require('multer');
const path = require('path');

app.use(cors({
    origin: 'http://localhost:3000', // Frontend berjalan di port 3000
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

// Konfigurasi database
const db = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: '',
    database: 'kontraktor_db',
    port: dbPort // Menggunakan port MySQL default 3306
});

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/dimensi')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb('Error: Images Only!');
  }
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Terjadi kesalahan internal server'
    });
});

// Middleware untuk menangani error multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: `Error upload file: ${err.message}`
    });
  } else if (err) {
    return res.status(500).json({
      message: `Error internal server: ${err.message}`
    });
  }
  next();
});

// Route login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Username dan password harus diisi'
            });
        }

        const query = 'SELECT * FROM users WHERE username = ?';
        
        const [results] = await db.query(query, [username]);

        if (results.length === 0) {
            return res.status(401).json({
                message: 'Username atau password salah'
            });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                message: 'Username atau password salah'
            });
        }

        res.status(200).json({
            message: 'Login berhasil',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                jabatan: user.jabatan,
                organisasi: user.organisasi
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan server'
        });
    }
});

// Route register
app.post('/api/register', async (req, res) => {
    const { username, password, jabatan, organisasi, role } = req.body;

    if (!username || !password || !jabatan || !organisasi || !role) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    try {
        const checkQuery = 'SELECT * FROM users WHERE username = ?';
        const [results] = await db.query(checkQuery, [username]);

        if (results.length > 0) {
            return res.status(400).json({
                message: 'Username sudah digunakan'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = 'INSERT INTO users (username, password, jabatan, organisasi, role) VALUES (?, ?, ?, ?, ?)';
        await db.query(insertQuery, [username, hashedPassword, jabatan, organisasi, role]);

        res.status(201).json({ 
            message: 'Registrasi berhasil!' 
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Terjadi kesalahan saat registrasi' 
        });
    }
});

// Route untuk mendapatkan profil pengguna
app.get('/api/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const query = 'SELECT id, username, jabatan, organisasi, role FROM users WHERE username = ?';
        
        const [results] = await db.query(query, [username]);

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Pengguna tidak ditemukan'
            });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan server'
        });
    }
});

// Route untuk memperbarui profil pengguna
app.put('/api/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { newUsername, newPassword, newJabatan, newOrganisasi } = req.body;

        if (!newUsername || !newPassword || !newJabatan || !newOrganisasi) {
            return res.status(400).json({
                message: 'Semua field harus diisi'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'Password baru harus minimal 6 karakter'
            });
        }

        const checkQuery = 'SELECT * FROM users WHERE username = ? AND username != ?';
        const [results] = await db.query(checkQuery, [newUsername, username]);

        if (results.length > 0) {
            return res.status(400).json({
                message: 'Username baru sudah digunakan'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateQuery = 'UPDATE users SET username = ?, password = ?, jabatan = ?, organisasi = ? WHERE username = ?';
        
        await db.query(updateQuery, [newUsername, hashedPassword, newJabatan, newOrganisasi, username]);

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: 'Pengguna tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Profil berhasil diperbarui'
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan server'
        });
    }
});

// Route untuk menambahkan proyek
app.post('/api/projects', async (req, res) => {
    console.log('Data yang diterima:', req.body); // Log data yang diterima
    try {
        const { 
            nama_kegiatan, 
            nama_pekerjaan,
            lokasi,
            nomor_kontrak,
            tanggal_kontrak,
            nilai_kontrak,
            nama_kontraktor_pelaksana,
            nama_konsultan_pengawas,
            lama_pekerjaan,
            tanggal_mulai,
            tanggal_selesai,
            provisional_hand_over,
            final_hand_over,
            jumlah_item_pekerjaan_mayor,
            status
        } = req.body;

        // Validasi field yang wajib diisi
        const requiredFields = {
            nama_kegiatan,
            nama_pekerjaan,
            lokasi,
            nomor_kontrak,
            tanggal_kontrak,
            nilai_kontrak,
            nama_kontraktor_pelaksana,
            nama_konsultan_pengawas,
            lama_pekerjaan,
            tanggal_mulai,
            tanggal_selesai,
            jumlah_item_pekerjaan_mayor
        };

        // Check which required fields are missing
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Field berikut harus diisi: ${missingFields.join(', ')}`,
                missingFields: missingFields
            });
        }

        // Validasi nilai kontrak
        const nilaiKontrak = parseFloat(nilai_kontrak);
        if (isNaN(nilaiKontrak) || nilaiKontrak <= 0) {
            return res.status(400).json({ message: 'Nilai kontrak harus berupa angka dan lebih besar dari 0' });
        }

        // Validasi lama pekerjaan
        const lamaPekerjaanInt = parseInt(lama_pekerjaan);
        if (isNaN(lamaPekerjaanInt) || lamaPekerjaanInt <= 0) {
            return res.status(400).json({ message: 'Lama pekerjaan harus berupa angka dan lebih besar dari 0' });
        }

        // Validasi jumlah item pekerjaan mayor
        const jumlahItem = parseInt(jumlah_item_pekerjaan_mayor);
        if (isNaN(jumlahItem) || jumlahItem <= 0) {
            return res.status(400).json({ message: 'Jumlah item pekerjaan mayor harus berupa angka dan lebih besar dari 0' });
        }

        // Tambahkan validasi tanggal setelah validasi field wajib
        if (!isValidDate(tanggal_kontrak) || 
            !isValidDate(tanggal_mulai) || 
            !isValidDate(tanggal_selesai)) {
            return res.status(400).json({ 
                message: 'Format tanggal tidak valid (YYYY-MM-DD)' 
            });
        }

        const insertQuery = `
            INSERT INTO projects 
            (nama_kegiatan, nama_pekerjaan, lokasi, nomor_kontrak, tanggal_kontrak, 
            nilai_kontrak, nama_kontraktor_pelaksana, nama_konsultan_pengawas, 
            lama_pekerjaan, tanggal_mulai, tanggal_selesai, provisional_hand_over, final_hand_over,  
            jumlah_item_pekerjaan_mayor, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [results] = await db.query(insertQuery, [
            nama_kegiatan,
            nama_pekerjaan,
            lokasi,
            nomor_kontrak,
            tanggal_kontrak,
            nilaiKontrak,
            nama_kontraktor_pelaksana,
            nama_konsultan_pengawas,
            lamaPekerjaanInt,
            tanggal_mulai,
            tanggal_selesai,
            provisional_hand_over || '',
            final_hand_over || '',
            jumlahItem,
            status || 'Aktif'
        ]);

        res.status(201).json({ 
            message: 'Proyek berhasil ditambahkan!',
            projectId: results.insertId 
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Terjadi kesalahan server',
            error: error.message 
        });
    }
});

// Fungsi helper untuk validasi format tanggal
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Route untuk mendapatkan semua proyek
app.get('/api/projects', async (req, res) => {
    const query = 'SELECT * FROM projects ORDER BY created_at DESC';

    try {
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Terjadi kesalahan saat mengambil data proyek' 
        });
    }
});

// Route untuk mendapatkan detail proyek berdasarkan ID
app.get('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM projects WHERE id = ?';

    try {
        const [results] = await db.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Proyek tidak ditemukan'
            });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil detail proyek'
        });
    }
});

// Route untuk memperbarui proyek
app.put('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    const {
        nama_kegiatan,
        nama_pekerjaan,
        lokasi,
        nomor_kontrak,
        tanggal_kontrak,
        nilai_kontrak,
        nama_kontraktor_pelaksana,
        nama_konsultan_pengawas,
        lama_pekerjaan,
        tanggal_mulai,
        tanggal_selesai,
        provisional_hand_over,
        final_hand_over,
        jumlah_item_pekerjaan_mayor,
        status
    } = req.body;

    if (!nama_kegiatan || !nama_pekerjaan || !lokasi || !nomor_kontrak || !tanggal_kontrak || 
        !nilai_kontrak || !nama_kontraktor_pelaksana || !nama_konsultan_pengawas || 
        !lama_pekerjaan || !tanggal_mulai || !tanggal_selesai || !jumlah_item_pekerjaan_mayor) {
        return res.status(400).json({
            message: 'Field wajib harus diisi'
        });
    }

    const updateQuery = `
        UPDATE projects 
        SET nama_kegiatan = ?, nama_pekerjaan = ?, lokasi = ?, nomor_kontrak = ?, 
            tanggal_kontrak = ?, nilai_kontrak = ?, nama_kontraktor_pelaksana = ?, 
            nama_konsultan_pengawas = ?, lama_pekerjaan = ?, tanggal_mulai = ?, 
            tanggal_selesai = ?, provisional_hand_over = ?, final_hand_over = ?,
            jumlah_item_pekerjaan_mayor = ?, status = ?
        WHERE id = ?
    `;

    try {
        const [results] = await db.query(updateQuery, [
            nama_kegiatan,
            nama_pekerjaan,
            lokasi,
            nomor_kontrak,
            tanggal_kontrak,
            nilai_kontrak,
            nama_kontraktor_pelaksana,
            nama_konsultan_pengawas,
            lama_pekerjaan,
            tanggal_mulai,
            tanggal_selesai,
            provisional_hand_over,
            final_hand_over,
            jumlah_item_pekerjaan_mayor,
            status,
            id
        ]);

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: 'Proyek tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Proyek berhasil diperbarui'
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui proyek'
        });
    }
});

// Route untuk menghapus proyek
app.delete('/api/projects/:id', async (req, res) => {
    const { id } = req.params;

    // Cek apakah proyek memiliki data terkait
    const checkQuery = `
        SELECT 
            (SELECT COUNT(*) FROM work_items WHERE project_id = ?) as work_items_count,
            (SELECT COUNT(*) FROM work_progress WHERE project_id = ?) as work_progress_count,
            (SELECT COUNT(*) FROM compaction_reports WHERE project_id = ?) as compaction_reports_count,
            (SELECT COUNT(*) FROM dimension_reports WHERE project_id = ?) as dimension_reports_count,
            (SELECT COUNT(*) FROM method_reports WHERE project_id = ?) as method_reports_count,
            (SELECT COUNT(*) FROM lab_data WHERE project_id = ?) as lab_data_count,
            (SELECT COUNT(*) FROM trial_mix_data WHERE project_id = ?) as trial_mix_data_count
    `;

    try {
        const [results] = await db.query(checkQuery, [id, id, id, id, id, id, id]);

        const relatedData = results[0];
        const hasRelatedData = Object.values(relatedData).some(count => count > 0);

        if (hasRelatedData) {
            return res.status(400).json({
                message: 'Proyek tidak dapat dihapus karena masih memiliki data terkait'
            });
        }

        // Jika tidak ada data terkait, lanjutkan dengan penghapusan
        const deleteQuery = 'DELETE FROM projects WHERE id = ?';
        await db.query(deleteQuery, [id]);

        res.status(200).json({
            message: 'Proyek berhasil dihapus'
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menghapus proyek'
        });
    }
});

// Endpoint untuk mendapatkan progress berdasarkan project_id
app.get('/api/project-progress/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const query = `
            SELECT * FROM project_progress 
            WHERE project_id = ?
            ORDER BY update_date DESC
        `;
        
        const [results] = await db.query(query, [projectId]);
        
        // Format hasil query tanpa parsing JSON
        const formattedResults = results.map(row => ({
            ...row,
            minggu: row.minggu || 'Minggu 1',  // Gunakan string langsung
            progress: Number(row.progress) || 0
        }));
        
        res.json(formattedResults);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Gagal mengambil data progress',
            error: error.message
        });
    }
});

// Endpoint untuk menambah progress
app.post('/api/project-progress', async (req, res) => {
    try {
        const { 
            project_id,
            item_pekerjaan,
            nama_item_pekerjaan,
            volume_pekerjaan,
            satuan_pekerjaan,
            harga_satuan,
            rencana_waktu_kerja,
            minggu,        // Terima sebagai string
            progress,
            update_date 
        } = req.body;

        const insertQuery = `
            INSERT INTO project_progress 
            (project_id, item_pekerjaan, nama_item_pekerjaan, 
            volume_pekerjaan, satuan_pekerjaan, harga_satuan, 
            rencana_waktu_kerja, minggu, progress, update_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(insertQuery, [
            Number(project_id),
            item_pekerjaan,
            nama_item_pekerjaan,
            Number(volume_pekerjaan) || 0,
            satuan_pekerjaan || 'm³',
            Number(harga_satuan) || 0,
            Number(rencana_waktu_kerja) || 0,
            minggu,        // Simpan sebagai string
            Number(progress) || 0,
            update_date || new Date().toISOString().split('T')[0]
        ]);

        res.status(201).json({
            message: 'Progress berhasil ditambahkan',
            taskId: result.insertId
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan server',
            error: error.message
        });
    }
});

// Route untuk menyimpan method report
app.post('/api/method-reports', async (req, res) => {
    try {
        const { 
            project_id, 
            work_type, 
            method_data, 
            process_flow,
            status,
            consultant_notes,
            owner_notes 
        } = req.body;

        // Validasi input
        if (!project_id || typeof project_id !== 'number') {
            return res.status(400).json({
                message: 'Project ID tidak valid'
            });
        }

        if (!work_type || !['excavation', 'embankment', 'subgrade', 'granular_pavement', 'asphalt_pavement'].includes(work_type)) {
            return res.status(400).json({
                message: 'Work type tidak valid'
            });
        }

        // Cek apakah sudah ada penilaian untuk project_id dan work_type yang sama
        const checkExistingQuery = 'SELECT id FROM method_reports WHERE project_id = ? AND work_type = ?';
        const [results] = await db.query(checkExistingQuery, [project_id, work_type]);

        if (results.length > 0) {
            // Jika sudah ada, update penilaian yang ada
            const updateQuery = `
                UPDATE method_reports 
                SET method_data = ?, 
                    process_flow = ?,
                    status = ?,
                    consultant_notes = ?,
                    owner_notes = ?
                WHERE project_id = ? AND work_type = ?
            `;

            await db.query(updateQuery, [
                JSON.stringify(method_data),
                JSON.stringify(process_flow || {}),
                status || 'submitted',
                consultant_notes || null,
                owner_notes || null,
                project_id,
                work_type
            ]);

            res.status(200).json({
                message: 'Penilaian metode berhasil diperbarui'
            });
        } else {
            // Jika belum ada, buat penilaian baru
            const insertQuery = `
                INSERT INTO method_reports 
                (project_id, work_type, method_data, process_flow, status, consultant_notes, owner_notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const [insertResult] = await db.query(insertQuery, [
                project_id,
                work_type,
                JSON.stringify(method_data),
                JSON.stringify(process_flow || {}),
                status || 'submitted',
                consultant_notes || null,
                owner_notes || null
            ]);

            res.status(201).json({
                message: 'Penilaian metode berhasil disimpan',
                id: insertResult.insertId
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan server'
        });
    }
});

// Route untuk menyimpan laporan dimensi
app.post('/api/dimension-reports', upload.fields([
  { name: 'foto_dokumentasi_panjang', maxCount: 1 },
  { name: 'foto_dokumentasi_lebar', maxCount: 1 },
  { name: 'foto_dokumentasi_tinggi', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Files received:', req.files);
    console.log('Data received:', req.body);

    const files = req.files;
    const data = req.body;

    // Validasi data dengan pesan error yang lebih detail
    const requiredFields = ['project_id', 'no_kontrak', 'id_dimensi', 'item_pekerjaan'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Data tidak lengkap. Field yang harus diisi: ${missingFields.join(', ')}`
      });
    }

    // Validasi files dengan pesan error yang lebih detail
    const requiredFiles = ['foto_dokumentasi_panjang', 'foto_dokumentasi_lebar', 'foto_dokumentasi_tinggi'];
    const missingFiles = requiredFiles.filter(file => !files[file]);

    if (missingFiles.length > 0) {
      return res.status(400).json({
        message: `File tidak lengkap. File yang harus diupload: ${missingFiles.join(', ')}`
      });
    }

    const insertQuery = `
      INSERT INTO dimension_reports (
        project_id, no_kontrak, id_dimensi, item_pekerjaan,
        panjang_pengukuran, foto_dokumentasi_panjang, lokasi_gps_panjang, tanggal_waktu_panjang,
        lebar_pengukuran, foto_dokumentasi_lebar, lokasi_gps_lebar, tanggal_waktu_lebar,
        tinggi_pengukuran, foto_dokumentasi_tinggi, lokasi_gps_tinggi, tanggal_waktu_tinggi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(insertQuery, [
      parseInt(data.project_id),
      data.no_kontrak,
      data.id_dimensi,
      data.item_pekerjaan,
      parseFloat(data.panjang_pengukuran),
      files.foto_dokumentasi_panjang[0].filename,
      data.lokasi_gps_panjang,
      data.tanggal_waktu_panjang,
      parseFloat(data.lebar_pengukuran),
      files.foto_dokumentasi_lebar[0].filename,
      data.lokasi_gps_lebar,
      data.tanggal_waktu_lebar,
      parseFloat(data.tinggi_pengukuran),
      files.foto_dokumentasi_tinggi[0].filename,
      data.lokasi_gps_tinggi,
      data.tanggal_waktu_tinggi
    ]);

    res.status(201).json({
      message: 'Laporan dimensi berhasil ditambahkan',
      id: result.insertId
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      message: 'Gagal menyimpan laporan dimensi',
      error: error.message
    });
  }
});

// Route untuk mendapatkan daftar work items berdasarkan project_id
app.get('/api/projects/:id/work-items', async (req, res) => {
    const { id } = req.params;
    
    const query = `SELECT id, name FROM work_items WHERE project_id = ?`;
    
    try {
        const [results] = await db.query(query, [id]);
        
        res.json(results);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data work items'
        });
    }
});

// Endpoint untuk update progress
app.put('/api/project-progress/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        item_pekerjaan,
        nama_item_pekerjaan,
        volume_pekerjaan,
        satuan_pekerjaan,
        harga_satuan,
        rencana_waktu_kerja,
        minggu,
        update_date
    } = req.body;
    
    try {
        // Pastikan minggu adalah array yang valid dan memiliki struktur yang benar
        let mingguData = [];
        if (Array.isArray(minggu)) {
            mingguData = minggu.map(item => ({
                minggu_ke: item.minggu_ke,
                progress: parseFloat(item.progress) || 0
            }));
        }

        const query = `
            UPDATE project_progress 
            SET item_pekerjaan = ?,
                nama_item_pekerjaan = ?,
                volume_pekerjaan = ?,
                satuan_pekerjaan = ?,
                harga_satuan = ?,
                rencana_waktu_kerja = ?,
                minggu = ?,
                update_date = ?
            WHERE id = ?
        `;
        
        await db.query(query, [
            item_pekerjaan,
            nama_item_pekerjaan,
            Number(volume_pekerjaan) || 0,
            satuan_pekerjaan || 'm³',
            Number(harga_satuan) || 0,
            Number(rencana_waktu_kerja) || 0,
            JSON.stringify(mingguData),
            update_date || new Date().toISOString().split('T')[0],
            id
        ]);
        
        res.json({ 
            message: 'Progress berhasil diupdate',
            mingguData: mingguData
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Gagal mengupdate progress',
            error: error.message 
        });
    }
});

// Endpoint untuk delete progress
app.delete('/api/project-progress/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const query = 'DELETE FROM project_progress WHERE id = ?';
        await db.query(query, [id]);
        
        res.json({ message: 'Progress berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus progress' });
    }
});

// Endpoint untuk mendapatkan laporan dimensi
app.get('/api/dimension-reports', async (req, res) => {
    try {
        const query = `
            SELECT * FROM dimension_reports 
            ORDER BY id DESC
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Gagal mengambil data laporan dimensi'
        });
    }
});

// Endpoint untuk menambah laporan dimensi
app.post('/api/dimension-reports', upload.fields([
  { name: 'foto_dokumentasi_panjang', maxCount: 1 },
  { name: 'foto_dokumentasi_lebar', maxCount: 1 },
  { name: 'foto_dokumentasi_tinggi', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files;
    const data = req.body;

    const insertQuery = `
      INSERT INTO dimension_reports (
        project_id, no_kontrak, id_dimensi, item_pekerjaan,
        panjang_pengukuran, foto_dokumentasi_panjang, lokasi_gps_panjang, tanggal_waktu_panjang,
        lebar_pengukuran, foto_dokumentasi_lebar, lokasi_gps_lebar, tanggal_waktu_lebar,
        tinggi_pengukuran, foto_dokumentasi_tinggi, lokasi_gps_tinggi, tanggal_waktu_tinggi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(insertQuery, [
      data.project_id,
      data.no_kontrak,
      data.id_dimensi,
      data.item_pekerjaan,
      data.panjang_pengukuran,
      files.foto_dokumentasi_panjang ? files.foto_dokumentasi_panjang[0].filename : null,
      data.lokasi_gps_panjang,
      data.tanggal_waktu_panjang,
      data.lebar_pengukuran,
      files.foto_dokumentasi_lebar ? files.foto_dokumentasi_lebar[0].filename : null,
      data.lokasi_gps_lebar,
      data.tanggal_waktu_lebar,
      data.tinggi_pengukuran,
      files.foto_dokumentasi_tinggi ? files.foto_dokumentasi_tinggi[0].filename : null,
      data.lokasi_gps_tinggi,
      data.tanggal_waktu_tinggi
    ]);

    res.status(201).json({
      message: 'Laporan dimensi berhasil ditambahkan',
      id: result.insertId
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      message: 'Gagal menyimpan laporan dimensi'
    });
  }
});

// Endpoint untuk menghapus laporan dimensi
app.delete('/api/dimension-reports/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuery = 'DELETE FROM dimension_reports WHERE id = ?';
        await db.query(deleteQuery, [id]);
        res.json({ message: 'Laporan dimensi berhasil dihapus' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Gagal menghapus laporan dimensi'
        });
    }
});

// Endpoint untuk update laporan dimensi
app.put('/api/dimension-reports/:id', upload.fields([
  { name: 'foto_dokumentasi_panjang', maxCount: 1 },
  { name: 'foto_dokumentasi_lebar', maxCount: 1 },
  { name: 'foto_dokumentasi_tinggi', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    const data = req.body;

    // Get existing photos
    const [existing] = await db.query('SELECT * FROM dimension_reports WHERE id = ?', [id]);
    
    const updateQuery = `
      UPDATE dimension_reports 
      SET no_kontrak = ?, id_dimensi = ?, item_pekerjaan = ?,
          panjang_pengukuran = ?, foto_dokumentasi_panjang = ?, lokasi_gps_panjang = ?, tanggal_waktu_panjang = ?,
          lebar_pengukuran = ?, foto_dokumentasi_lebar = ?, lokasi_gps_lebar = ?, tanggal_waktu_lebar = ?,
          tinggi_pengukuran = ?, foto_dokumentasi_tinggi = ?, lokasi_gps_tinggi = ?, tanggal_waktu_tinggi = ?
      WHERE id = ?
    `;

    await db.query(updateQuery, [
      data.no_kontrak,
      data.id_dimensi,
      data.item_pekerjaan,
      data.panjang_pengukuran,
      files.foto_dokumentasi_panjang ? files.foto_dokumentasi_panjang[0].filename : existing[0].foto_dokumentasi_panjang,
      data.lokasi_gps_panjang,
      data.tanggal_waktu_panjang,
      data.lebar_pengukuran,
      files.foto_dokumentasi_lebar ? files.foto_dokumentasi_lebar[0].filename : existing[0].foto_dokumentasi_lebar,
      data.lokasi_gps_lebar,
      data.tanggal_waktu_lebar,
      data.tinggi_pengukuran,
      files.foto_dokumentasi_tinggi ? files.foto_dokumentasi_tinggi[0].filename : existing[0].foto_dokumentasi_tinggi,
      data.lokasi_gps_tinggi,
      data.tanggal_waktu_tinggi,
      id
    ]);

    res.json({ message: 'Laporan dimensi berhasil diupdate' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      message: 'Gagal mengupdate laporan dimensi'
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Jalankan server
app.listen(appPort, () => {
    console.log(`Server berjalan di http://localhost:${appPort}`);
});