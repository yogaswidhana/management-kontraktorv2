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

const ReportCompaction: React.FC = () => {
    const [compactionData, setCompactionData] = useState({
        lokasi: '',
        tanggal: '',
        metodePemadatan: '',
        jumlahLintasan: '',
        kepadatanTanah: '',
        catatan: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Data Pemadatan Terkirim:', compactionData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompactionData(prev => ({
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
                        Laporan Pemadatan
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                    <FormGroup>
                        <TextField
                            fullWidth
                            label="Lokasi"
                            name="lokasi"
                            value={compactionData.lokasi}
                            onChange={handleChange}
                            placeholder="Masukkan lokasi pemadatan"
                            required
                            size="small"
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            type="date"
                            label="Tanggal"
                            name="tanggal"
                            value={compactionData.tanggal}
                            onChange={handleChange}
                            required
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            label="Metode Pemadatan"
                            name="metodePemadatan"
                            value={compactionData.metodePemadatan}
                            onChange={handleChange}
                            placeholder="Masukkan metode pemadatan"
                            required
                            size="small"
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            type="number"
                            label="Jumlah Lintasan"
                            name="jumlahLintasan"
                            value={compactionData.jumlahLintasan}
                            onChange={handleChange}
                            placeholder="Masukkan jumlah lintasan"
                            required
                            size="small"
                            sx={{ mb: 2 }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <TextField
                            fullWidth
                            type="number"
                            label="Kepadatan Tanah (%)"
                            name="kepadatanTanah"
                            value={compactionData.kepadatanTanah}
                            onChange={handleChange}
                            placeholder="Masukkan persentase kepadatan"
                            required
                            size="small"
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
                            value={compactionData.catatan}
                            onChange={handleChange}
                            placeholder="Tambahkan catatan jika ada"
                            size="small"
                            sx={{ mb: 3 }}
                        />
                    </FormGroup>

                    <Box sx={{ textAlign: 'right' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                borderRadius: '8px',
                                padding: '8px 24px'
                            }}
                        >
                            Kirim Laporan
                        </Button>
                    </Box>
                </Box>
            </StyledPaper>
        </StyledContainer>
    );
};

export default ReportCompaction;