import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, Box, TextField, Button, Alert, styled } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

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

const Profile: React.FC<{ username: string }> = ({ username }) => {
    const [userData, setUserData] = useState<any>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`http://localhost:5000/api/profile/${username}`);
                setUserData(response.data);
                setError('');
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Gagal mengambil data profil');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    const handleUpdateProfile = async () => {
        try {
            setIsLoading(true);
            
            if (!newUsername.trim() || !newPassword.trim()) {
                setError('Username dan password baru harus diisi');
                return;
            }

            if (newPassword.length < 6) {
                setError('Password baru harus minimal 6 karakter');
                return;
            }

            if (newUsername === username) {
                setError('Username baru harus berbeda dengan username saat ini');
                return;
            }

            await axios.put(`http://localhost:5000/api/profile/${username}`, {
                newUsername: newUsername.trim(),
                newPassword: newPassword.trim(),
            });
            
            setError('');
            setNewUsername('');
            setNewPassword('');
            
            const response = await axios.get(`http://localhost:5000/api/profile/${newUsername}`);
            setUserData(response.data);
            
            alert('Profil berhasil diperbarui');
        } catch (error: any) {
            console.error('Profile update failed', error);
            setError(error.response?.data?.message || 'Gagal memperbarui profil');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StyledContainer maxWidth="md">
            <StyledPaper>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        Profil Pengguna
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {isLoading ? (
                    <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Memuat...
                    </Typography>
                ) : userData ? (
                    <Box>
                        <FormGroup>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                Username Saat Ini:
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                {userData.username}
                            </Typography>
                        </FormGroup>

                        <FormGroup>
                            <TextField
                                fullWidth
                                label="Username Baru"
                                variant="outlined"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Masukkan username baru"
                                size="small"
                                disabled={isLoading}
                            />
                        </FormGroup>

                        <FormGroup>
                            <TextField
                                fullWidth
                                label="Password Baru"
                                variant="outlined"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Masukkan password baru"
                                size="small"
                                disabled={isLoading}
                            />
                        </FormGroup>

                        <Box sx={{ mt: 4, textAlign: 'right' }}>
                            <Button
                                variant="contained"
                                onClick={handleUpdateProfile}
                                disabled={isLoading}
                                sx={{
                                    borderRadius: '8px',
                                    padding: '8px 24px'
                                }}
                            >
                                {isLoading ? 'Memperbarui...' : 'Perbarui Profil'}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Data tidak ditemukan
                    </Typography>
                )}
            </StyledPaper>
        </StyledContainer>
    );
};

export default Profile;