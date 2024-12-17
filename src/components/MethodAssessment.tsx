import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Select, MenuItem, TextField, styled } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

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

const MethodAssessment: React.FC = () => {
    const [assessmentData, setAssessmentData] = useState({
        excavation: {
            status: 'Sesuai',
            catatan: ''
        },
        compaction: {
            status: 'Tidak Sesuai',
            catatan: 'Perlu perbaikan metode pemadatan'
        },
        pavement: {
            status: 'Sesuai',
            catatan: ''
        }
    });

    const handleStatusChange = (section: string, value: string) => {
        setAssessmentData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                status: value
            }
        }));
    };

    const handleNotesChange = (section: string, value: string) => {
        setAssessmentData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                catatan: value
            }
        }));
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
                                 key === 'compaction' ? 'Pemadatan (Compaction)' :
                                 'Perkerasan (Pavement)'}
                            </Typography>

                            <StatusSelect
                                value={value.status}
                                onChange={(e) => handleStatusChange(key, e.target.value as string)}
                                className={value.status === 'Sesuai' ? 'compliant' : 'non-compliant'}
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
                                rows={3}
                                value={value.catatan}
                                onChange={(e) => handleNotesChange(key, e.target.value)}
                                placeholder="Tambahkan catatan..."
                                variant="outlined"
                                sx={{ mt: 1 }}
                            />
                        </AssessmentItem>
                    </FormGroup>
                ))}
            </StyledPaper>
        </StyledContainer>
    );
};

export default MethodAssessment;