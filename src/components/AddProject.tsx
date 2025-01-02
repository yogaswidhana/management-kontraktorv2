import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Grid, TextField, Button, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const AddProject = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [projectData, setProjectData] = useState({
        nama_kegiatan: '',
        nama_pekerjaan: '',
        lokasi: '',
        nomor_kontrak: '',
        tanggal_kontrak: '',
        nilai_kontrak: '',
        nama_kontraktor_pelaksana: '',
        nama_konsultan_pengawas: '', 
        lama_pekerjaan: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        provisional_hand_over: '',
        final_hand_over: '',
        jumlah_item_pekerjaan_mayor: '',
        status: 'Aktif' as 'Aktif' | 'Selesai' | 'Tertunda' | 'Dibatalkan',
    });

    const statusOptions = [
        { value: 'Aktif', label: 'Aktif' },
        { value: 'Selesai', label: 'Selesai' },
        { value: 'Tertunda', label: 'Tertunda' },
        { value: 'Dibatalkan', label: 'Dibatalkan' }
    ];

    useEffect(() => {
        if (projectData.tanggal_mulai && projectData.tanggal_selesai) {
            const startDate = new Date(projectData.tanggal_mulai);
            const endDate = new Date(projectData.tanggal_selesai);
            
            // Hitung selisih dalam miliseconds
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            // Konversi ke minggu (pembulatan ke atas)
            const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
            
            setProjectData(prev => ({
                ...prev,
                lama_pekerjaan: diffWeeks.toString()
            }));
        }
    }, [projectData.tanggal_mulai, projectData.tanggal_selesai]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Khusus untuk nilai kontrak, format sebagai angka
        if (name === 'nilai_kontrak') {
            // Hapus karakter non-digit
            const numericValue = value.replace(/[^0-9]/g, '');
            // Format sebagai mata uang
            const formattedValue = new Intl.NumberFormat('id-ID').format(Number(numericValue));
            setProjectData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else {
            setProjectData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Validasi input
            const requiredFields = [
                'nama_kegiatan',
                'nama_pekerjaan', 
                'lokasi',
                'nomor_kontrak',
                'tanggal_kontrak',
                'nilai_kontrak',
                'nama_kontraktor_pelaksana',
                'nama_konsultan_pengawas',
                'lama_pekerjaan',
                'tanggal_mulai',
                'tanggal_selesai',
                'provisional_hand_over',
                'final_hand_over',
                'jumlah_item_pekerjaan_mayor',
            ];

            const emptyFields = requiredFields.filter(field => !projectData[field as keyof typeof projectData]);

            if (emptyFields.length > 0) {
                toast.error(`Field berikut harus diisi: ${emptyFields.join(', ')}`);
                return;
            }

            // Validasi tanggal
            const startDate = new Date(projectData.tanggal_mulai);
            const endDate = new Date(projectData.tanggal_selesai);
            const contractDate = new Date(projectData.tanggal_kontrak);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (startDate < today) {
                toast.error(`Tanggal mulai tidak boleh kurang dari hari ini`);
                return;
            }

            if (endDate <= startDate) {
                toast.error(`Tanggal selesai harus lebih besar dari tanggal mulai`);
                return;
            }

            if (contractDate > startDate) {
                toast.error(`Tanggal kontrak harus sebelum tanggal mulai`);
                return;
            }

            // Validasi nilai kontrak
            const nilaiKontrak = parseFloat(projectData.nilai_kontrak.replace(/[^0-9]/g,""));
            if (isNaN(nilaiKontrak) || nilaiKontrak <= 0) {
                toast.error(`Nilai kontrak harus berupa angka dan lebih besar dari 0`);
                return;
            }

            // Validasi lama pekerjaan
            const lamaPekerjaan = parseInt(projectData.lama_pekerjaan);
            if (isNaN(lamaPekerjaan) || lamaPekerjaan <= 0) {
                toast.error(`Lama pekerjaan harus berupa angka dan lebih besar dari 0`);
                return;
            }

            // Validasi jumlah item pekerjaan mayor
            const jumlahItem = parseInt(projectData.jumlah_item_pekerjaan_mayor);
            if (isNaN(jumlahItem) || jumlahItem <= 0) {
                toast.error(`Jumlah item pekerjaan mayor harus berupa angka dan lebih besar dari 0`);
                return;
            }

            // Validasi nomor kontrak
            const contractNumberRegex = /^[A-Za-z0-9/-]+$/;
            if (!contractNumberRegex.test(projectData.nomor_kontrak)) {
                toast.error(`Nomor kontrak hanya boleh mengandung huruf, angka, garis miring dan strip`);
                return;
            }

            // Format data sebelum dikirim
            const formattedData = {
                nama_kegiatan: projectData.nama_kegiatan.trim(),
                nama_pekerjaan: projectData.nama_pekerjaan.trim(),
                lokasi: projectData.lokasi.trim(),
                nomor_kontrak: projectData.nomor_kontrak.trim(),
                tanggal_kontrak: new Date(projectData.tanggal_kontrak).toISOString().split('T')[0],
                nilai_kontrak: nilaiKontrak,
                nama_kontraktor_pelaksana: projectData.nama_kontraktor_pelaksana.trim(),
                nama_konsultan_pengawas: projectData.nama_konsultan_pengawas.trim(),
                lama_pekerjaan: lamaPekerjaan,
                tanggal_mulai: new Date(projectData.tanggal_mulai).toISOString().split('T')[0],
                tanggal_selesai: new Date(projectData.tanggal_selesai).toISOString().split('T')[0],
                provisional_hand_over: projectData.provisional_hand_over.trim(),
                final_hand_over: projectData.final_hand_over.trim(),
                jumlah_item_pekerjaan_mayor: jumlahItem,
                status: projectData.status,
            };

            // Tambahkan log untuk debugging
            console.log('Data yang akan dikirim:', formattedData);

            const response = await axios.post(
                'http://localhost:5000/api/projects',
                formattedData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.status === 201) {
                toast.success('Proyek berhasil ditambahkan!');
                navigate('/informasi-proyek');
            }
        } catch (error: any) {
            console.error('Error detail:', error.response?.data);
            
            if (error.response?.status === 401) {
                toast.error('Sesi anda telah berakhir, silakan login kembali');
                navigate('/login');
            } else if (error.response?.status === 400) {
                const errorMessage = error.response.data.message || 'Data yang dikirim tidak valid';
                toast.error(`Error: ${errorMessage}`);
            } else if (error.response?.status === 500) {
                toast.error('Terjadi kesalahan server. Silakan coba lagi nanti.');
            } else {
                toast.error('Terjadi kesalahan. Silakan coba lagi.');
            }
        }
    };

    return (
        <Container maxWidth="md" sx={{ 
            mt: { xs: 1, sm: 2 }, 
            mb: { xs: 2, sm: 4 },
            px: { xs: 1, sm: 3 }
        }}>
            <Paper elevation={3} sx={{ 
                p: { xs: 2, sm: 3 }, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: { xs: 2, sm: 3 }
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 2
                }}>
                    <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ 
                        fontWeight: 'bold', 
                        color: 'primary.main', 
                        mb: 0,
                        textAlign: isMobile ? 'center' : 'left'
                    }}>
                        Tambah Proyek Baru
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={isMobile ? 2 : 3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nama Kegiatan"
                                name="nama_kegiatan"
                                value={projectData.nama_kegiatan}
                                onChange={handleInputChange}
                                required
                                autoFocus
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                inputProps={{
                                    maxLength: 100
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nama Pekerjaan"
                                name="nama_pekerjaan"
                                value={projectData.nama_pekerjaan}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                inputProps={{
                                    maxLength: 100
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Lokasi"
                                name="lokasi"
                                value={projectData.lokasi}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                inputProps={{
                                    maxLength: 255
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nomor Kontrak"
                                name="nomor_kontrak"
                                value={projectData.nomor_kontrak}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                helperText="Hanya huruf, angka, garis miring dan strip"
                                inputProps={{
                                    maxLength: 50
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Tanggal Kontrak"
                                name="tanggal_kontrak"
                                value={projectData.tanggal_kontrak}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nilai Kontrak"
                                name="nilai_kontrak"
                                value={projectData.nilai_kontrak}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                helperText="Masukkan angka dalam Rupiah (minimal 0)"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nama Kontraktor Pelaksana"
                                name="nama_kontraktor_pelaksana"
                                value={projectData.nama_kontraktor_pelaksana}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                inputProps={{
                                    maxLength: 100
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nama Konsultan Pengawas"
                                name="nama_konsultan_pengawas"
                                value={projectData.nama_konsultan_pengawas}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                inputProps={{
                                    maxLength: 100
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Lama Pekerjaan (Minggu)"
                                name="lama_pekerjaan"
                                value={projectData.lama_pekerjaan}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                inputProps={{ 
                                    min: "1",
                                    step: "1"
                                }}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Tanggal Mulai"
                                name="tanggal_mulai"
                                value={projectData.tanggal_mulai}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Tanggal Selesai"
                                name="tanggal_selesai"
                                value={projectData.tanggal_selesai}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Provisional Hand Over"
                                name="provisional_hand_over"
                                value={projectData.provisional_hand_over}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                inputProps={{
                                    maxLength: 50
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Final Hand Over"
                                name="final_hand_over"
                                value={projectData.final_hand_over}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                inputProps={{
                                    maxLength: 50
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Jumlah Item Pekerjaan Mayor"
                                name="jumlah_item_pekerjaan_mayor"
                                value={projectData.jumlah_item_pekerjaan_mayor}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                inputProps={{ 
                                    min: "1",
                                    step: "1"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Status"
                                name="status"
                                value={projectData.status}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sx={{ 
                            mt: 2, 
                            display: 'flex', 
                            gap: 2,
                            flexDirection: isMobile ? 'column' : 'row'
                        }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size={isMobile ? "medium" : "large"}
                                fullWidth={isMobile}
                                sx={{
                                    minWidth: isMobile ? 'auto' : '150px',
                                    borderRadius: '8px',
                                    padding: '10px 30px'
                                }}
                            >
                                Simpan
                            </Button>
                            <Button
                                variant="outlined"
                                size={isMobile ? "medium" : "large"}
                                onClick={() => navigate('/informasi-proyek')}
                                fullWidth={isMobile}
                                sx={{
                                    minWidth: isMobile ? 'auto' : '150px',
                                    borderRadius: '8px',
                                    padding: '10px 30px'
                                }}
                            >
                                Batal
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default AddProject;