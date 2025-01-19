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
    console.log('Data yang diterima:', req.body);
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
            item_pekerjaan_mayor,
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
        if (isNaN(jumlahItem) || jumlahItem <= 0 || jumlahItem > 100) {
            return res.status(400).json({ 
                message: 'Jumlah item pekerjaan mayor harus berupa angka antara 1-100' 
            });
        }

        // Tambahkan validasi tanggal setelah validasi field wajib
        if (!isValidDate(tanggal_kontrak) || 
            !isValidDate(tanggal_mulai) || 
            !isValidDate(tanggal_selesai)) {
            return res.status(400).json({ 
                message: 'Format tanggal tidak valid (YYYY-MM-DD)' 
            });
        }

        // Format data sebelum dikirim
        const formattedData = {
            nama_kegiatan,
            nama_pekerjaan,
            lokasi,
            nomor_kontrak,
            tanggal_kontrak,
            nilai_kontrak: parseFloat(nilai_kontrak),
            nama_kontraktor_pelaksana,
            nama_konsultan_pengawas,
            lama_pekerjaan: parseInt(lama_pekerjaan),
            tanggal_mulai,
            tanggal_selesai,
            provisional_hand_over,
            final_hand_over,
            item_pekerjaan_mayor: JSON.stringify(item_pekerjaan_mayor || []), // Pastikan array kosong jika tidak ada data
            jumlah_item_pekerjaan_mayor: parseInt(jumlah_item_pekerjaan_mayor),
            status: status || 'Aktif'
        };

        const insertQuery = `
            INSERT INTO projects 
            (nama_kegiatan, nama_pekerjaan, lokasi, nomor_kontrak, tanggal_kontrak, 
            nilai_kontrak, nama_kontraktor_pelaksana, nama_konsultan_pengawas, 
            lama_pekerjaan, tanggal_mulai, tanggal_selesai, provisional_hand_over, final_hand_over,  
            item_pekerjaan_mayor, jumlah_item_pekerjaan_mayor, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [results] = await db.query(insertQuery, [
            formattedData.nama_kegiatan,
            formattedData.nama_pekerjaan,
            formattedData.lokasi,
            formattedData.nomor_kontrak,
            formattedData.tanggal_kontrak,
            formattedData.nilai_kontrak,
            formattedData.nama_kontraktor_pelaksana,
            formattedData.nama_konsultan_pengawas,
            formattedData.lama_pekerjaan,
            formattedData.tanggal_mulai,
            formattedData.tanggal_selesai,
            formattedData.provisional_hand_over,
            formattedData.final_hand_over,
            formattedData.item_pekerjaan_mayor,
            formattedData.jumlah_item_pekerjaan_mayor,
            formattedData.status
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
            SELECT 
                pp.*,
                dr.volume,
                (dr.volume * pp.harga_satuan) as nilai_total,
                CASE 
                    WHEN p.nilai_kontrak > 0 THEN 
                        ROUND((dr.volume * pp.harga_satuan) / p.nilai_kontrak * 100, 2)
                    ELSE 0 
                END as progress
            FROM project_progress pp
            LEFT JOIN dimension_reports dr 
                ON pp.project_id = dr.project_id 
                AND pp.item_pekerjaan = dr.item_pekerjaan
            LEFT JOIN projects p ON pp.project_id = p.id
            WHERE pp.project_id = ?
            ORDER BY pp.update_date DESC
        `;
        
        const [results] = await db.query(query, [projectId]);
        
        // Format hasil query
        const formattedResults = results.map(row => ({
            ...row,
            minggu: row.minggu || 'Minggu 1',
            volume: Number(row.volume) || 0,
            harga_satuan: Number(row.harga_satuan) || 0,
            nilai_total: Number(row.nilai_total) || 0,
            progress: Number(row.progress) || 0
        }));
        
        res.json(formattedResults);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Gagal mengambil data progress',
            error: error.message,
            data: []
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
            minggu,
            update_date
        } = req.body;

        // Validasi input dasar
        if (!project_id || !item_pekerjaan || !volume_pekerjaan || !harga_satuan) {
            return res.status(400).json({
                message: 'Data tidak lengkap'
            });
        }

        // Konversi nilai ke tipe data yang sesuai
        const formattedData = {
            project_id: Number(project_id),
            item_pekerjaan,
            nama_item_pekerjaan,
            volume_pekerjaan: parseFloat(volume_pekerjaan),
            satuan_pekerjaan: satuan_pekerjaan || 'm³',
            harga_satuan: parseFloat(harga_satuan),
            rencana_waktu_kerja: Number(rencana_waktu_kerja) || 0,
            minggu: minggu || 'Minggu 1',
            update_date: update_date || new Date().toISOString().split('T')[0]
        };

        // Hitung nilai_total
        const nilai_total = formattedData.volume_pekerjaan * formattedData.harga_satuan;

        // Query untuk mendapatkan nilai_kontrak dan insert data dalam satu koneksi
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Ambil nilai kontrak
            const [projectResult] = await connection.query(
                'SELECT nilai_kontrak FROM projects WHERE id = ?', 
                [formattedData.project_id]
            );
            
            const nilai_kontrak = projectResult[0]?.nilai_kontrak || 0;
            const progress = nilai_kontrak > 0 ? (nilai_total / nilai_kontrak * 100) : 0;

            // Insert data progress
            const [result] = await connection.query(
                `INSERT INTO project_progress 
                (project_id, item_pekerjaan, nama_item_pekerjaan, 
                volume_pekerjaan, satuan_pekerjaan, harga_satuan, 
                rencana_waktu_kerja, minggu, progress, update_date, nilai_total) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    formattedData.project_id,
                    formattedData.item_pekerjaan,
                    formattedData.nama_item_pekerjaan,
                    formattedData.volume_pekerjaan,
                    formattedData.satuan_pekerjaan,
                    formattedData.harga_satuan,
                    formattedData.rencana_waktu_kerja,
                    formattedData.minggu,
                    Number(progress.toFixed(2)),
                    formattedData.update_date,
                    nilai_total
                ]
            );

            await connection.commit();

            res.status(201).json({
                message: 'Progress berhasil ditambahkan',
                taskId: result.insertId,
                nilai_total,
                progress: progress.toFixed(2),
                volume_pekerjaan: formattedData.volume_pekerjaan
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan server',
            error: error.message
        });
    }
});

// Endpoint untuk update progress
app.put('/api/project-progress/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        project_id,
        item_pekerjaan,
        nama_item_pekerjaan,
        satuan_pekerjaan,
        harga_satuan,
        rencana_waktu_kerja,
        minggu,
        update_date
    } = req.body;
    
    try {
        // Ambil volume dari dimension_reports
        const volumeQuery = `
            SELECT volume 
            FROM dimension_reports 
            WHERE project_id = ? AND item_pekerjaan = ?
            ORDER BY id DESC LIMIT 1
        `;
        const [volumeResult] = await db.query(volumeQuery, [project_id, item_pekerjaan]);
        const volume = volumeResult[0]?.volume || 0;

        // Hitung nilai total
        const nilai_total = volume * Number(harga_satuan);

        const query = `
            UPDATE project_progress 
            SET item_pekerjaan = ?,
                nama_item_pekerjaan = ?,
                satuan_pekerjaan = ?,
                harga_satuan = ?,
                rencana_waktu_kerja = ?,
                minggu = ?,
                update_date = ?,
                nilai_total = ?
            WHERE id = ?
        `;
        
        await db.query(query, [
            item_pekerjaan,
            nama_item_pekerjaan,
            satuan_pekerjaan || 'm³',
            Number(harga_satuan) || 0,
            Number(rencana_waktu_kerja) || 0,
            minggu,
            update_date || new Date().toISOString().split('T')[0],
            nilai_total,
            id
        ]);
        
        res.json({ 
            message: 'Progress berhasil diupdate',
            nilai_total: nilai_total
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
            SELECT 
                d.*,
                pp.harga_satuan,
                (d.panjang_pengukuran * d.lebar_pengukuran * d.tinggi_pengukuran * pp.harga_satuan) as nilai_pekerjaan
            FROM dimension_reports d
            LEFT JOIN project_progress pp ON (
                pp.project_id = d.project_id 
                AND pp.item_pekerjaan = d.item_pekerjaan
                AND pp.minggu = d.minggu
            )
            ORDER BY d.id DESC
        `;
        const [results] = await db.query(query);
        
        // Format hasil untuk memastikan nilai numerik yang benar
        const formattedResults = results.map(row => ({
            ...row,
            volume: row.panjang_pengukuran * row.lebar_pengukuran * row.tinggi_pengukuran,
            harga_satuan: Number(row.harga_satuan) || 0,
            nilai_pekerjaan: Number(row.nilai_pekerjaan) || 0
        }));
        
        res.json(formattedResults);
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

    // Validasi data dengan pesan error yang lebih detail
    const requiredFields = ['project_id', 'no_kontrak', 'id_dimensi', 'item_pekerjaan', 'minggu'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Data tidak lengkap. Field yang harus diisi: ${missingFields.join(', ')}`
      });
    }

    // Validasi files
    const requiredFiles = ['foto_dokumentasi_panjang', 'foto_dokumentasi_lebar', 'foto_dokumentasi_tinggi'];
    const missingFiles = requiredFiles.filter(file => !files[file]);

    if (missingFiles.length > 0) {
      return res.status(400).json({
        message: `File tidak lengkap. File yang harus diupload: ${missingFiles.join(', ')}`
      });
    }

    // Konversi dan validasi nilai pengukuran
    const panjang = parseFloat(data.panjang_pengukuran) || 0;
    const lebar = parseFloat(data.lebar_pengukuran) || 0;
    const tinggi = parseFloat(data.tinggi_pengukuran) || 0;

    // Hitung volume
    const volume = panjang * lebar * tinggi;

    // Ambil harga satuan dari project_progress
    const progressQuery = `
      SELECT harga_satuan 
      FROM project_progress 
      WHERE project_id = ? 
      AND item_pekerjaan = ? 
      AND minggu = ?
      ORDER BY id DESC LIMIT 1
    `;
    
    const [progressResult] = await db.query(progressQuery, [
      data.project_id, 
      data.item_pekerjaan,
      data.minggu
    ]);
    
    const harga_satuan = parseFloat(progressResult[0]?.harga_satuan) || 0;

    // Hitung nilai pekerjaan
    const nilai_pekerjaan = volume * harga_satuan;

    // Validasi project_id
    const [project] = await db.query('SELECT id FROM projects WHERE id = ?', [data.project_id]);
    
    if (!project || project.length === 0) {
        return res.status(400).json({
            message: 'Project ID tidak valid atau tidak ditemukan'
        });
    }

    const insertQuery = `
      INSERT INTO dimension_reports (
        project_id, no_kontrak, id_dimensi, item_pekerjaan, minggu,
        panjang_pengukuran, foto_dokumentasi_panjang, lokasi_gps_panjang, tanggal_waktu_panjang,
        lebar_pengukuran, foto_dokumentasi_lebar, lokasi_gps_lebar, tanggal_waktu_lebar,
        tinggi_pengukuran, foto_dokumentasi_tinggi, lokasi_gps_tinggi, tanggal_waktu_tinggi,
        volume, harga_satuan, nilai_pekerjaan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      parseInt(data.project_id) || 0,
      data.no_kontrak,
      data.id_dimensi,
      data.item_pekerjaan,
      data.minggu,
      panjang,
      files.foto_dokumentasi_panjang[0].filename,
      data.lokasi_gps_panjang || null,
      data.tanggal_waktu_panjang || null,
      lebar,
      files.foto_dokumentasi_lebar[0].filename,
      data.lokasi_gps_lebar || null,
      data.tanggal_waktu_lebar || null,
      tinggi,
      files.foto_dokumentasi_tinggi[0].filename,
      data.lokasi_gps_tinggi || null,
      data.tanggal_waktu_tinggi || null,
      volume || 0,
      harga_satuan || 0,
      nilai_pekerjaan || 0
    ];

    const [result] = await db.query(insertQuery, values);

    res.status(201).json({
      message: 'Laporan dimensi berhasil ditambahkan',
      id: result.insertId,
      volume: volume || 0,
      harga_satuan: harga_satuan || 0,
      nilai_pekerjaan: nilai_pekerjaan || 0
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      message: 'Gagal menyimpan laporan dimensi',
      error: error.message
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

    // Validasi dan konversi nilai pengukuran
    const panjang = parseFloat(data.panjang_pengukuran) || 0;
    const lebar = parseFloat(data.lebar_pengukuran) || 0;
    const tinggi = parseFloat(data.tinggi_pengukuran) || 0;

    // Hitung volume dengan pengecekan
    const volume = panjang * lebar * tinggi || 0; // Gunakan 0 jika hasilnya NaN

    // Get existing photos
    const [existing] = await db.query('SELECT * FROM dimension_reports WHERE id = ?', [id]);
    
    const updateQuery = `
      UPDATE dimension_reports 
      SET no_kontrak = ?, 
          id_dimensi = ?, 
          item_pekerjaan = ?,
          panjang_pengukuran = ?, 
          foto_dokumentasi_panjang = ?, 
          lokasi_gps_panjang = ?, 
          tanggal_waktu_panjang = ?,
          lebar_pengukuran = ?, 
          foto_dokumentasi_lebar = ?, 
          lokasi_gps_lebar = ?, 
          tanggal_waktu_lebar = ?,
          tinggi_pengukuran = ?, 
          foto_dokumentasi_tinggi = ?, 
          lokasi_gps_tinggi = ?, 
          tanggal_waktu_tinggi = ?,
          volume = ?
      WHERE id = ?
    `;

    await db.query(updateQuery, [
      data.no_kontrak || null,
      data.id_dimensi || null,
      data.item_pekerjaan || null,
      panjang || null,
      files.foto_dokumentasi_panjang ? files.foto_dokumentasi_panjang[0].filename : existing[0].foto_dokumentasi_panjang,
      data.lokasi_gps_panjang || null,
      data.tanggal_waktu_panjang || null,
      lebar || null,
      files.foto_dokumentasi_lebar ? files.foto_dokumentasi_lebar[0].filename : existing[0].foto_dokumentasi_lebar,
      data.lokasi_gps_lebar || null,
      data.tanggal_waktu_lebar || null,
      tinggi || null,
      files.foto_dokumentasi_tinggi ? files.foto_dokumentasi_tinggi[0].filename : existing[0].foto_dokumentasi_tinggi,
      data.lokasi_gps_tinggi || null,
      data.tanggal_waktu_tinggi || null,
      volume,
      id
    ]);

    res.json({ 
      message: 'Laporan dimensi berhasil diupdate',
      volume: volume
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      message: 'Gagal mengupdate laporan dimensi',
      error: error.message
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Endpoint untuk mendapatkan item pekerjaan mayor
app.get('/api/item-pekerjaan-mayor/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Ambil data projects terlebih dahulu
        const projectQuery = 'SELECT item_pekerjaan_mayor FROM projects WHERE id = ?';
        const [projectResult] = await db.query(projectQuery, [id]);

        if (!projectResult.length) {
            return res.status(404).json({
                message: 'Project tidak ditemukan'
            });
        }

        let itemPekerjaanMayor = [];
        
        // Coba parse jika dalam format JSON, jika bukan, split berdasarkan koma atau titik koma
        if (projectResult[0].item_pekerjaan_mayor) {
            try {
                // Coba parse sebagai JSON
                itemPekerjaanMayor = JSON.parse(projectResult[0].item_pekerjaan_mayor);
            } catch (parseError) {
                // Jika bukan JSON, split string berdasarkan koma atau titik koma
                itemPekerjaanMayor = projectResult[0].item_pekerjaan_mayor
                    .split(/[,;]/)
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
            }
        }

        // Format data sesuai yang dibutuhkan frontend
        const formattedData = Array.isArray(itemPekerjaanMayor) ? 
            itemPekerjaanMayor.map((item, index) => ({
                kode_item: `ITEM-${index + 1}`,
                nama_item: typeof item === 'string' ? item.trim() : item
            })) : 
            typeof itemPekerjaanMayor === 'string' ? 
            [{
                kode_item: 'ITEM-1',
                nama_item: itemPekerjaanMayor.trim()
            }] : [];

        res.json(formattedData);
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Gagal mengambil data item pekerjaan mayor',
            error: error.message
        });
    }
});

// Jalankan server
app.listen(appPort, () => {
    console.log(`Server berjalan di http://localhost:${appPort}`);
});