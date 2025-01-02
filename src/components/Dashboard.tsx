import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

interface DashboardProps {
    role: string;
}

// Styling yang responsif untuk card
const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    borderRadius: '12px',
    background: '#fff',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    },
    [theme.breakpoints.down('sm')]: {
        margin: '8px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
    flexGrow: 1,
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    [theme.breakpoints.down('sm')]: {
        padding: '1.25rem',
        gap: '0.5rem'
    }
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
    padding: '1.25rem',
    paddingTop: 0,
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
        padding: '1rem',
        paddingTop: 0
    }
}));

const StyledButton = styled(Button)<{ component?: React.ElementType; to?: string }>(({ theme }) => ({
    background: 'var(--primary-color)',
    color: '#fff',
    padding: '0.625rem 1.75rem',
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    '&:hover': {
        background: 'var(--secondary-color)',
        transform: 'translateY(-2px)',
        transition: 'all 0.2s ease-in-out'
    },
    [theme.breakpoints.down('sm')]: {
        width: '100%',
        padding: '0.75rem',
        fontSize: '0.875rem'
    }
}));

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
    return (
        <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: { xs: 2, sm: 4 } }}>
                <Typography 
                    variant="h4" 
                    sx={{
                        fontWeight: 600,
                        color: 'var(--primary-color)',
                        borderBottom: '3px solid var(--primary-color)',
                        display: 'inline-block',
                        pb: 1,
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                >
                    Dashboard
                </Typography>
            </Box>
            
            <Grid container spacing={{ xs: 2, sm: 3 }}>
                {role === 'contractor' && (
                    <>
                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Info Proyek
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Akses informasi dan pengisian data umum proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/informasi-proyek">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Progres
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat detail progres pekerjaan.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/progress">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Lapor Dimensi
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Isi laporan dimensi proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/dimensions">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Lapor Pemadatan
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Isi laporan pemadatan proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/lapor-pemadatan">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Lapor Metode Kerja
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Isi laporan metode kerja proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/lapor-metode-kerja">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Hasil Perkiraan Derajat Kepadatan
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil perkiraan derajat kepadatan.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/hasil-perkiraan-kepadatan">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Hasil Penilaian Kesesuaian Metode Kerja
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil penilaian kesesuaian metode kerja.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/hasil-penilaian-kesesuaian">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>
                    </>
                )}

                {role === 'consultant' && (
                    <>
                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Info Proyek
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Akses informasi proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/informasi-proyek">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Progres
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat detail progres pekerjaan.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/progress">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Periksa Pelaporan Dimensi
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Periksa laporan dimensi proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/periksa-dimensi">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Periksa Pelaporan Pemadatan
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Periksa laporan pemadatan proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/periksa-pemadatan">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Periksa Pelaporan Metode Kerja
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Periksa laporan metode kerja proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/periksa-metode-kerja">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Hasil Perkiraan Derajat Kepadatan
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil perkiraan derajat kepadatan.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/hasil-perkiraan-kepadatan">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Hasil Penilaian Kesesuaian Metode Kerja
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil penilaian kesesuaian metode kerja.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/hasil-penilaian-kesesuaian">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>
                    </>
                )}

                {role === 'owner' && (
                    <>
                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Info Proyek
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Akses informasi proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/projects">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Progres
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat detail progres pekerjaan.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/progress">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Persetujuan Pelaporan Dimensi
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Setujui laporan dimensi proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/persetujuan-dimensi">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Persetujuan Pelaporan Pemadatan
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Setujui laporan pemadatan proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/persetujuan-pemadatan">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Persetujuan Pelaporan Metode Kerja
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Setujui laporan metode kerja proyek.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/persetujuan-metode">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Hasil Perkiraan Derajat Kepadatan
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil perkiraan derajat kepadatan.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/hasil-perkiraan-kepadatan">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StyledCard>
                                <StyledCardContent>
                                    <Typography variant="h5" gutterBottom sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}>
                                        Hasil Penilaian Kesesuaian Metode Kerja
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil penilaian kesesuaian metode kerja.
                                    </Typography>
                                </StyledCardContent>
                                <StyledCardActions>
                                    <StyledButton component={Link} to="/hasil-penilaian-kesesuaian">
                                        Akses
                                    </StyledButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>
                    </>
                )}
            </Grid>
        </Container>
    );
};

export default Dashboard;