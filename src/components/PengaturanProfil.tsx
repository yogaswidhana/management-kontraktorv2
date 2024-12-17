import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Select, MenuItem, Button, styled } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LanguageIcon from '@mui/icons-material/Language';

const StyledContainer = styled(Container)`
    padding: 2rem;
    margin-top: 2rem;
`;

const StyledPaper = styled(Paper)`
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SettingItem = styled(Box)`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0;
`;

const Settings: React.FC = () => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'id';
    });

    useEffect(() => {
        // Terapkan tema saat komponen dimuat
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const handleSaveSettings = () => {
        try {
            // Simpan pengaturan ke localStorage
            localStorage.setItem('theme', theme);
            localStorage.setItem('language', language);

            // Terapkan tema
            document.documentElement.setAttribute('data-theme', theme);

            // Terapkan bahasa
            document.documentElement.setAttribute('lang', language);

            alert('Pengaturan berhasil disimpan!');
        } catch (error) {
            console.error('Gagal menyimpan pengaturan:', error);
            alert('Gagal menyimpan pengaturan. Silakan coba lagi.');
        }
    };

    return (
        <StyledContainer maxWidth="md">
            <StyledPaper>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        Pengaturan
                    </Typography>
                </Box>

                <SettingItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '120px' }}>
                        {theme === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
                        <Typography>Tema:</Typography>
                    </Box>
                    <Select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        sx={{ minWidth: 200 }}
                        size="small"
                    >
                        <MenuItem value="light">Terang</MenuItem>
                        <MenuItem value="dark">Gelap</MenuItem>
                    </Select>
                </SettingItem>

                <SettingItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '120px' }}>
                        <LanguageIcon />
                        <Typography>Bahasa:</Typography>
                    </Box>
                    <Select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        sx={{ minWidth: 200 }}
                        size="small"
                    >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="id">Indonesia</MenuItem>
                    </Select>
                </SettingItem>

                <Box sx={{ mt: 4, textAlign: 'right' }}>
                    <Button 
                        variant="contained" 
                        onClick={handleSaveSettings}
                        sx={{ 
                            borderRadius: '8px',
                            padding: '8px 24px'
                        }}
                    >
                        Simpan Pengaturan
                    </Button>
                </Box>
            </StyledPaper>
        </StyledContainer>
    );
};

export default Settings;