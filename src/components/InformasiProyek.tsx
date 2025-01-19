import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Paper, 
    Typography, 
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    styled,
    Button,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
    Grid,
    Divider,
    Chip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const StyledContainer = styled(Container)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
        marginTop: theme.spacing(1)
    }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1)
    }
}));

// Komponen tabel hanya ditampilkan di desktop
const ResponsiveTableContainer = styled(TableContainer)(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
        display: 'none' // Sembunyikan tabel di perangkat mobile
    }
}));

// Komponen card untuk tampilan mobile
const MobileCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    display: 'none',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    [theme.breakpoints.down('md')]: {
        display: 'block'
    }
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginBottom: theme.spacing(0.5),
    fontWeight: 500
}));

const InfoValue = styled(Typography)(({ theme }) => ({
    fontSize: '1rem',
    color: theme.palette.text.primary,
    wordBreak: 'break-word'
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(2),
    whiteSpace: 'nowrap',
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontWeight: 'bold'
    }
}));

interface Project {
    id: number;
    nama_kegiatan: string;
    nama_pekerjaan: string;
    lokasi: string;
    nomor_kontrak: string;
    tanggal_kontrak: string;
    nilai_kontrak: number;
    nama_kontraktor_pelaksana: string;
    nama_konsultan_pengawas: string;
    lama_pekerjaan: number;
    tanggal_mulai: string;
    tanggal_selesai: string;
    provisional_hand_over: string;
    final_hand_over: string;
    item_pekerjaan_mayor: string;
    jumlah_item_pekerjaan_mayor: number;
    status: 'Aktif' | 'Selesai' | 'Tertunda' | 'Dibatalkan';
    created_at: string;
}

