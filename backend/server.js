const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const port = 3306; // Port untuk server MySQL
const appPort = 3000; // Port untuk aplikasi Express

app.use(cors({
    origin: 'http://localhost:5000', // Allow only this origin
    credentials: true // Allow credentials (like cookies) to be sent
}));
app.use(bodyParser.json());
app.use(express.json());

// Konfigurasi database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kontraktor_db',
    port: port // Menggunakan port MySQL
});

// Koneksi database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Terjadi kesalahan internal server'
    });
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
        
        db.query(query, [username], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    message: 'Terjadi kesalahan server'
                });
            }

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
        db.query(checkQuery, [username], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    message: 'Terjadi kesalahan server'
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    message: 'Username sudah digunakan'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertQuery = 'INSERT INTO users (username, password, jabatan, organisasi, role) VALUES (?, ?, ?, ?, ?)';
            db.query(insertQuery, [username, hashedPassword, jabatan, organisasi, role], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        message: 'Terjadi kesalahan server'
                    });
                }

                res.status(201).json({ 
                    message: 'Registrasi berhasil!' 
                });
            });
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
        
        db.query(query, [username], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    message: 'Terjadi kesalahan server'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Pengguna tidak ditemukan'
                });
            }

            res.status(200).json(results[0]);
        });
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
        db.query(checkQuery, [newUsername, username], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    message: 'Terjadi kesalahan server'
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    message: 'Username baru sudah digunakan'
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updateQuery = 'UPDATE users SET username = ?, password = ?, jabatan = ?, organisasi = ? WHERE username = ?';
            
            db.query(updateQuery, [newUsername, hashedPassword, newJabatan, newOrganisasi, username], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        message: 'Terjadi kesalahan server'
                    });
                }

                if (results.affectedRows === 0) {
                    return res.status(404).json({
                        message: 'Pengguna tidak ditemukan'
                    });
                }

                res.status(200).json({
                    message: 'Profil berhasil diperbarui'
                });
            });
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
    const { 
        name, 
        contract_number,
        contractor_name,
        description,
        location,
        volume,
        start_date,
        end_date,
        budget,
        status
    } = req.body;

    if (!name || !contract_number || !contractor_name || !location || !start_date || !end_date || !budget) {
        return res.status(400).json({ 
            message: 'Field wajib harus diisi' 
        });
    }

    try {
        const insertQuery = `
            INSERT INTO projects 
            (name, contract_number, contractor_name, description, location, volume, start_date, end_date, budget, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [
            name,
            contract_number,
            contractor_name,
            description,
            location,
            volume,
            start_date,
            end_date,
            budget,
            status || 'Aktif'
        ], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    message: 'Terjadi kesalahan saat menambahkan proyek' 
                });
            }

            res.status(201).json({ 
                message: 'Proyek berhasil ditambahkan!',
                projectId: results.insertId 
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Terjadi kesalahan server' 
        });
    }
});

// Route untuk mendapatkan semua proyek
app.get('/api/projects', (req, res) => {
    const query = 'SELECT * FROM projects ORDER BY created_at DESC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                message: 'Terjadi kesalahan saat mengambil data proyek' 
            });
        }

        const formattedResults = results.map(project => ({
            ...project,
            budget: parseFloat(project.budget),
            volume: project.volume ? parseFloat(project.volume) : null,
            start_date: project.start_date,
            end_date: project.end_date
        }));

        res.status(200).json(formattedResults);
    });
});

// Route untuk mendapatkan detail proyek berdasarkan ID
app.get('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM projects WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                message: 'Terjadi kesalahan saat mengambil detail proyek'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Proyek tidak ditemukan'
            });
        }

        const project = {
            ...results[0],
            budget: parseFloat(results[0].budget),
            volume: results[0].volume ? parseFloat(results[0].volume) : null
        };

        res.status(200).json(project);
    });
});

// Route untuk memperbarui proyek
app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const {
        name,
        contract_number,
        contractor_name,
        description,
        location,
        volume,
        start_date,
        end_date,
        budget,
        status
    } = req.body;

    if (!name || !contract_number || !contractor_name || !location || !start_date || !end_date || !budget) {
        return res.status(400).json({
            message: 'Field wajib harus diisi'
        });
    }

    const updateQuery = `
        UPDATE projects 
        SET name = ?, contract_number = ?, contractor_name = ?, description = ?, location = ?, 
            volume = ?, start_date = ?, end_date = ?, budget = ?, status = ?
        WHERE id = ?
    `;

    db.query(updateQuery, [
        name,
        contract_number,
        contractor_name,
        description,
        location,
        volume,
        start_date,
        end_date,
        budget,
        status,
        id
    ], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                message: 'Terjadi kesalahan saat memperbarui proyek'
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: 'Proyek tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Proyek berhasil diperbarui'
        });
    });
});

// Route untuk menghapus proyek
app.delete('/api/projects/:id', (req, res) => {
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

    db.query(checkQuery, [id, id, id, id, id, id, id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                message: 'Terjadi kesalahan saat memeriksa data proyek'
            });
        }

        const relatedData = results[0];
        const hasRelatedData = Object.values(relatedData).some(count => count > 0);

        if (hasRelatedData) {
            return res.status(400).json({
                message: 'Proyek tidak dapat dihapus karena masih memiliki data terkait'
            });
        }

        // Jika tidak ada data terkait, lanjutkan dengan penghapusan
        const deleteQuery = 'DELETE FROM projects WHERE id = ?';
        db.query(deleteQuery, [id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    message: 'Terjadi kesalahan saat menghapus proyek'
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Proyek tidak ditemukan'
                });
            }

            res.status(200).json({
                message: 'Proyek berhasil dihapus'
            });
        });
    });
});

// Route untuk mendapatkan progress proyek
app.get('/api/projects/:id/progress', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT p.*, pp.task_name, pp.progress, pp.description, pp.pic, pp.update_date
        FROM projects p
        LEFT JOIN project_progress pp ON p.id = pp.project_id
        WHERE p.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                message: 'Terjadi kesalahan saat mengambil progress proyek'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Proyek tidak ditemukan'
            });
        }

        // Format data
        const project = {
            ...results[0],
            tasks: results.map(row => ({
                name: row.task_name,
                progress: row.progress,
                description: row.description,
                pic: row.pic,
                updateDate: row.update_date
            }))
        };

        res.status(200).json(project);
    });
});

// Route untuk menambah/update progress
app.post('/api/projects/:id/progress', (req, res) => {
    const { id } = req.params;
    const { task_name, progress, description, pic } = req.body;

    const query = `
        INSERT INTO project_progress (project_id, task_name, progress, description, pic, update_date)
        VALUES (?, ?, ?, ?, ?, CURDATE())
        ON DUPLICATE KEY UPDATE
        progress = VALUES(progress),
        description = VALUES(description),
        pic = VALUES(pic),
        update_date = CURDATE()
    `;

    db.query(query, [id, task_name, progress, description, pic], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                message: 'Terjadi kesalahan saat menyimpan progress'
            });
        }

        res.status(200).json({
            message: 'Progress berhasil disimpan'
        });
    });
});

// Jalankan server
app.listen(appPort, () => {
    console.log(`Server berjalan di http://localhost:${appPort}`);
});