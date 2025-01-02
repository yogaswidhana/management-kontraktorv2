import React, { useState } from 'react';
import { Box, Container, Paper, Typography, TextField, Button, styled } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

const StyledContainer = styled(Container)`
    padding: 2rem;
    margin-top: 2rem;
`;

const StyledPaper = styled(Paper)`
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled(Box)`
    margin: 1rem 0;
`;

const DensityEstimation: React.FC = () => {
    const [densityData, setDensityData] = useState({
        lokasi: '',
        tanggal: '',
        kepadatanTanah: '',
        metodePengukuran: '',
        catatan: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/density-estimation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(densityData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengirim data');
            }

            await response.json();
            alert('Data berhasil disimpan');
            setDensityData({
                lokasi: '',
                tanggal: '',
                kepadatanTanah: '',
                metodePengukuran: '', 
                catatan: ''
            });
        } catch (error) {
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDensityData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <StyledContainer maxWidth="md">
            <StyledPaper>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <AssignmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        Perkiraan Kepadatan Tanah
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <FormGroup>
                        <TextField
                            fullWidth
                            label="Lokasi"
                            name="lokasi" 
                            value={densityData.lokasi}
                            onChange={handleChange}
                            placeholder="Masukkan lokasi pengukuran"
                            required
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            type="date"
                            label="Tanggal"
                            name="tanggal"
                            value={densityData.tanggal}
                            onChange={handleChange}
                            required
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            type="number"
                            label="Kepadatan Tanah (%)"
                            name="kepadatanTanah"
                            value={densityData.kepadatanTanah}
                            onChange={handleChange}
                            placeholder="Masukkan persentase kepadatan"
                            required
                            inputProps={{ 
                                min: 0,
                                max: 100,
                                step: "0.1"
                            }}
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            label="Metode Pengukuran"
                            name="metodePengukuran"
                            value={densityData.metodePengukuran}
                            onChange={handleChange}
                            placeholder="Masukkan metode pengukuran"
                            required
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Catatan"
                            name="catatan"
                            value={densityData.catatan}
                            onChange={handleChange}
                            placeholder="Tambahkan catatan jika ada"
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                    >
                        Kirim Laporan
                    </Button>
                </Box>
            </StyledPaper>
        </StyledContainer>
    );
};

export default DensityEstimation;