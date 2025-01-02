import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, styled, CircularProgress, useTheme, useMediaQuery, Card, CardContent, Grid, LinearProgress } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
    jumlah_item_pekerjaan_mayor: number;
    status: string;
}

interface ProjectProgress {
    id: number;
    project_id: number;
    item_pekerjaan: string;
    nama_item_pekerjaan: string;
    volume_pekerjaan: number;
    satuan_pekerjaan: string;
    harga_satuan: number;
    rencana_waktu_kerja: number;
    minggu: string;
    progress: number;
    update_date: string;
}

const StyledContainer = styled(Container)`
    padding: ${({ theme }) => theme.spacing(2)};
    margin-top: ${({ theme }) => theme.spacing(2)};
    margin-bottom: ${({ theme }) => theme.spacing(4)};

    ${({ theme }) => theme.breakpoints.down('sm')} {
        padding: ${({ theme }) => theme.spacing(1)};
        margin-top: ${({ theme }) => theme.spacing(1)};
    }
`;

const StyledPaper = styled(Paper)`
    padding: ${({ theme }) => theme.spacing(3)};
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    background: #ffffff;

    ${({ theme }) => theme.breakpoints.down('sm')} {
        padding: ${({ theme }) => theme.spacing(2)};
    }
`;

const StyledCard = styled(Card)`
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: #ffffff;
`;

const Progress: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectProgress, setProjectProgress] = useState<{ [key: number]: ProjectProgress[] }>({});
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchProgressData = async (token: string, projectId: number) => {
        try {
            const progressResponse = await axios.get<ProjectProgress[]>(
                `http://localhost:5000/api/project-progress/${projectId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (progressResponse.data && Array.isArray(progressResponse.data)) {
                return progressResponse.data.map(item => ({
                    ...item,
                    minggu: item.minggu || 'Minggu 1',
                    progress: typeof item.progress === 'number' ? item.progress : 0
                }));
            }
            return [];
        } catch (error: any) {
            if (error.response?.status !== 404) {
                console.error(`Error fetching progress for project ${projectId}:`, error);
            }
            return [];
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    toast('Sesi anda telah berakhir, silakan login kembali', {
                        icon: '❌'
                    });
                    return;
                }

                const projectsResponse = await axios.get<Project[]>('http://localhost:5000/api/projects', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const projectsData = projectsResponse.data;
                setProjects(projectsData);

                const progressData: { [key: number]: ProjectProgress[] } = {};
                
                for (const project of projectsData) {
                    const progress = await fetchProgressData(token, project.id);
                    progressData[project.id] = progress;
                }
                
                setProjectProgress(progressData);

            } catch (error: any) {
                console.error('Error fetching data:', error);
                if (error.response?.status === 401) {
                    navigate('/login');
                    toast('Sesi anda telah berakhir, silakan login kembali', {
                        icon: '❌'
                    });
                } else {
                    toast('Gagal memuat data', { 
                        icon: '❌'
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const interval = setInterval(() => {
            fetchData();
        }, 30000);

        return () => clearInterval(interval);
    }, [navigate]);

    const handleDetailClick = (projectId: number) => {
        navigate(`/progress-detail/${projectId}`);
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                backgroundColor: '#f5f5f5'
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <StyledContainer maxWidth="lg">
            <StyledPaper>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1, sm: 2 }, 
                    mb: { xs: 3, sm: 4 },
                    flexWrap: 'wrap',
                    borderBottom: '2px solid #eee',
                    paddingBottom: 2
                }}>
                    <AssignmentIcon sx={{ 
                        fontSize: { xs: 28, sm: 36 }, 
                        color: 'primary.main' 
                    }} />
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
                        color: 'primary.main', 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.75rem', sm: '2.25rem' }
                    }}>
                        Progress Proyek
                    </Typography>
                </Box>

                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: { xs: 3, sm: 4 }
                }}>
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
                </Box>

                {projects.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center',
                        py: 4,
                        backgroundColor: '#f9f9f9',
                        borderRadius: 2
                    }}>
                        <Typography variant="h6" color="text.secondary">
                            Tidak ada proyek yang tersedia
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {projects.map((project) => (
                            <Grid item xs={12} sm={6} md={6} key={project.id}>
                                <StyledCard>
                                    <CardContent>
                                        <Typography 
                                            variant={isMobile ? "h6" : "h5"} 
                                            sx={{ 
                                                mb: 2,
                                                fontWeight: 'bold',
                                                color: 'primary.dark'
                                            }}
                                        >
                                            {project.nama_kegiatan}
                                        </Typography>

                                        {(projectProgress[project.id] || []).map((progress) => (
                                            <Box key={progress.id} sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                                    {progress.nama_item_pekerjaan}
                                                </Typography>
                                                
                                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Volume: {Number(progress.volume_pekerjaan).toFixed(2)} {progress.satuan_pekerjaan}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Minggu: {progress.minggu}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" color="text.secondary" sx={{
                                                            display: 'flex',
                                                            flexDirection: isMobile ? 'column' : 'row',
                                                            alignItems: isMobile ? 'flex-start' : 'center',
                                                            gap: 0.5
                                                        }}>
                                                            <span style={{ fontWeight: 500 }}>Harga Satuan:</span>
                                                            <span style={{ 
                                                                fontFamily: 'monospace',
                                                                fontSize: '0.875rem',
                                                                color: '#2196f3'
                                                            }}>
                                                                Rp {new Intl.NumberFormat('id-ID', {
                                                                    style: 'decimal',
                                                                    minimumFractionDigits: 0,
                                                                    maximumFractionDigits: 0
                                                                }).format(progress.harga_satuan)}
                                                            </span>
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Rencana Waktu: {progress.rencana_waktu_kerja} Minggu
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Update Terakhir: {new Date(progress.update_date).toLocaleDateString('id-ID')}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>

                                                <Box sx={{ mt: 1 }}>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={progress.progress}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 4,
                                                            backgroundColor: '#e0e0e0',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: progress.progress >= 80 ? '#4caf50' : 
                                                                                progress.progress >= 50 ? '#ff9800' : '#f44336',
                                                            }
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
                                                        {progress.progress}%
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}

                                        {(!projectProgress[project.id] || projectProgress[project.id].length === 0) && (
                                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                                <Typography color="text.secondary">
                                                    Belum ada data progress
                                                </Typography>
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                            <Button 
                                                variant="contained"
                                                onClick={() => handleDetailClick(project.id)}
                                                size={isMobile ? "small" : "medium"}
                                                sx={{
                                                    borderRadius: '8px',
                                                    textTransform: 'none',
                                                    fontWeight: 'medium'
                                                }}
                                            >
                                                Detail Progress
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </StyledPaper>
        </StyledContainer>
    );
};

export default Progress;