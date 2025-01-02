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
    justify-content: space-between;
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

    @media (max-width: 768px) {
        font-size: 1.2rem;
        margin-right: 1rem;
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
        display: flex;
        align-items: center;
        justify-content: center;
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
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        animation: ${props => props.isOpen ? 'slideDown 0.3s ease' : 'none'};
        flex-direction: column;
        border-radius: 0 0 8px 8px;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
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
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        font-weight: 500;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 1rem;
        white-space: nowrap;
        
        &:hover {
            background-color: var(--secondary-color);
            transform: translateY(-2px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        &:active {
            transform: translateY(0);
        }

        @media (max-width: 768px) {
            width: 100%;
            padding: 1rem;
            justify-content: center;
            margin: 0.3rem 0;
            background-color: rgba(255, 255, 255, 0.1);
            
            &:hover {
                background-color: var(--secondary-color);
                transform: scale(1.02);
            }
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
                    alignItems: {xs: 'stretch', md: 'center'},
                    justifyContent: 'flex-end',
                    width: '100%',
                    gap: {xs: 1.5, md: 3},
                    p: {xs: 1, md: 0}
                }}>
                    <NavItem><Link to="/settings" onClick={handleNavItemClick}>Pengaturan</Link></NavItem>
                    <NavItem>
                        <button onClick={() => {
                            handleNavItemClick();
                            onLogout();
                        }}>Keluar</button>
                    </NavItem>
                </Box>
            </NavList>
        </NavContainer>
    );
};

export default Navbar;