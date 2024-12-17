import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Container, 
    Paper, 
    Typography, 
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Task {
    name: string;
    progress: number;
    pic: string;
    updateDate: string;
    description: string;
}

interface ProjectDetail {
    name: string;
    tanggalMulai: string;
    targetSelesai: string;
    penanggungJawab: string;
    overall_progress: number;
    anggaran: string;
    lokasi: string;
    tasks: Task[];
}

const DetailProgressProyek: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjectDetail = async () => {
            try {
                const response = await axios.get<ProjectDetail>(`http://localhost:3000/api/projects/${id}/progress`);
                setProjectDetail(response.data);
            } catch (err) {
                console.error('Error fetching project detail:', err);
                toast('Gagal memuat detail proyek', {
                    icon: '❌'
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProjectDetail();
        }
    }, [id]);

    if (loading) {
        return <CircularProgress />;
    }

    if (!projectDetail) {
        return <Typography>Proyek tidak ditemukan</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Button 
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                    >
                        Kembali
                    </Button>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Detail Progress: {projectDetail.name}
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Informasi Umum</Typography>
                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: 3,
                        bgcolor: '#f5f5f5',
                        p: 2,
                        borderRadius: 1
                    }}>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Tanggal Mulai</Typography>
                            <Typography>{projectDetail.tanggalMulai}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Target Selesai</Typography>
                            <Typography>{projectDetail.targetSelesai}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Penanggung Jawab</Typography>
                            <Typography>{projectDetail.penanggungJawab}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Total Progress</Typography>
                            <Typography>{projectDetail.overall_progress || 0}%</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Anggaran</Typography>
                            <Typography>{projectDetail.anggaran}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Lokasi</Typography>
                            <Typography>{projectDetail.lokasi}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Typography variant="h6" sx={{ mb: 2 }}>Detail Sub-Tugas</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white' }}>Nama Sub-Tugas</TableCell>
                                <TableCell align="center" sx={{ color: 'white' }}>Progress</TableCell>
                                <TableCell sx={{ color: 'white' }}>PIC</TableCell>
                                <TableCell sx={{ color: 'white' }}>Tanggal Update</TableCell>
                                <TableCell sx={{ color: 'white' }}>Keterangan</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projectDetail.tasks.map((task, index) => (
                                <TableRow key={index}>
                                    <TableCell>{task.name}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ 
                                            bgcolor: `hsl(${task.progress * 1.2}, 70%, 50%)`,
                                            color: 'white',
                                            py: 0.5,
                                            px: 1,
                                            borderRadius: 1,
                                            display: 'inline-block'
                                        }}>
                                            {task.progress}%
                                        </Box>
                                    </TableCell>
                                    <TableCell>{task.pic}</TableCell>
                                    <TableCell>{task.updateDate}</TableCell>
                                    <TableCell>{task.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default DetailProgressProyek;