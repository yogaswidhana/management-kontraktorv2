import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, styled, CircularProgress } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Project {
    id: number;
    name: string;
    overall_progress: number;
}

const StyledContainer = styled(Container)`
    padding: 2rem;
    margin-top: 2rem;
`;

const StyledPaper = styled(Paper)`
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ProgressBar = styled(Box)`
    width: 100%;
    height: 20px;
    background-color: #f5f5f5;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 1.5rem;
`;

const Progress: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get<Project[]>('http://localhost:3000/api/projects');
                setProjects(response.data);
            } catch (error) {
                console.error('Error fetching projects:', error);
                toast('Gagal memuat data proyek', { 
                    icon: '❌'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleDetailClick = (projectId: number) => {
        navigate(`/progress-detail/${projectId}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <StyledContainer maxWidth="md">
            <StyledPaper>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <AssignmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        Progress Proyek
                    </Typography>
                </Box>

                {projects.length === 0 ? (
                    <Typography variant="body1" align="center">
                        Tidak ada proyek yang tersedia
                    </Typography>
                ) : (
                    projects.map((project) => (
                        <Box key={project.id} sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {project.name}
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1
                            }}>
                                <Typography>Progress Keseluruhan</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography>
                                        {project.overall_progress || 0}%
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        size="small"
                                        onClick={() => handleDetailClick(project.id)}
                                    >
                                        Detail
                                    </Button>
                                </Box>
                            </Box>
                            <ProgressBar>
                                <Box
                                    sx={{
                                        width: `${project.overall_progress || 0}%`,
                                        height: '100%',
                                        bgcolor: `hsl(${(project.overall_progress || 0) * 1.2}, 70%, 50%)`,
                                        transition: 'width 0.3s ease-in-out'
                                    }}
                                />
                            </ProgressBar>
                        </Box>
                    ))
                )}
            </StyledPaper>
        </StyledContainer>
    );
};

export default Progress;