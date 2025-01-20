import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, styled, CircularProgress, useTheme, useMediaQuery, Card, CardContent, Grid, LinearProgress, FormControl, Select, MenuItem } from '@mui/material';
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
    nilai_total?: number;
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
    overflow: visible;
`;

const Progress: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectProgress, setProjectProgress] = useState<{ [key: number]: ProjectProgress[] }>({});
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedItems, setSelectedItems] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const resizeHandler = () => {
            const resizeObserver = new ResizeObserver((entries) => {
                // Wrap in requestAnimationFrame to avoid loop limit exceeded error
                window.requestAnimationFrame(() => {
                    if (!Array.isArray(entries) || !entries.length) {
                        return;
                    }
                    // Handle resize logic here if needed
                });
            });

            const elements = document.querySelectorAll('.MuiPaper-root');
            elements.forEach((element) => {
                try {
                    resizeObserver.observe(element);
                } catch (error) {
                    console.error('ResizeObserver error:', error);
                }
            });

            return () => {
                try {
                    resizeObserver.disconnect();
                } catch (error) {
                    console.error('Error disconnecting ResizeObserver:', error);
                }
            };
        };

        const cleanup = resizeHandler();
        return () => {
            if (cleanup) {
                cleanup();
            }
        };
    }, []);

    // Handle ResizeObserver error globally
    useEffect(() => {
        const errorHandler = (event: ErrorEvent) => {
            if (event.message === 'ResizeObserver loop limit exceeded' || 
                event.message === 'ResizeObserver loop completed with undelivered notifications.') {
                event.stopPropagation();
                event.preventDefault();
            }
        };

        window.addEventListener('error', errorHandler);
        return () => window.removeEventListener('error', errorHandler);
    }, []);

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
        let isMounted = true;

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

                if (!isMounted) return;

                const projectsData = projectsResponse.data;
                setProjects(projectsData);

                const progressData: { [key: number]: ProjectProgress[] } = {};
                const initialSelectedItems: { [key: number]: string } = {};
                
                for (const project of projectsData) {
                    if (!isMounted) return;
                    const progress = await fetchProgressData(token, project.id);
                    progressData[project.id] = progress;
                    if (progress.length > 0) {
                        initialSelectedItems[project.id] = progress[0].nama_item_pekerjaan;
                    }
                }
                
                if (isMounted) {
                    setProjectProgress(progressData);
                    setSelectedItems(initialSelectedItems);
                    setLoading(false);
                }

            } catch (error: any) {
                if (!isMounted) return;
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
                setLoading(false);
            }
        };

        fetchData();

        const interval = setInterval(() => {
            if (isMounted) {
                fetchData();
            }
        }, 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [navigate]);

    const handleDetailClick = (projectId: number) => {
        navigate(`/progress-detail/${projectId}`);
    };

    const calculateTotalNilai = (progressItems: ProjectProgress[]) => {
        return progressItems.reduce((total, item) => {
            const nilaiItem = item.volume_pekerjaan * item.harga_satuan;
            return total + nilaiItem;
        }, 0);
    };

    const handleItemChange = (projectId: number, value: string) => {
        setSelectedItems(prev => ({
            ...prev,
            [projectId]: value
        }));
    };

    const calculateProgress = (progress: ProjectProgress) => {
        const nilaiTotalItem = progress.volume_pekerjaan * progress.harga_satuan;
        
        const volumeTercapai = (progress.progress / 100) * progress.volume_pekerjaan;
        const nilaiTercapai = volumeTercapai * progress.harga_satuan;
        
        const progressPercentage = (nilaiTercapai / nilaiTotalItem) * 100;

        return {
            totalNilai: nilaiTotalItem,
            nilaiTercapai: nilaiTercapai,
            progressPercentage: Number(progressPercentage.toFixed(2))
        };
    };

    // Tambahkan fungsi untuk menghitung total progress
    const calculateTotalProgress = (progressItems: ProjectProgress[]) => {
        let totalProgress = 0;
        progressItems.forEach(item => {
            totalProgress += item.progress || 0;
        });
        return Number(totalProgress.toFixed(2));
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
                        Rencana Pekerjaan
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
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                            flexWrap: 'wrap',
                                            gap: 2
                                        }}>
                                            <Typography 
                                                variant={isMobile ? "h6" : "h5"} 
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    color: 'primary.dark',
                                                    flex: 1
                                                }}
                                            >
                                                {project.nama_kegiatan}
                                            </Typography>

                                            <FormControl 
                                                size="small" 
                                                sx={{ 
                                                    minWidth: 200,
                                                    backgroundColor: '#fff'
                                                }}
                                            >
                                                <Select
                                                    value={selectedItems[project.id] || ''}
                                                    onChange={(e) => handleItemChange(project.id, e.target.value)}
                                                    displayEmpty
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 300
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="" disabled>
                                                        Pilih Item Pekerjaan
                                                    </MenuItem>
                                                    {(projectProgress[project.id] || []).map((item) => (
                                                        <MenuItem key={item.id} value={item.nama_item_pekerjaan}>
                                                            {item.nama_item_pekerjaan}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>

                                        {projectProgress[project.id]?.length > 0 && (
                                            <Box sx={{ 
                                                mb: 2, 
                                                p: 2, 
                                                bgcolor: '#e3f2fd', 
                                                borderRadius: 2,
                                                border: '1px solid #90caf9'
                                            }}>
                                                <Typography variant="subtitle1" sx={{ 
                                                    fontWeight: 'bold',
                                                    color: 'primary.dark',
                                                    mb: 1
                                                }}>
                                                    Nilai Total Semua Item Pekerjaan:
                                                </Typography>
                                                <Typography variant="h6" sx={{
                                                    fontFamily: 'monospace',
                                                    color: '#1976d2'
                                                }}>
                                                    Rp {new Intl.NumberFormat('id-ID').format(calculateTotalNilai(projectProgress[project.id] || []))}
                                                </Typography>

                                                {/* Tambahkan total progress di sini */}
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                                        Total Progress:
                                                    </Typography>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={calculateTotalProgress(projectProgress[project.id])}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 4,
                                                            backgroundColor: '#e0e0e0',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: '#1976d2'
                                                            }
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
                                                        {calculateTotalProgress(projectProgress[project.id])}%
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}

                                        {(projectProgress[project.id] || [])
                                            .filter(progress => !selectedItems[project.id] || progress.nama_item_pekerjaan === selectedItems[project.id])
                                            .map((progress) => {
                                                const { totalNilai } = calculateProgress(progress);
                                                
                                                return (
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

                                                        <Grid container spacing={1} sx={{ mt: 1 }}>
                                                            <Grid item xs={12}>
                                                                <Typography variant="body2" sx={{
                                                                    color: 'text.secondary',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    borderTop: '1px solid #e0e0e0',
                                                                    paddingTop: 1
                                                                }}>
                                                                    <span>Nilai Total Item:</span>
                                                                    <span style={{ 
                                                                        fontFamily: 'monospace',
                                                                        color: '#1976d2',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        Rp {new Intl.NumberFormat('id-ID', {
                                                                            style: 'decimal',
                                                                            minimumFractionDigits: 0,
                                                                            maximumFractionDigits: 0
                                                                        }).format(totalNilai)}
                                                                    </span>
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                );
                                            })
                                        }

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
                                                Tambah Pekerjaan
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