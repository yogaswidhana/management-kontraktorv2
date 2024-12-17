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

const ReportMethod: React.FC = () => {
    const [methodData, setMethodData] = useState({
        metodePekerjaan: '',
        deskripsi: '',
        peralatan: '',
        tenagaKerja: '',
        waktuPelaksanaan: '',
        catatan: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Data Metode Terkirim:', methodData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMethodData(prev => ({
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
                        Laporan Metode Kerja
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                    <FormGroup>
                        <TextField
                            fullWidth
                            label="Metode Pekerjaan"
                            name="metodePekerjaan"
                            value={methodData.metodePekerjaan}
                            onChange={handleChange}
                            placeholder="Masukkan metode pekerjaan"
                            required
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            multiline
                            rows={1}
                            label="Deskripsi"
                            name="deskripsi"
                            value={methodData.deskripsi}
                            onChange={handleChange}
                            placeholder="Masukkan deskripsi metode"
                            required
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            multiline
                            rows={1}
                            label="Peralatan"
                            name="peralatan"
                            value={methodData.peralatan}
                            onChange={handleChange}
                            placeholder="Masukkan daftar peralatan"
                            required
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            multiline
                            rows={1}
                            label="Tenaga Kerja"
                            name="tenagaKerja"
                            value={methodData.tenagaKerja}
                            onChange={handleChange}
                            placeholder="Masukkan kebutuhan tenaga kerja"
                            required
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            label="Waktu Pelaksanaan"
                            name="waktuPelaksanaan"
                            value={methodData.waktuPelaksanaan}
                            onChange={handleChange}
                            placeholder="Masukkan estimasi waktu"
                            required
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            multiline
                            rows={1}
                            label="Catatan"
                            name="catatan"
                            value={methodData.catatan}
                            onChange={handleChange}
                            placeholder="Tambahkan catatan jika ada"
                            sx={{ mb: 3 }}
                        />
                    </FormGroup>

                    <Button 
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ 
                            mt: 2,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        Kirim Laporan
                    </Button>
                </Box>
            </StyledPaper>
        </StyledContainer>
    );
};

export default ReportMethod;