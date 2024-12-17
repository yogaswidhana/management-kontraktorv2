import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, Paper, Box, styled, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const StyledContainer = styled(Container)`
    padding: 2rem;
    margin-top: 2rem;
`;

const StyledPaper = styled(Paper)`
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled(Box)`
    margin: 1.5rem 0;
`;

const StyledLink = styled(Link)`
    color: #1976d2;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;

const Register: React.FC = () => {
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
            const requestData = {
                username: formData.username.trim(),
                password: formData.password,
                jabatan: formData.jabatan.trim(),
                organisasi: formData.organisasi.trim(),
                role: formData.role
            };

            const response = await axios.post('http://localhost:3000/api/register', requestData);
            
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
            <StyledPaper>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <PersonAddIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
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
                        size="small"
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
                        size="small"
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
                        size="small"
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
                        size="small"
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
                        size="small"
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
                        py: 1.5,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '1rem'
                    }}
                >
                    {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
                </Button>

                <Typography 
                    variant="body1" 
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