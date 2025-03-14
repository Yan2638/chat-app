import { useState, useEffect } from 'react';
import { List as MuiList, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider, TextField, Box, Modal, Button, Alert, IconButton, InputAdornment } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router';
import './list.css';
import {API_URL} from '../../constants'

const ChatList = () => {
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(null);
  const [chatsList, setChatsList] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/auth-check`, { credentials: 'include' });
        if (!response.ok) throw new Error('Ошибка получения пользователя');
        const data = await response.json();
        setCurrentUserId(data.id);
      } catch (error) {
        setError(error.message);
        console.error('Ошибка получения пользователя:', error);
      }
    };

    const fetchChats = async () => {
      try {
        const response = await fetch(`${API_URL}/chats`, { method: 'GET', credentials: 'include' });
        if (!response.ok) throw new Error('Ошибка при получении чатов');
        const chats = await response.json();
        setChatsList(chats);
      } catch (error) {
        setError(error.message);
        console.error('Ошибка при получении чатов:', error);
      }
    };

    fetchCurrentUser();
    fetchChats();
  }, []);

  const filteredChats = chatsList.filter(chat => chat.sender_id === currentUserId || chat.receiver_id === currentUserId);

  const navigate = useNavigate();
  const handleChatClick = (chatId) => navigate(`/chat-app/chat/${chatId}`);

  const handleCreateChat = async () => {
    if (!userId.trim()) return setError('Введите ID пользователя');
    if (userId === currentUserId) return setError('Невозможно создать чат с самим собой');
    
    const existingChat = chatsList.find(chat => 
      (chat.sender_id === userId && chat.receiver_id === currentUserId) || 
      (chat.sender_id === currentUserId && chat.receiver_id === userId)
    );
    if (existingChat) return setError('Чат уже существует');

    try {
      const response = await fetch(`${API_URL}/createChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId2: parseInt(userId, 10) }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.message);
      }

      const newChat = await response.json();
      setChatsList([...chatsList, newChat]); 
      setOpenModal(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка при создании чата:', err);
    }
  };

  return (
    <div className="sidebar">
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1, mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск чатов"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              height: '40px',
              '& fieldset': { borderWidth: '2px', borderColor: '#6c7d9f' },
              '&:hover fieldset': {
                borderColor: '#6c7d9f',
              },
              '&.Mui-focused fieldset': {
        borderColor: '#6c7d9f',
            },
            },
          }}
          slotProps={{
            input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setOpenModal(true)}>
                  <AddIcon />
                </IconButton>
              </InputAdornment>
            ),
          }
          }}
        />
      </Box>

      <Box className="chatList">
        {filteredChats.length === 0 ? (
          <Typography>Нет чатов</Typography>
        ) : (
          <MuiList sx={{ width: '100%', maxWidth: 360 }}>
            {filteredChats.map((chat) => {
              const isSender = chat.sender_id === currentUserId;
              const userName = isSender ? chat.receiver_name : chat.sender_name;

              return (
                <ListItem key={chat.id} alignItems="flex-start" onClick={() => handleChatClick(chat.id)}>
                  <ListItemAvatar>
                    <Avatar>
                      <ChatIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${userName} (ID: ${chat.id})`}  
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
              );
            })}
          </MuiList>
        )}
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyles}>
          <Typography variant="h6">Создать новый чат</Typography>
          <TextField
            label="ID собеседника"
            fullWidth
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>Отмена</Button>
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
