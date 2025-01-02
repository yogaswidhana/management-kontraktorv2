import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, TextField, Button, styled, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ProjectProgress {
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

interface Project {
    id: number;
    nama_kegiatan: string;
    jumlah_item_pekerjaan_mayor: number;
    lama_pekerjaan: number;
}

interface CompletedWeeks {
    [itemPekerjaan: string]: number[];
}

const StyledContainer = styled(Container)(({ theme }) => ({
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
        marginTop: theme.spacing(1)
    }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    overflow: 'auto',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1)
    }
}));

const StyledForm = styled('form')(({ theme }) => ({
    '& .MuiTextField-root': {
        marginBottom: theme.spacing(2)
    }
}));

const DetailProgressProyek: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [project, setProject] = useState<Project | null>(null);
    const [itemPekerjaan, setItemPekerjaan] = useState<string[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [completedWeeks, setCompletedWeeks] = useState<CompletedWeeks>({});

    const [formData, setFormData] = useState<ProjectProgress>({
        project_id: Number(id) || 0,
        item_pekerjaan: '',
        nama_item_pekerjaan: '',
        volume_pekerjaan: 0,
        satuan_pekerjaan: 'm³',
        harga_satuan: 0,
        rencana_waktu_kerja: 0,
        minggu: 'Minggu 1',
        progress: 0,
        update_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const projectResponse = await axios.get(`http://localhost:5000/api/projects/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!isMounted) return;

                setProject(projectResponse.data);

                const items = Array.from(
                    { length: projectResponse.data.jumlah_item_pekerjaan_mayor },
                    (_, index) => `PEK${String(index + 1).padStart(3, '0')}`
                );
                setItemPekerjaan(items);

                const progressResponse = await axios.get(`http://localhost:5000/api/project-progress/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!isMounted) return;

                const completed: CompletedWeeks = {};
                progressResponse.data.forEach((item: ProjectProgress) => {
                    const weekNumber = parseInt(item.minggu.replace('Minggu ', ''));
                    if (!completed[item.item_pekerjaan]) {
                        completed[item.item_pekerjaan] = [];
                    }
                    completed[item.item_pekerjaan].push(weekNumber);
                });
                setCompletedWeeks(completed);

                setFormData(prev => ({
                    ...prev,
                    rencana_waktu_kerja: projectResponse.data.lama_pekerjaan
                }));

            } catch (error) {
                console.error('Error fetching data:', error);
                if (isMounted) {
                    toast('Gagal memuat data', { icon: '❌' });
                }
            }
        };

        if (id) {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, [id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'item_pekerjaan') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            setShowForm(true);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                toast('Sesi anda telah berakhir, silakan login kembali', { icon: '❌' });
                return;
            }

            const weekNumber = parseInt(formData.minggu.replace('Minggu ', ''));
            if (completedWeeks[formData.item_pekerjaan]?.includes(weekNumber)) {
                toast('Minggu ini sudah memiliki progress untuk item pekerjaan ini', { icon: '❌' });
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/project-progress',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201) {
                toast('Data progress berhasil disimpan', { icon: '✅' });
                navigate('/progress');
            }
        } catch (error) {
            console.error('Error submitting progress:', error);
            toast('Gagal menyimpan data progress', { icon: '❌' });
        }
    };

    return (
        <StyledContainer maxWidth="md">
            <StyledPaper>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/progress')}
                        startIcon={<ArrowBackIcon />}
                        size={isMobile ? "small" : "medium"}
                        sx={{ mb: 2 }}
                    >
                        Kembali
                    </Button>
                </Box>

                <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    sx={{ 
                        mb: 3, 
                        fontWeight: 'bold', 
                        color: 'primary.main',
                        textAlign: isMobile ? 'center' : 'left'
                    }}
                >
                    Input Progress Proyek
                    <Typography 
                        variant="subtitle1" 
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        {project?.nama_kegiatan}
                    </Typography>
                </Typography>

                <StyledForm onSubmit={handleSubmit}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: isMobile ? 1.5 : 2 
                    }}>
                        <TextField
                            select
                            label="Item Pekerjaan"
                            name="item_pekerjaan"
                            value={formData.item_pekerjaan}
                            onChange={handleChange}
                            required
                            fullWidth
                            size={isMobile ? "small" : "medium"}
                        >
                            {itemPekerjaan.map((item, index) => (
                                <MenuItem key={index} value={item}>
                                    {item}
                                </MenuItem>
                            ))}
                        </TextField>

                        {showForm && (
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: isMobile ? 1.5 : 2,
                                mt: 1 
                            }}>
                                <TextField
                                    label="Nama Item Pekerjaan"
                                    name="nama_item_pekerjaan"
                                    value={formData.nama_item_pekerjaan}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                    size={isMobile ? "small" : "medium"}
                                />

                                <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                    gap: 2 
                                }}>
                                    <TextField
                                        label="Volume Pekerjaan"
                                        name="volume_pekerjaan"
                                        type="number"
                                        value={formData.volume_pekerjaan}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        size={isMobile ? "small" : "medium"}
                                    />

                                    <TextField
                                        select
                                        label="Satuan Pekerjaan"
                                        name="satuan_pekerjaan"
                                        value={formData.satuan_pekerjaan}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        size={isMobile ? "small" : "medium"}
                                    >
                                        <MenuItem value="m³">m³</MenuItem>
                                        <MenuItem value="m²">m²</MenuItem>
                                    </TextField>
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Harga Satuan"
                                    name="harga_satuan"
                                    value={formData.harga_satuan}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    size={isMobile ? "small" : "medium"}
                                    helperText="Masukkan angka dalam Rupiah (minimal 0)"
                                />

                                <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                    gap: 2 
                                }}>
                                    <TextField
                                        label="Rencana Waktu (Minggu)"
                                        name="rencana_waktu_kerja"
                                        type="number"
                                        value={formData.rencana_waktu_kerja}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        disabled
                                        size={isMobile ? "small" : "medium"}
                                    />

                                    <TextField
                                        select
                                        label="Minggu"
                                        name="minggu"
                                        value={formData.minggu}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        size={isMobile ? "small" : "medium"}
                                    >
                                        {Array.from({ length: formData.rencana_waktu_kerja }, (_, i) => i + 1).map((weekNumber) => (
                                            <MenuItem 
                                                key={weekNumber} 
                                                value={`Minggu ${weekNumber}`}
                                                disabled={completedWeeks[formData.item_pekerjaan]?.includes(weekNumber)}
                                            >
                                                Minggu {weekNumber} 
                                                {completedWeeks[formData.item_pekerjaan]?.includes(weekNumber) ? ' (Sudah diisi)' : ''}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>

                                <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                    gap: 2 
                                }}>
                                    <TextField
                                        label="Progress (%)"
                                        name="progress"
                                        type="number"
                                        value={formData.progress}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        inputProps={{ min: 0, max: 100 }}
                                        size={isMobile ? "small" : "medium"}
                                    />

                                    <TextField
                                        label="Tanggal Update"
                                        name="update_date"
                                        type="date"
                                        value={formData.update_date}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        size={isMobile ? "small" : "medium"}
                                    />
                                </Box>

                                <Box sx={{ 
                                    display: 'flex', 
                                    gap: 2, 
                                    mt: 3,
                                    flexDirection: isMobile ? 'column' : 'row'
                                }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        fullWidth
                                        size={isMobile ? "large" : "medium"}
                                    >
                                        Simpan
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/progress')}
                                        fullWidth
                                        size={isMobile ? "large" : "medium"}
                                    >
                                        Batal
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </StyledForm>
            </StyledPaper>
        </StyledContainer>
    );
};

export default DetailProgressProyek;
