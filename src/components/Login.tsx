import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';

const LoginContainer = styled(Container)`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    padding: ${({ theme }) => theme.spacing(2)};
`;

const LoginPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '400px',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
        margin: theme.spacing(1),
        borderRadius: theme.spacing(1.5),
    }
}));

const LoginTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.75rem',
        marginBottom: theme.spacing(2),
    }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.spacing(1),
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.9rem',
        }
    }
}));

const LoginButton = styled(Button)(({ theme }) => ({
    margin: `${theme.spacing(2)} 0`,
    padding: theme.spacing(1.5),
    fontWeight: 'bold',
    fontSize: '1rem',
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
        fontSize: '0.9rem',
    }
}));

interface LoginProps {
    onLogin: (username: string, role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleLogin = async () => {
        if (!username || !password) {
            toast.error('Username dan password harus diisi');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
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
                localStorage.setItem('organisation_id', userData.organisation_id);
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
            <LoginPaper elevation={isMobile ? 2 : 3}>
                <Box sx={{ 
                    textAlign: 'center',
                    padding: isMobile ? 1 : 2
                }}>
                    <LoginTitle variant={isMobile ? "h5" : "h4"}>
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
                        size={isMobile ? "small" : "medium"}
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
                        size={isMobile ? "small" : "medium"}
                    />
                    
                    <LoginButton
                        variant="contained"
                        fullWidth
                        onClick={handleLogin}
                        disabled={isLoading}
                        size={isMobile ? "medium" : "large"}
                    >
                        {isLoading ? 'Memproses...' : 'Masuk'}
                    </LoginButton>
                    
                    <Typography 
                        variant={isMobile ? "body2" : "body1"}
                        sx={{ 
                            mt: isMobile ? 1.5 : 2,
                            color: '#666',
                            '& a': {
                                color: 'primary.main',
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