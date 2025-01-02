import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, Paper, Box, styled, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
        marginTop: theme.spacing(1)
    }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
        borderRadius: '12px',
        margin: '0 8px'
    }
}));

const FormGroup = styled(Box)(({ theme }) => ({
    margin: theme.spacing(2, 0),
    [theme.breakpoints.down('sm')]: {
        margin: theme.spacing(1.5, 0)
    }
}));

const StyledLink = styled(Link)(({ theme }) => ({
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
        textDecoration: 'underline'
    }
}));

const Register: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        jabatan: '',
        organisasi: '',
        role: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        if (name) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        const errors = [];
        
        if (!formData.username.trim()) errors.push('Username harus diisi');
        if (!formData.password) errors.push('Password harus diisi');
        if (!formData.jabatan.trim()) errors.push('Jabatan harus diisi');
        if (!formData.organisasi.trim()) errors.push('Organisasi harus diisi');
        if (!formData.role) errors.push('Role harus dipilih');
        
        if (formData.password.length < 6) {
            errors.push('Password harus minimal 6 karakter');
        }

        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const organisation_id = `${formData.organisasi.replace(/\s+/g, '')}_${Date.now()}`;
            
            const requestData = {
                username: formData.username.trim(),
                password: formData.password,
                jabatan: formData.jabatan.trim(),
                organisasi: formData.organisasi.trim(),
                role: formData.role,
                organisation_id: organisation_id
            };

            const response = await axios.post('http://localhost:5000/api/register', requestData);
            
            if (response.status === 201) {
                toast.success('Registrasi berhasil!');
                navigate('/login');
            }
        } catch (error: any) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleError = (error: any) => {
        if (error.response) {
            const errorMessage = error.response.data.message || 'Registrasi gagal';
            toast.error(errorMessage);
        } else {
            toast.error('Terjadi kesalahan. Silakan coba lagi');
        }
        console.error('Registration failed:', error);
    };

    return (
        <StyledContainer maxWidth="sm">
            <StyledPaper elevation={isMobile ? 2 : 4}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    gap: 1,
                    mb: isMobile ? 2 : 4 
                }}>
                    <PersonAddIcon sx={{ 
                        fontSize: isMobile ? 40 : 48, 
                        color: 'primary.main',
                        mb: 1
                    }} />
                    <Typography 
                        variant={isMobile ? "h5" : "h4"} 
                        sx={{ 
                            color: 'primary.main', 
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                    >
                        Registrasi
                    </Typography>
                </Box>

                <FormGroup>
                    <TextField
                        label="Username"
                        variant="outlined"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                        placeholder="Masukkan username"
                        sx={{ mb: 2 }}
                        required
                        error={!formData.username.trim()}
                        helperText={!formData.username.trim() ? "Username wajib diisi" : ""}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                        placeholder="Masukkan password"
                        sx={{ mb: 2 }}
                        required
                        error={!formData.password || formData.password.length < 6}
                        helperText={!formData.password ? "Password wajib diisi" : formData.password.length < 6 ? "Password minimal 6 karakter" : ""}
                    />
                    <TextField
                        label="Jabatan"
                        variant="outlined"
                        name="jabatan"
                        value={formData.jabatan}
                        onChange={handleChange}
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                        placeholder="Contoh: Project Manager, Site Engineer"
                        sx={{ mb: 2 }}
                        required
                        error={!formData.jabatan.trim()}
                        helperText={!formData.jabatan.trim() ? "Jabatan wajib diisi" : ""}
                    />
                    <TextField
                        label="Organisasi"
                        variant="outlined"
                        name="organisasi"
                        value={formData.organisasi}
                        onChange={handleChange}
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                        placeholder="Contoh: PT. Konstruksi Jaya"
                        sx={{ mb: 2 }}
                        required
                        error={!formData.organisasi.trim()}
                        helperText={!formData.organisasi.trim() ? "Organisasi wajib diisi" : ""}
                    />
                    <TextField
                        select
                        label="Role"
                        variant="outlined"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                        required
                        error={!formData.role}
                        helperText={!formData.role ? "Role wajib dipilih" : ""}
                    >
                        <MenuItem value="contractor">Kontraktor</MenuItem>
                        <MenuItem value="consultant">Konsultan</MenuItem>
                        <MenuItem value="owner">Owner</MenuItem>
                    </TextField>
                </FormGroup>

                <Button
                    variant="contained"
                    onClick={handleRegister}
                    disabled={isLoading}
                    fullWidth
                    sx={{
                        mt: 2,
                        py: isMobile ? 1 : 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
                </Button>

                <Typography 
                    variant={isMobile ? "body2" : "body1"}
                    align="center" 
                    sx={{ 
                        mt: 3,
                        color: 'text.secondary'
                    }}
                >
                    Sudah punya akun? <StyledLink to="/login">Masuk di sini</StyledLink>
                </Typography>
            </StyledPaper>
        </StyledContainer>
    );
};

export default Register;