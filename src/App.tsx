import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Typography, Button, Box, useTheme, useMediaQuery, Card, CardContent, Container, CssBaseline } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Progress from './components/Progress';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import PengaturanProfil from './components/PengaturanProfil';
import './App.css';
import ReportCompaction from './components/ReportCompaction';
import ReportDimensions from './components/ReportDimensions';
import ReportMethod from './components/ReportMethod';
import DensityEstimation from './components/DensityEstimation';
import MethodAssessment from './components/MethodAssessment';
import Profil from './components/Profil';
import AddProject from './components/AddProject';
import InformasiProyek from './components/InformasiProyek';
import DetailProgressProyek from './components/DetailProgressProyek';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUsername, setCurrentUsername] = useState('');
    const [userRole, setUserRole] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Handle ResizeObserver error
    useEffect(() => {
        const resizeObserverError = (error: ErrorEvent) => {
            if (error.message === 'ResizeObserver loop completed with undelivered notifications.') {
                error.stopImmediatePropagation();
            }
        };

        window.addEventListener('error', resizeObserverError);
        return () => window.removeEventListener('error', resizeObserverError);
    }, []);

    const handleLogin = (username: string, role: string) => {
        setIsAuthenticated(true);
        setCurrentUsername(username);
        setUserRole(role);
        toast.success('Login berhasil!');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentUsername('');
        setUserRole('');
        toast.info('Berhasil logout!');
    };

    const DetailProgressProyekWrapper = () => {
        return <DetailProgressProyek />;
    };

    return (
        <Router>
            <CssBaseline />
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    overflow: 'hidden'
                }}
            >
                {isAuthenticated && <Navbar onLogout={handleLogout} />}
                
                <ToastContainer 
                    position="top-right" 
                    autoClose={3000}
                    limit={3}
                    newestOnTop
                    closeOnClick
                    pauseOnFocusLoss={false}
                    draggable={false}
                    pauseOnHover={false}
                    theme="light"
                    style={{ zIndex: 9999 }}
                />
                
                <Box 
                    component="main" 
                    sx={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        position: 'relative',
                        overflowX: 'hidden',
                        '& > *': {
                            maxWidth: '100vw'
                        }
                    }}
                >
                    <Routes>
                        <Route 
                            path="/login" 
                            element={isAuthenticated ? <Navigate to="/informasi-proyek" /> : <Login onLogin={handleLogin} />} 
                        />
                        <Route 
                            path="/register" 
                            element={isAuthenticated ? <Navigate to="/informasi-proyek" /> : <Register />} 
                        />
                        <Route 
                            path="/profile" 
                            element={isAuthenticated ? <Profile username={currentUsername} /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/progress" 
                            element={isAuthenticated ? <Progress /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/report-compaction" 
                            element={isAuthenticated ? <ReportCompaction /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/report-dimensions" 
                            element={isAuthenticated ? <ReportDimensions /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/report-method" 
                            element={isAuthenticated ? <ReportMethod /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/method-assessment/:projectId" 
                            element={isAuthenticated ? <MethodAssessment /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/settings" 
                            element={isAuthenticated ? <PengaturanProfil /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/profil" 
                            element={isAuthenticated ? <Profil username={currentUsername} /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/dashboard" 
                            element={isAuthenticated ? <Dashboard role={userRole} /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/density-estimation" 
                            element={isAuthenticated ? <DensityEstimation /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/" 
                            element={
                                isAuthenticated ? (
                                    <Navigate to="/informasi-proyek" />
                                ) : (
                                    <Container maxWidth="sm" sx={{
                                        minHeight: '100vh',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        py: { xs: 2, sm: 4 }
                                    }}>
                                        <Card sx={{
                                            width: '100%',
                                            borderRadius: { xs: 2, sm: 3 },
                                            boxShadow: theme.shadows[8],
                                            overflow: 'hidden'
                                        }}>
                                            <CardContent sx={{
                                                p: { xs: 2, sm: 4 },
                                                textAlign: 'center'
                                            }}>
                                                <Typography 
                                                    variant={isMobile ? "h5" : "h4"}
                                                    component="h1"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: 'primary.main',
                                                        mb: { xs: 2, sm: 4 },
                                                        lineHeight: 1.3
                                                    }}
                                                >
                                                    Selamat Datang di Aplikasi Management Kontraktor
                                                </Typography>

                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    gap: { xs: 1.5, sm: 2 },
                                                    justifyContent: 'center',
                                                    mt: { xs: 2, sm: 3 }
                                                }}>
                                                    <Button
                                                        component={Link}
                                                        to="/login"
                                                        variant="contained"
                                                        size={isMobile ? "large" : "large"}
                                                        fullWidth
                                                        sx={{
                                                            py: 1.5,
                                                            borderRadius: 2,
                                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            boxShadow: theme.shadows[4]
                                                        }}
                                                    >
                                                        Login
                                                    </Button>
                                                    <Button
                                                        component={Link}
                                                        to="/register"
                                                        variant="outlined"
                                                        size={isMobile ? "large" : "large"}
                                                        fullWidth
                                                        sx={{
                                                            py: 1.5,
                                                            borderRadius: 2,
                                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            borderWidth: 2,
                                                            '&:hover': {
                                                                borderWidth: 2
                                                            }
                                                        }}
                                                    >
                                                        Register
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Container>
                                )
                            } 
                        />
                        <Route 
                            path="/add-project" 
                            element={isAuthenticated ? <AddProject /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/informasi-proyek" 
                            element={isAuthenticated ? <InformasiProyek /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/progress-detail/:id" 
                            element={isAuthenticated ? <DetailProgressProyekWrapper /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/dimensions" 
                            element={isAuthenticated ? <ReportDimensions /> : <Navigate to="/login" />} 
                        />
                    </Routes>
                </Box>
            </Box>
        </Router>
    );
};

export default App;