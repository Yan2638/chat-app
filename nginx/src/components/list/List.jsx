import { useState, useEffect } from 'react';
import { List as MuiList, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider, TextField, Box, Modal, Button, Alert } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import './list.css';

const ChatList = () => {
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(null);
  const [chatsList, setChatsList] = useState([]);
  const [currentUserId] = useState(1); 

  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:3000/chats', {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Ошибка при получении чатов');
      }
      return await response.json();
    } catch (error) {
      setError(error.message); 
      console.error('Ошибка при получении чатов:', error);
    }
  };

  const createChat = async (userId2) => {
    if (!userId2 || isNaN(userId2)) {
      setError('Неверный ID пользователя');
      return;
    }

    const chatData = {
      userId2: parseInt(userId2, 10)
    };

    try {
      const response = await fetch('http://localhost:3000/createChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(`Ошибка при создании чата: ${errorText.message}`);
      }

      const result = await response.json();
      console.log('Чат успешно создан:', result);
      return result;

    } catch (err) {
      setError(err.message); 
      console.error('Ошибка при создании чата:', err);
      return null;
    }
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

    try {
      const chats = await fetchChats();
      if (chats.some(chat => (chat.sender_id === userId && chat.receiver_id === currentUserId) || 
                              (chat.sender_id === currentUserId && chat.receiver_id === userId))) {
        setError('Чат уже существует');
        return;
      }
  
      const newChat = await createChat(userId);
  
      if (newChat) {  
        setChatsList([...chatsList, { id: Date.now(), name: `Чат ${currentUserId} - ${userId}`, sender_id: currentUserId, receiver_id: userId }]);
        handleCloseModal();
        setError(null);  
      }
    } catch (err) {
      setError(`Не удалось создать чат. Попробуйте еще раз. Ошибка: ${err.message}`);
      console.error('Ошибка при создании чата:', err);
    }
  };

  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await fetchChats();
        setChatsList(chats.filter(chat => chat.sender_id === currentUserId || chat.receiver_id === currentUserId)); 
      } catch (err) {
        setError('Ошибка при загрузке чатов');
        console.error('Ошибка при загрузке чатов:', err);
      }
    };

    loadChats();
  }, [currentUserId]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <div className="sidebar">
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск чатов"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mt: 2,
            borderRadius: 4,
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              height: '40px',
              '& fieldset': { borderWidth: '2px' },
            },
          }}
        />
        <Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ marginTop: 2 }}>
          <AddIcon />
        </Button>
      </Box>

      <Box className="chatList">
        {error && <Alert severity="error">{error}</Alert>}
        {chatsList.length === 0 ? (
          <Typography>Нет чатов</Typography>
        ) : (
          <MuiList sx={{ width: '100%', maxWidth: 360 }}>
            {chatsList.map((chat) => (
              <ListItem key={chat.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    <ChatIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={chat.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {chat.lastMessage || 'Нет сообщений'}
                      </Typography>
                      {chat.timestamp ? ` — ${chat.timestamp}` : ''}
                    </>
                  }
                />
                <Divider variant="inset" component="div" />
              </ListItem>
            ))}
          </MuiList>
        )}
      </Box>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyles}>
          <Typography variant="h6">Создать новый чат</Typography>

          <TextField
            label="ID собеседника"
            fullWidth
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            sx={{ mb: 2 }}
          />

          {error && <Alert severity="error">{error}</Alert>} {/* Выводим ошибку, если она есть */}

          <Box sx={{ textAlign: 'right' }}>
            <Button variant="outlined" onClick={handleCloseModal}>Отмена</Button>
            <Button variant="contained" color="primary" onClick={handleCreateChat}>Создать</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: 4,
  borderRadius: 2,
  boxShadow: 3,
  width: '300px',
};

export default ChatList;
