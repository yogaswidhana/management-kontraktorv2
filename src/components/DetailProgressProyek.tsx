import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Paper, Typography, TextField, Button, styled, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useResizeHandler } from '../hooks/useResizeHandler';

interface ProjectProgress {
    project_id: number;
    item_pekerjaan: string;
    nama_item_pekerjaan: string;
    volume_pekerjaan: number;
    satuan_pekerjaan: string;
    harga_satuan: number;
    rencana_waktu_kerja: number;
    minggu: string;
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
    useResizeHandler(); // Tambahkan hook untuk menangani ResizeObserver error
    
    const navigate = useNavigate();
    const { id } = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [project, setProject] = useState<Project | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [completedWeeks, setCompletedWeeks] = useState<CompletedWeeks>({});
    const [itemPekerjaanMayor, setItemPekerjaanMayor] = useState<Array<{kode_item: string, nama_item: string}>>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<ProjectProgress>({
        project_id: Number(id) || 0,
        item_pekerjaan: '',
        nama_item_pekerjaan: '',
        volume_pekerjaan: 0,
        satuan_pekerjaan: 'm³',
        harga_satuan: 0,
        rencana_waktu_kerja: 0,
        minggu: 'Minggu 1',
        update_date: new Date().toISOString().split('T')[0]
    });

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const [projectResponse, itemPekerjaanResponse, progressResponse] = await Promise.all([
                axios.get(`http://localhost:5000/api/projects/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/api/item-pekerjaan-mayor/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/api/project-progress/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (projectResponse.data) {
                setProject(projectResponse.data);
                setFormData(prev => ({
                    ...prev,
                    rencana_waktu_kerja: projectResponse.data.lama_pekerjaan
                }));
            }

            if (itemPekerjaanResponse.data) {
                setItemPekerjaanMayor(itemPekerjaanResponse.data);
            }

            if (progressResponse.data) {
                const completed: CompletedWeeks = {};
                progressResponse.data.forEach((item: ProjectProgress) => {
                    const weekNumber = parseInt(item.minggu.replace('Minggu ', ''));
                    if (!completed[item.item_pekerjaan]) {
                        completed[item.item_pekerjaan] = [];
                    }
                    completed[item.item_pekerjaan].push(weekNumber);
                });
                setCompletedWeeks(completed);
            }

        } catch (error: any) {
            toast('Gagal memuat data', { icon: '❌' });
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'item_pekerjaan') {
            const selectedItem = itemPekerjaanMayor.find(item => item.kode_item === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                nama_item_pekerjaan: selectedItem ? selectedItem.nama_item : ''
            }));
            setShowForm(true);
        } else if (name === 'volume_pekerjaan' || name === 'harga_satuan') {
            const numValue = value === '' ? 0 : parseFloat(value);
            setFormData(prev => ({
                ...prev,
                [name]: isNaN(numValue) ? 0 : numValue
            }));
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
            setIsSubmitting(true);
            
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                toast('Sesi anda telah berakhir, silakan login kembali', { icon: '❌' });
                return;
            }

            if (formData.volume_pekerjaan <= 0) {
                toast('Volume pekerjaan harus lebih besar dari 0', { icon: '❌' });
                return;
            }

            if (formData.harga_satuan <= 0) {
                toast('Harga satuan harus lebih besar dari 0', { icon: '❌' });
                return;
            }

            const dataToSubmit = {
                ...formData,
                volume_pekerjaan: Number(formData.volume_pekerjaan),
                harga_satuan: Number(formData.harga_satuan),
                update_date: new Date().toISOString().split('T')[0]
            };

            console.log('Data yang akan dikirim:', dataToSubmit);

            const response = await axios.post(
                'http://localhost:5000/api/project-progress',
                dataToSubmit,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201) {
                toast('Data berhasil disimpan', { icon: '✅' });
                setFormData({
                    project_id: Number(id) || 0,
                    item_pekerjaan: '',
                    nama_item_pekerjaan: '',
                    volume_pekerjaan: 0,
                    satuan_pekerjaan: 'm³',
                    harga_satuan: 0,
                    rencana_waktu_kerja: 0,
                    minggu: 'Minggu 1',
                    update_date: new Date().toISOString().split('T')[0]
                });
                setShowForm(false);
                fetchData();
            }
        } catch (error: any) {
            console.error('Error:', error);
            toast('Gagal menyimpan data', { icon: '❌' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            pb: 4
        }}>
            <StyledContainer maxWidth="lg">
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
                    </Typography>
                    <Typography
                        variant="body1" 
                        color="text.secondary"
                        sx={{
                            mb: 3,
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            textAlign: isMobile ? 'center' : 'left',
                            padding: isMobile ? '8px 12px' : '12px 16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 0, 0, 0.12)',
                            wordBreak: 'break-word',
                            maxWidth: '100%'
                        }}
                    >
                        {project?.nama_kegiatan}
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
                                {itemPekerjaanMayor.map((item, index) => (
                                    <MenuItem key={index} value={item.kode_item}>
                                        {`${item.kode_item} - ${item.nama_item}`}
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
                                        disabled
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
                                            inputProps={{
                                                step: "0.01",
                                                min: "0"
                                            }}
                                            helperText="Masukkan volume pekerjaan (angka lebih besar dari 0)"
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
                                        gridTemplateColumns: isMobile ? '1fr' : '1fr',
                                        gap: 2 
                                    }}>
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
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                                    <span>Menyimpan...</span>
                                                </div>
                                            ) : (
                                                'Simpan'
                                            )}
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
        </Box>
    );
};

export default DetailProgressProyek;