import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Grid } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

const ReportDimensions: React.FC = () => {
    const [dimensionData, setDimensionData] = useState({
        panjang: '',
        lebar: '',
        tinggi: '',
        lokasi: '',
        catatan: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Implementasi logika pengiriman data ke server
            const response = await fetch('/api/dimensions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dimensionData)
            });

            if (!response.ok) {
                throw new Error('Gagal mengirim data');
            }

            alert('Data berhasil disimpan!');
            setDimensionData({
                panjang: '',
                lebar: '',
                tinggi: '',
                lokasi: '',
                catatan: ''
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menyimpan data');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDimensionData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                    <AssignmentIcon sx={{ mr: 1, fontSize: 30 }} />
                    <Typography variant="h5" gutterBottom align="center">
                        Laporan Dimensi
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Panjang (meter)"
                                name="panjang"
                                value={dimensionData.panjang}
                                onChange={handleChange}
                                placeholder="Masukkan panjang"
                                required
                                variant="outlined"
                                inputProps={{ min: 0, step: "0.01" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Lebar (meter)"
                                name="lebar"
                                value={dimensionData.lebar}
                                onChange={handleChange}
                                placeholder="Masukkan lebar"
                                required
                                variant="outlined"
                                inputProps={{ min: 0, step: "0.01" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Tinggi (meter)"
                                name="tinggi"
                                value={dimensionData.tinggi}
                                onChange={handleChange}
                                placeholder="Masukkan tinggi"
                                required
                                variant="outlined"
                                inputProps={{ min: 0, step: "0.01" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Lokasi"
                                name="lokasi"
                                value={dimensionData.lokasi}
                                onChange={handleChange}
                                placeholder="Masukkan lokasi pengukuran"
                                required
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={1}
                                label="Catatan"
                                name="catatan"
                                value={dimensionData.catatan}
                                onChange={handleChange}
                                placeholder="Tambahkan catatan jika ada"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{ mt: 2 }}
                                startIcon={<AssignmentIcon />}
                            >
                                Kirim Laporan
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default ReportDimensions;