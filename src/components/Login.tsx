import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';

const LoginContainer = styled(Container)`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
`;

const LoginPaper = styled(Paper)`
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    background-color: white;
    width: 100%;
    max-width: 400px;
`;

const LoginTitle = styled(Typography)`
    color: #1976d2;
    font-weight: bold;
    margin-bottom: 2rem;
`;

const StyledTextField = styled(TextField)`
    margin-bottom: 1rem;
    
    & .MuiOutlinedInput-root {
        &:hover fieldset {
            border-color: #1976d2;
        }
    }
`;

const LoginButton = styled(Button)`
    margin: 1.5rem 0;
    padding: 0.8rem;
    font-weight: bold;
    font-size: 1rem;
    background-color: #1976d2;
    
    &:hover {
        background-color: #1565c0;
    }
`;

interface LoginProps {
    onLogin: (username: string, role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) {
            toast.error('Username dan password harus diisi');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                username,
                password,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200 && response.data) {
                const userData = response.data.user;
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', response.data.token);
                onLogin(username, userData.role);
                navigate('/dashboard');
            }
        } catch (error: any) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleError = (error: any) => {
        if (error.response) {
            const errorMessage = error.response.data.message || 'Login gagal';
            toast.error(errorMessage);
        } else {
            toast.error('Terjadi kesalahan pada server. Silakan coba lagi nanti');
        }
        console.error('Login failed:', error);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <LoginContainer maxWidth={false}>
            <LoginPaper elevation={3}>
                <Box sx={{ textAlign: 'center' }}>
                    <LoginTitle variant="h4">
                        Masuk ke Sistem
                    </LoginTitle>
                    
                    <StyledTextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        autoFocus
                        InputProps={{
                            sx: { borderRadius: '8px' }
                        }}
                    />
                    
                    <StyledTextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        InputProps={{
                            sx: { borderRadius: '8px' }
                        }}
                    />
                    
                    <LoginButton
                        variant="contained"
                        fullWidth
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : 'Masuk'}
                    </LoginButton>
                    
                    <Typography 
                        sx={{ 
                            mt: 2,
                            color: '#666',
                            '& a': {
                                color: '#1976d2',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }
                        }}
                    >
                        Belum punya akun?{' '}
                        <Link to="/register">Daftar di sini</Link>
                    </Typography>
                </Box>
            </LoginPaper>
        </LoginContainer>
    );
};

export default Login;