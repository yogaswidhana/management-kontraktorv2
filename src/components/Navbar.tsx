import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Box, styled } from '@mui/material';

interface NavbarProps {
    onLogout: () => void;
}

const NavContainer = styled('nav')`
    background-color: var(--primary-color);
    padding: 1rem;
    position: sticky;
    top: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const NavBrand = styled('div')`
    color: #fff;
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 2rem;
    
    &:hover {
        color: var(--secondary-color);
        transition: color 0.3s ease;
    }
`;

const MenuButton = styled('button')`
    display: none;
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 0.5rem;
    transition: transform 0.3s ease;
    
    &:hover {
        transform: scale(1.1);
    }
    
    @media (max-width: 768px) {
        display: block;
    }
`;

const NavList = styled('div')<{ isOpen: boolean }>`
    display: flex;
    flex: 1;

    @media (max-width: 768px) {
        display: ${props => props.isOpen ? 'flex' : 'none'};
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: var(--primary-color);
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        animation: ${props => props.isOpen ? 'slideDown 0.3s ease' : 'none'};
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const NavItem = styled('div')`
    a, button {
        color: #fff;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: all 0.3s ease;
        display: inline-block;
        font-weight: 500;
        border: none;
        background: none;
        cursor: pointer;
        font-size: inherit;
        
        &:hover {
            background-color: var(--secondary-color);
            transform: translateY(-2px);
        }

        &:active {
            transform: translateY(0);
        }
    }
`;

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleNavItemClick = () => {
        if (window.innerWidth <= 768) {
            setIsOpen(false);
        }
    };

    return (
        <NavContainer>
            <NavBrand>
                SIMP
            </NavBrand>
            <MenuButton onClick={toggleMenu} aria-label="Toggle menu">
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </MenuButton>
            <NavList isOpen={isOpen}>
                <Box sx={{ 
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row'},
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    p: {xs: 2, md: 0}
                }}>
                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: {xs: 'column', md: 'row'},
                        gap: 2,
                        flex: 1,
                        alignItems: 'center',
                        overflow: {md: 'auto'},
                        whiteSpace: {md: 'nowrap'}
                    }}>
                        <NavItem><Link to="/informasi-proyek" onClick={handleNavItemClick}>Info Proyek</Link></NavItem>
                        <NavItem><Link to="/progress" onClick={handleNavItemClick}>Progres</Link></NavItem>
                        <NavItem><Link to="/report-dimensions" onClick={handleNavItemClick}>Laporan Dimensi</Link></NavItem>
                        <NavItem><Link to="/report-compaction" onClick={handleNavItemClick}>Laporan Pemadatan</Link></NavItem>
                        <NavItem><Link to="/report-method" onClick={handleNavItemClick}>Laporan Metode</Link></NavItem>
                        <NavItem><Link to="/density-estimation" onClick={handleNavItemClick}>Estimasi Kepadatan</Link></NavItem>
                        <NavItem><Link to="/method-assessment" onClick={handleNavItemClick}>Penilaian Metode</Link></NavItem>
                        <NavItem><Link to="/settings" onClick={handleNavItemClick}>Pengaturan</Link></NavItem>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        mt: {xs: 2, md: 0},
                        borderTop: {xs: '1px solid rgba(255,255,255,0.1)', md: 'none'},
                        pt: {xs: 2, md: 0}
                    }}>
                        <NavItem>
                            <button onClick={() => {
                                handleNavItemClick();
                                onLogout();
                            }}>Keluar</button>
                        </NavItem>
                    </Box>
                </Box>
            </NavList>
        </NavContainer>
    );
};

export default Navbar;