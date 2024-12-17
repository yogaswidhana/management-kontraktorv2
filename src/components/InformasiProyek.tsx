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
    CircularProgress
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const StyledContainer = styled(Container)`
    padding: 2rem;
    margin-top: 2rem;
`;

const StyledPaper = styled(Paper)`
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

interface Project {
    id: number;
    name: string;
    contract_number: string;
    contractor_name: string;
    description: string | null;
    location: string | null;
    volume: number | null;
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    status: 'Aktif' | 'Selesai' | 'Tertunda' | 'Dibatalkan';
    created_at: string;
}

const InformasiProyek: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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

                const response = await axios.get('http://localhost:3000/api/projects', {
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

    const handleRowClick = (projectId: number) => {
        navigate(`/project-detail/${projectId}`);
    };

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

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'Aktif':
                return 'success.light';
            case 'Selesai':
                return 'primary.light';
            case 'Tertunda':
                return 'warning.light';
            case 'Dibatalkan':
                return 'error.light';
            default:
                return 'grey.500';
        }
    };

    return (
        <StyledContainer maxWidth="lg">
            <StyledPaper>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <InfoIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            Informasi Proyek
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => navigate('/add-project')}
                        startIcon={<InfoIcon />}
                    >
                        Tambah Proyek Baru
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Typography variant="h6" color="error">
                            {error}
                        </Typography>
                    </Box>
                ) : projects.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Typography variant="h6" color="text.secondary">
                            Belum ada proyek yang ditambahkan
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nama Proyek</TableCell>
                                    <TableCell>No. Kontrak</TableCell>
                                    <TableCell>Kontraktor</TableCell>
                                    <TableCell>Lokasi</TableCell>
                                    <TableCell>Volume</TableCell>
                                    <TableCell>Tanggal Mulai</TableCell>
                                    <TableCell>Tanggal Selesai</TableCell>
                                    <TableCell>Anggaran</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow 
                                        key={project.id}
                                        hover
                                        onClick={() => handleRowClick(project.id)}
                                        sx={{ 
                                            '&:hover': { 
                                                cursor: 'pointer', 
                                                backgroundColor: 'action.hover',
                                                transition: 'all 0.2s ease'
                                            } 
                                        }}
                                    >
                                        <TableCell>{project.name}</TableCell>
                                        <TableCell>{project.contract_number}</TableCell>
                                        <TableCell>{project.contractor_name}</TableCell>
                                        <TableCell>{project.location || '-'}</TableCell>
                                        <TableCell>{project.volume || '-'}</TableCell>
                                        <TableCell>{formatDate(project.start_date)}</TableCell>
                                        <TableCell>{formatDate(project.end_date)}</TableCell>
                                        <TableCell>{formatCurrency(project.budget)}</TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    backgroundColor: getStatusColor(project.status),
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '16px',
                                                    display: 'inline-block',
                                                    fontWeight: 'medium',
                                                    textAlign: 'center',
                                                    minWidth: '80px',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {project.status}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </StyledPaper>
        </StyledContainer>
    );
};

export default InformasiProyek;
