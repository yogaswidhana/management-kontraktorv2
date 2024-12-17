import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Paper, Typography, Button, Box } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
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

    return (
        <Router>
            <div>
                {isAuthenticated && <Navbar onLogout={handleLogout} />}
                <ToastContainer position="top-right" autoClose={3000} />
                <Routes>
                    <Route path="/login" element={
                        isAuthenticated ? <Navigate to="/informasi-proyek" /> : <Login onLogin={handleLogin} />
                    } />
                    <Route path="/register" element={
                        isAuthenticated ? <Navigate to="/informasi-proyek" /> : <Register />
                    } />
                    <Route path="/profile" element={
                        isAuthenticated ? <Profile username={currentUsername} /> : <Navigate to="/login" />
                    } />
                    <Route path="/progress" element={
                        isAuthenticated ? <Progress /> : <Navigate to="/login" />
                    } />
                    <Route path="/report-compaction" element={
                        isAuthenticated ? <ReportCompaction /> : <Navigate to="/login" />
                    } />
                    <Route path="/report-dimensions" element={
                        isAuthenticated ? <ReportDimensions /> : <Navigate to="/login" />
                    } />
                    <Route path="/report-method" element={
                        isAuthenticated ? <ReportMethod /> : <Navigate to="/login" />
                    } />
                    <Route path="/method-assessment" element={
                        isAuthenticated ? <MethodAssessment /> : <Navigate to="/login" />
                    } />
                    <Route path="/settings" element={
                        isAuthenticated ? <PengaturanProfil /> : <Navigate to="/login" />
                    } />
                    <Route path="/profil" element={
                        isAuthenticated ? <Profil username={currentUsername} /> : <Navigate to="/login" />
                    } />
                    <Route path="/dashboard" element={
                        isAuthenticated ? <Dashboard role={userRole} /> : <Navigate to="/login" />
                    } />
                    <Route path="/density-estimation" element={
                        isAuthenticated ? <DensityEstimation /> : <Navigate to="/login" />
                    } />
                    <Route path="/" element={
                        isAuthenticated ? (
                            <Navigate to="/informasi-proyek" />
                        ) : (
                            <Box sx={{ padding: '2rem' }}>
                                <Paper elevation={3} sx={{
                                    padding: '3rem',
                                    borderRadius: '15px',
                                    textAlign: 'center',
                                    maxWidth: '600px',
                                    width: '90%',
                                    margin: '0 auto'
                                }}>
                                    <Typography variant="h3" component="h1" gutterBottom sx={{
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        marginBottom: '2rem'
                                    }}>
                                        Selamat Datang di Aplikasi Management Kontraktor
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: '1rem',
                                        justifyContent: 'center',
                                        flexWrap: 'wrap'
                                    }}>
                                        <Button
                                            component={Link}
                                            to="/login"
                                            variant="contained"
                                            size="large"
                                            sx={{
                                                minWidth: '150px',
                                                borderRadius: '8px',
                                                padding: '10px 30px'
                                            }}
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            component={Link}
                                            to="/register"
                                            variant="outlined"
                                            size="large"
                                            sx={{
                                                minWidth: '150px',
                                                borderRadius: '8px',
                                                padding: '10px 30px'
                                            }}
                                        >
                                            Register
                                        </Button>
                                    </Box>
                                </Paper>
                            </Box>
                        )
                    } />
                    <Route path="/add-project" element={
                        isAuthenticated ? <AddProject /> : <Navigate to="/login" />
                    } />
                    <Route path="/informasi-proyek" element={
                        isAuthenticated ? <InformasiProyek /> : <Navigate to="/login" />
                    } />
                    <Route path="/progress-detail/:id" element={<DetailProgressProyek />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;