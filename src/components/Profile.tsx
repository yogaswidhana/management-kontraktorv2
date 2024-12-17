import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
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

interface UserData {
    username: string;
}

const Profile: React.FC<{ username: string }> = ({ username }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`http://localhost:3000/api/profile/${username}`);
                setUserData(response.data);
            } catch (error: any) {
                handleError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    const handleError = (error: any) => {
        const errorMessage = error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi';
        toast.error(errorMessage);
        setError(errorMessage);
        console.error('Profile fetch failed:', error);
    };

    const validateInput = () => {
        if (!newUsername.trim() || !newPassword.trim()) {
            setError('Username dan password baru harus diisi');
            return false;
        }
        if (newUsername.trim().length < 3) {
            setError('Username minimal 3 karakter');
            return false;
        }
        if (newPassword.trim().length < 6) {
            setError('Password minimal 6 karakter');
            return false;
        }
        return true;
    };

    const handleUpdateProfile = async () => {
        try {
            if (!validateInput()) return;

            setIsLoading(true);
            await axios.put(`http://localhost:3000/api/profile/${username}`, {
                newUsername: newUsername.trim(),
                newPassword: newPassword.trim()
            });

            toast.success('Profil berhasil diperbarui');
            setNewUsername('');
            setNewPassword('');
            setError('');

            const response = await axios.get(`http://localhost:3000/api/profile/${newUsername}`);
            setUserData(response.data);
        } catch (error: any) {
            handleError(error);
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
                                helperText="Minimal 3 karakter"
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
                                helperText="Minimal 6 karakter"
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