const InformasiProyek: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    toast.error('Sesi anda telah berakhir, silakan login kembali');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/projects', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setProjects(response.data);
            } catch (error: any) {
                console.error('Error fetching projects:', error);
                if (error.response?.status === 401) {
                    navigate('/login');
                    toast.error('Sesi anda telah berakhir, silakan login kembali');
                } else {
                    setError('Gagal memuat data proyek');
                    toast.error('Gagal memuat data proyek');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [navigate]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number | null) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status: Project['status']): string => {
        const colorMap: Record<string, string> = {
            'Aktif': theme.palette.success.main,
            'Selesai': theme.palette.info.main,
            'Tertunda': theme.palette.warning.main,
            'Dibatalkan': theme.palette.error.main
        };
        return colorMap[status] || theme.palette.grey[500];
    };

    const getStatusDisplay = (status: Project['status']): string => {
        return status;
    };

    // Komponen untuk tampilan mobile
    const renderMobileView = (project: Project) => (
        <MobileCard key={project.id}>
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            mb: 1,
                            flex: 1,
                            pr: 2
                        }}>
                            {project.nama_kegiatan}
                        </Typography>
                        <Chip
                            label={getStatusDisplay(project.status)}
                            sx={{
                                backgroundColor: getStatusColor(project.status),
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                            }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.nama_pekerjaan}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <InfoLabel>Lokasi</InfoLabel>
                        <InfoValue>{project.lokasi}</InfoValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoLabel>No. Kontrak</InfoLabel>
                        <InfoValue>{project.nomor_kontrak}</InfoValue>
                    </Grid>
                    <Grid item xs={12}>
                        <InfoLabel>Nilai Kontrak</InfoLabel>
                        <InfoValue sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                            {formatCurrency(project.nilai_kontrak)}
                        </InfoValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoLabel>Kontraktor Pelaksana</InfoLabel>
                        <InfoValue>{project.nama_kontraktor_pelaksana}</InfoValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoLabel>Konsultan Pengawas</InfoLabel>
                        <InfoValue>{project.nama_konsultan_pengawas}</InfoValue>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <InfoLabel>Tanggal Mulai</InfoLabel>
                        <InfoValue>{formatDate(project.tanggal_mulai)}</InfoValue>
                    </Grid>
                    <Grid item xs={6}>
                        <InfoLabel>Tanggal Selesai</InfoLabel>
                        <InfoValue>{formatDate(project.tanggal_selesai)}</InfoValue>
                    </Grid>
                    <Grid item xs={6}>
                        <InfoLabel>Lama Pekerjaan</InfoLabel>
                        <InfoValue>{project.lama_pekerjaan} Minggu</InfoValue>
                    </Grid>
                    <Grid item xs={6}>
                        <InfoLabel>Item Pekerjaan Mayor</InfoLabel>
                        <InfoValue>{project.jumlah_item_pekerjaan_mayor}</InfoValue>
                    </Grid>
                </Grid>

            </CardContent>
        </MobileCard>
    );

    return (
        <StyledContainer maxWidth="xl">
            <StyledPaper elevation={0}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: 2,
                    mb: 4 
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <InfoIcon sx={{ fontSize: isMobile ? 28 : 36, color: 'primary.main' }} />
                        <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
                            color: 'primary.main', 
                            fontWeight: 'bold',
                            lineHeight: 1.2
                        }}>
                            Informasi Proyek
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                        <Button 
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate('/dashboard')}
                            startIcon={<ArrowBackIcon />}
                            size={isMobile ? "small" : "medium"}
                            fullWidth={isMobile}
                        >
                            Kembali
                        </Button>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => navigate('/add-project')}
                            startIcon={<AddIcon />}
                            size={isMobile ? "small" : "medium"}
                            fullWidth={isMobile}
                        >
                            Tambah Proyek
                        </Button>
                    </Box>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : error ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        p: 4,
                        backgroundColor: theme.palette.error.light,
                        borderRadius: 2
                    }}>
                        <Typography variant="h6" color="error">
                            {error}
                        </Typography>
                    </Box>
                ) : projects.length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        p: 4,
                        backgroundColor: theme.palette.grey[100],
                        borderRadius: 2
                    }}>
                        <Typography variant="h6" color="text.secondary">
                            Belum ada proyek yang ditambahkan
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Mobile View */}
                        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                            {projects.map(renderMobileView)}
                        </Box>

                        {/* Desktop View */}
                        <ResponsiveTableContainer>
                            <Table sx={{ minWidth: 1200 }}>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Nama Kegiatan</StyledTableCell>
                                        <StyledTableCell>Nama Pekerjaan</StyledTableCell>
                                        <StyledTableCell>Lokasi</StyledTableCell>
                                        <StyledTableCell>No. Kontrak</StyledTableCell>
                                        <StyledTableCell>Tanggal Kontrak</StyledTableCell>
                                        <StyledTableCell>Nilai Kontrak</StyledTableCell>
                                        <StyledTableCell>Kontraktor Pelaksana</StyledTableCell>
                                        <StyledTableCell>Konsultan Pengawas</StyledTableCell>
                                        <StyledTableCell>Lama Pekerjaan</StyledTableCell>
                                        <StyledTableCell>Tanggal Mulai</StyledTableCell>
                                        <StyledTableCell>Tanggal Selesai</StyledTableCell>
                                        <StyledTableCell>Provisional Hand Over</StyledTableCell>
                                        <StyledTableCell>Final Hand Over</StyledTableCell>
                                        <StyledTableCell>Item Pekerjaan Mayor</StyledTableCell>
                                        <StyledTableCell>Jumlah Item Pekerjaan Mayor</StyledTableCell>
                                        <StyledTableCell>Status</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projects.map((project) => (
                                        <TableRow 
                                            key={project.id}
                                            sx={{ 
                                                '&:nth-of-type(odd)': {
                                                    backgroundColor: theme.palette.action.hover
                                                }
                                            }}
                                        >
                                            <StyledTableCell>{project.nama_kegiatan}</StyledTableCell>
                                            <StyledTableCell>{project.nama_pekerjaan}</StyledTableCell>
                                            <StyledTableCell>{project.lokasi}</StyledTableCell>
                                            <StyledTableCell>{project.nomor_kontrak}</StyledTableCell>
                                            <StyledTableCell>{formatDate(project.tanggal_kontrak)}</StyledTableCell>
                                            <StyledTableCell>{formatCurrency(project.nilai_kontrak)}</StyledTableCell>
                                            <StyledTableCell>{project.nama_kontraktor_pelaksana}</StyledTableCell>
                                            <StyledTableCell>{project.nama_konsultan_pengawas}</StyledTableCell>
                                            <StyledTableCell>{project.lama_pekerjaan} Minggu</StyledTableCell>
                                            <StyledTableCell>{formatDate(project.tanggal_mulai)}</StyledTableCell>
                                            <StyledTableCell>{formatDate(project.tanggal_selesai)}</StyledTableCell>
                                            <StyledTableCell>{project.provisional_hand_over || '-'}</StyledTableCell>
                                            <StyledTableCell>{project.final_hand_over || '-'}</StyledTableCell>
                                            <StyledTableCell>{project.item_pekerjaan_mayor}</StyledTableCell>
                                            <StyledTableCell align="center">{project.jumlah_item_pekerjaan_mayor}</StyledTableCell>
                                            <StyledTableCell>
                                                <Box
                                                    sx={{
                                                        backgroundColor: getStatusColor(project.status),
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        display: 'inline-block',
                                                        fontWeight: 'medium',
                                                        textAlign: 'center',
                                                        minWidth: '100px',
                                                        fontSize: '0.875rem',
                                                        boxShadow: `0 2px 4px ${getStatusColor(project.status)}40`
                                                    }}
                                                >
                                                    {getStatusDisplay(project.status)}
                                                </Box>
                                            </StyledTableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ResponsiveTableContainer>
                    </>
                )}
            </StyledPaper>
        </StyledContainer>
    );
};

export default InformasiProyek;
