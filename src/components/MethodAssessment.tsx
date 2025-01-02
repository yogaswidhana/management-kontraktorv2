import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Select, MenuItem, TextField, styled, Button } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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

const AssessmentItem = styled(Box)`
    margin-bottom: 2rem;
    padding: 1.5rem;
    border-radius: 8px;
    background-color: #f8f9fa;
`;

const StatusSelect = styled(Select)`
    min-width: 200px;
    margin: 1rem 0;
    
    &.compliant {
        color: #2e7d32;
    }
    
    &.non-compliant {
        color: #d32f2f;
    }
`;

const FormGroup = styled(Box)`
    margin: 1rem 0;
`;

interface MethodAssessmentData {
    project_id: number;
    work_type: 'excavation' | 'embankment' | 'subgrade' | 'granular_pavement' | 'asphalt_pavement';
    method_data: {
        status: 'Sesuai' | 'Tidak Sesuai';
        catatan: string;
    };
    process_flow: {
        steps: string[];
        equipment: string[];
    };
    status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
    consultant_notes: string | null;
    owner_notes: string | null;
}

const MethodAssessmentComponent: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    
    const [assessmentData, setAssessmentData] = useState<Record<string, MethodAssessmentData>>({
        excavation: {
            project_id: Number(projectId),
            work_type: 'excavation',
            method_data: {
                status: 'Sesuai',
                catatan: ''
            },
            process_flow: {
                steps: [],
                equipment: []
            },
            status: 'submitted',
            consultant_notes: null,
            owner_notes: null
        },
        embankment: {
            project_id: Number(projectId),
            work_type: 'embankment',
            method_data: {
                status: 'Sesuai',
                catatan: ''
            },
            process_flow: {
                steps: [],
                equipment: []
            },
            status: 'submitted',
            consultant_notes: null,
            owner_notes: null
        },
        subgrade: {
            project_id: Number(projectId),
            work_type: 'subgrade',
            method_data: {
                status: 'Sesuai',
                catatan: ''
            },
            process_flow: {
                steps: [],
                equipment: []
            },
            status: 'submitted',
            consultant_notes: null,
            owner_notes: null
        }
    });

    const handleStatusChange = (section: string, value: 'Sesuai' | 'Tidak Sesuai') => {
        setAssessmentData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                method_data: {
                    ...prev[section as keyof typeof prev].method_data,
                    status: value
                }
            }
        }));
    };

    const handleNotesChange = (section: string, value: string) => {
        setAssessmentData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                method_data: {
                    ...prev[section as keyof typeof prev].method_data,
                    catatan: value
                }
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                toast('Sesi anda telah berakhir, silakan login kembali', {
                    icon: '❌'
                });
                return;
            }

            if (!projectId) {
                toast('ID Proyek tidak valid', {
                    icon: '❌'
                });
                return;
            }

            // Validasi semua catatan harus diisi
            for (const assessment of Object.values(assessmentData)) {
                if (!assessment.method_data.catatan.trim()) {
                    toast('Catatan harus diisi untuk semua penilaian', {
                        icon: '❌'
                    });
                    return;
                }
            }

            // Kirim data ke server
            for (const [workType, assessment] of Object.entries(assessmentData)) {
                const formattedData = {
                    project_id: Number(projectId),
                    work_type: workType as 'excavation' | 'embankment' | 'subgrade',
                    method_data: {
                        status: assessment.method_data.status,
                        catatan: assessment.method_data.catatan.trim()
                    },
                    process_flow: {
                        steps: [],
                        equipment: []
                    },
                    status: 'submitted',
                    consultant_notes: null,
                    owner_notes: null
                };

                const response = await axios.post(
                    'http://localhost:5000/api/method-reports',
                    formattedData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.data) {
                    throw new Error('Gagal menyimpan penilaian');
                }
            }

            toast('Penilaian metode kerja berhasil disimpan', {
                icon: '✅'
            });
            navigate('/informasi-proyek');

        } catch (error: any) {
            console.error('Error saving assessment:', error);
            if (error.response?.status === 401) {
                navigate('/login');
                toast('Sesi anda telah berakhir, silakan login kembali', {
                    icon: '❌'
                });
            } else {
                toast(error.response?.data?.message || 'Gagal menyimpan penilaian metode kerja', {
                    icon: '❌'
                });
            }
        }
    };

    return (
        <StyledContainer maxWidth="md">
            <StyledPaper>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <AssignmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        Penilaian Metode Kerja
                    </Typography>
                </Box>

                {Object.entries(assessmentData).map(([key, value]) => (
                    <FormGroup key={key}>
                        <AssessmentItem>
                            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 500 }}>
                                {key === 'excavation' ? 'Penggalian (Excavation)' :
                                 key === 'embankment' ? 'Timbunan (Embankment)' :
                                 'Tanah Dasar (Subgrade)'}
                            </Typography>

                            <StatusSelect
                                value={value.method_data.status}
                                onChange={(e) => handleStatusChange(key, e.target.value as 'Sesuai' | 'Tidak Sesuai')}
                                className={value.method_data.status === 'Sesuai' ? 'compliant' : 'non-compliant'}
                                fullWidth
                                size="small"
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="Sesuai">Sesuai</MenuItem>
                                <MenuItem value="Tidak Sesuai">Tidak Sesuai</MenuItem>
                            </StatusSelect>

                            <TextField
                                fullWidth
                                multiline
                                rows={1}
                                value={value.method_data.catatan}
                                onChange={(e) => handleNotesChange(key, e.target.value)}
                                placeholder="Tambahkan catatan penilaian..."
                                variant="outlined"
                                sx={{ mt: 1 }}
                            />
                        </AssessmentItem>
                    </FormGroup>
                ))}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/informasi-proyek')}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                    >
                        Simpan Penilaian
                    </Button>
                </Box>
            </StyledPaper>
        </StyledContainer>
    );
};

export default MethodAssessmentComponent;