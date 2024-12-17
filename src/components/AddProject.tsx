import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Grid, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AddProject = () => {
    const navigate = useNavigate();
    const [projectData, setProjectData] = useState({
        name: '',
        contract_number: '',
        contractor_name: '',
        description: '',
        location: '',
        volume: '',
        start_date: '',
        end_date: '', 
        budget: '',
        status: 'Aktif' as 'Aktif' | 'Selesai' | 'Tertunda' | 'Dibatalkan'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProjectData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi input
        if (!projectData.name || !projectData.contract_number || !projectData.contractor_name || 
            !projectData.start_date || !projectData.end_date || !projectData.budget || !projectData.location) {
            toast('Field wajib harus diisi', {
                icon: '❌'
            });
            return;
        }

        // Validasi tanggal
        const startDate = new Date(projectData.start_date);
        const endDate = new Date(projectData.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            toast('Tanggal mulai tidak boleh kurang dari hari ini', {
                icon: '❌'
            });
            return;
        }

        if (endDate <= startDate) {
            toast('Tanggal selesai harus lebih besar dari tanggal mulai', {
                icon: '❌'
            });
            return;
        }

        // Validasi budget
        const budget = parseFloat(projectData.budget);
        if (isNaN(budget) || budget <= 0) {
            toast('Anggaran harus berupa angka dan lebih besar dari 0', {
                icon: '❌'
            });
            return;
        }

        // Validasi volume
        const volume = parseFloat(projectData.volume);
        if (projectData.volume && (isNaN(volume) || volume <= 0)) {
            toast('Volume harus berupa angka dan lebih besar dari 0', {
                icon: '❌'
            });
            return;
        }

        // Validasi nomor kontrak
        const contractNumberRegex = /^[A-Za-z0-9/-]+$/;
        if (!contractNumberRegex.test(projectData.contract_number)) {
            toast('Nomor kontrak hanya boleh mengandung huruf, angka, garis miring dan strip', {
                icon: '❌'
            });
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/projects', 
                {
                    ...projectData,
                    budget: budget,
                    volume: volume || null
                }
            );

            if (response.status === 201) {
                toast('Proyek berhasil ditambahkan!', {
                    icon: '✅'
                });
                navigate('/informasi-proyek');
            }
        } catch (error: any) {
            console.error('Error:', error);
            if (error.response) {
                toast(error.response.data.message || 'Gagal menambahkan proyek. Silakan coba lagi.', {
                    icon: '❌'
                });
            } else {
                toast('Terjadi kesalahan jaringan. Silakan coba lagi.', {
                    icon: '❌'
                });
            }
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0 }}>
                        Tambah Proyek Baru
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nama Proyek"
                                name="name"
                                value={projectData.name}
                                onChange={handleInputChange}
                                required
                                autoFocus
                                variant="outlined"
                                inputProps={{
                                    maxLength: 100
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nomor Kontrak"
                                name="contract_number"
                                value={projectData.contract_number}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                helperText="Hanya huruf, angka, garis miring dan strip"
                                inputProps={{
                                    maxLength: 50,
                                    pattern: "[A-Za-z0-9/-]+"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nama Kontraktor"
                                name="contractor_name"
                                value={projectData.contractor_name}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                inputProps={{
                                    maxLength: 100
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Deskripsi"
                                name="description"
                                value={projectData.description}
                                onChange={handleInputChange}
                                multiline
                                rows={2}
                                variant="outlined"
                                inputProps={{
                                    maxLength: 500
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Lokasi"
                                name="location"
                                value={projectData.location}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                inputProps={{
                                    maxLength: 255
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Volume"
                                name="volume"
                                value={projectData.volume}
                                onChange={handleInputChange}
                                variant="outlined"
                                inputProps={{ 
                                    step: "0.01",
                                    min: "0"
                                }}
                                helperText="Opsional - Masukkan angka lebih dari 0"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Tanggal Mulai"
                                name="start_date"
                                value={projectData.start_date}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    min: new Date().toISOString().split('T')[0]
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Tanggal Selesai"
                                name="end_date"
                                value={projectData.end_date}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    min: projectData.start_date || new Date().toISOString().split('T')[0]
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Anggaran"
                                name="budget"
                                value={projectData.budget}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                inputProps={{ 
                                    min: "0",
                                    step: "1000"
                                }}
                                helperText="Masukkan angka dalam Rupiah (minimal 0)"
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                            >
                                Simpan
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/informasi-proyek')}
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
