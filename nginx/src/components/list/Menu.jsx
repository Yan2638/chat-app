import { Drawer, Box, Avatar, Typography, Button, Modal, TextField, Alert } from '@mui/material';
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupsIcon from '@mui/icons-material/Groups';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LogoutIcon from '@mui/icons-material/Logout';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import axios from 'axios';
import ProfileModal from './Profile';
import "./list.css";
import { API_URL } from '../../constants';

const Menu = ({ open, setOpen, currentUserName, currentUserEmail }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoSymbol, setCryptoSymbol] = useState('');
  const [cryptoAlert, setCryptoAlert] = useState(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      if (response.status === 200) {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        document.cookie = "auth_token=; Max-Age=0; path=/;";
        navigate("/chat-app/auth");
      }
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleCryptoClick = () => {
    setIsCryptoModalOpen(true);
  };

  const handleCloseCryptoModal = () => {
    setIsCryptoModalOpen(false);
  };

  const handleSendCryptoRequest = async () => {
    setCryptoAlert(null);
    if (!cryptoSymbol) {
      setCryptoAlert({ severity: 'error', message: "Введите код валюты (BTC, ETH...)" });
      return;
    }
  
    try {
      const response = await axios.get(`${API_URL}/api/crypto/${cryptoSymbol.toUpperCase()}`);
      const price = response.data.price;
  
      setCryptoAlert({
        severity: 'success',
        message: `Курс ${cryptoAmount} ${cryptoSymbol.toUpperCase()}: $${(price * parseFloat(cryptoAmount)).toFixed(2)}`
      });      
    } catch {
      setCryptoAlert({ severity: 'error', message: "Ошибка при получении курса валюты" });
    }
    
  };
  

  return (
    <>
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 270, padding: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 2 }}>
            <Avatar sx={{ width: 56, height: 56 }} />
            <Typography variant="h6">{currentUserName || 'Пользователь'}</Typography>
          </Box>
          <Button fullWidth sx={{ marginBottom: 2 }} onClick={handleProfileClick}>
            Профиль <AccountBoxIcon />
          </Button>
          <Button fullWidth sx={{ marginBottom: 2 }}>Создать группу <GroupsIcon /></Button>
          <Button fullWidth sx={{ marginBottom: 2 }}>Настройки <SettingsIcon /></Button>
          <Button fullWidth sx={{ marginBottom: 2 }} onClick={() => navigate("/chat-app/ai")}> AI BOT <BedtimeOutlinedIcon /></Button>
          <Button fullWidth sx={{ marginBottom: 2 }} onClick={handleCryptoClick}>
            CryptoPrice <AttachMoneyIcon />
          </Button>
          <Button fullWidth onClick={handleLogout}>
            Выход <LogoutIcon sx={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }} />
          </Button>
        </Box>
      </Drawer>

      <ProfileModal 
        open={isProfileModalOpen} 
        onClose={handleCloseProfileModal} 
        user={{ name: currentUserName, email: currentUserEmail }} 
      />

      <Modal open={isCryptoModalOpen} onClose={handleCloseCryptoModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'white',
          p: 3,
          borderRadius: 2,
          boxShadow: 24
        }}>
          
          {cryptoAlert && (
            <Alert 
              severity={cryptoAlert.severity} 
              sx={{ mb: 2 }}
              onClose={() => setCryptoAlert(null)}
            >
              {cryptoAlert.message}
            </Alert>
          )}
          
          <TextField 
            label="Количество" 
            fullWidth 
            value={cryptoAmount} 
            onChange={(e) => setCryptoAmount(e.target.value)} 
            sx={{ mb: 2 }} 
          />
          <TextField 
            label="Код валюты (BTC, ETH...)" 
            fullWidth 
            value={cryptoSymbol} 
            onChange={(e) => setCryptoSymbol(e.target.value)} 
            sx={{ mb: 2 }} 
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleSendCryptoRequest}>
            Получить курс
          </Button>
        </Box>
      </Modal>
    </>
  );
};

Menu.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  currentUserName: PropTypes.string.isRequired,
  currentUserEmail: PropTypes.string.isRequired,
};

export default Menu;
