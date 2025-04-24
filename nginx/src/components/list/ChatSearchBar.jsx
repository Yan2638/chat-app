import { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton, Modal, Box, Typography, Button, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types';
import "./list.css";

const ChatSearchBar = ({ search, setSearch, setOpenMenu }) => {
  const [openModal, setOpenModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(null);
  const [chatsList, setChatsList] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch('http://localhost:3000/auth-check', { credentials: 'include' });
        if (!userResponse.ok) throw new Error('Ошибка получения пользователя');
        const userData = await userResponse.json();

        const chatsResponse = await fetch('http://localhost:3000/chats', { credentials: 'include' });
        if (!chatsResponse.ok) throw new Error('Ошибка получения чатов');
        const chatsData = await chatsResponse.json();

        setCurrentUserId(userData.id);
        setChatsList(chatsData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const createChat = async (userId2) => {
    if (!userId2 || isNaN(userId2)) {
      setError('Неверный ID пользователя');
      return;
    }

    const chatData = { userId2: parseInt(userId2, 10) };

    try {
      const response = await fetch('http://localhost:3000/createChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.message);
      }

      const newChat = await response.json();
      setChatsList([...chatsList, newChat]);
      handleCloseModal();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка при создании чата:', err);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setUserId('');
    setError(null);
  };

  const handleCreateChat = async () => {
    if (!userId.trim()) {
      setError('Введите ID пользователя');
      return;
    }

    if (userId === currentUserId) {
      setError('Невозможно создать чат с самим собой');
      return;
    }

    const existingChat = chatsList.find(chat =>
      (chat.sender_id === userId && chat.receiver_id === currentUserId) ||
      (chat.sender_id === currentUserId && chat.receiver_id === userId)
    );

    if (existingChat) {
      setError('Чат уже существует');
      return;
    }

    await createChat(userId);
  };

  return (
    <>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Поиск чатов по ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mt: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            height: '40px',
            '& fieldset': { borderColor: '#6c7d9f' },
            '&:hover fieldset, &.Mui-focused fieldset': { borderColor: '#6c7d9f' },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setOpenMenu(true)}>
                <MenuIcon />
              </IconButton>
              <IconButton onClick={handleOpenModal}>
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyles}>
          <Typography variant="h6" sx={{ mb: 2 }}>Создать чат</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Введите ID пользователя"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={handleCloseModal} 
              sx={{ flex: 1, mr: 1 }}
            >
              Отмена
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCreateChat} 
              sx={{ flex: 1, ml: 1 }}
            >
              Создать
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: 24,
  width: '300px',
};

ChatSearchBar.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  setOpenMenu: PropTypes.func.isRequired,
};

export default ChatSearchBar;
