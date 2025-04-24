import { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, List as MuiList } from '@mui/material';
import ChatSearchBar from './ChatSearchBar';
import ChatItem from './ChatItem';
import MenuDrawer from './Menu';
import { API_URL } from '../../constants';
import "./list.css"


const ChatList = () => {
  const [search, setSearch] = useState('');
  const [chatsList, setChatsList] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [openMenu, setOpenMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/auth-check`, { credentials: 'include' });
        if (!response.ok) throw new Error('Ошибка получения данных о пользователе');
        const data = await response.json();
        setCurrentUserId(data.id); 
        setCurrentUserName(data.user.Name || "Гость"); 
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchChats = async () => {
      try {
        const response = await fetch(`${API_URL}/chats`, { method: 'GET', credentials: 'include' });
        if (!response.ok) throw new Error('Ошибка при получении чатов');
        const chats = await response.json();
        setChatsList(chats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
    fetchChats();
  }, []);

  const filteredChats = chatsList.filter(chat =>
    (chat.sender_id === currentUserId || chat.receiver_id === currentUserId) &&
    (!search || chat.id.toString().includes(search))
  );

  return (
    <div className="sidebar">
      <ChatSearchBar search={search} setSearch={setSearch} setOpenMenu={setOpenMenu} />
      
      <Box className="chatList">
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : filteredChats.length === 0 ? (
          <Typography>Нет чатов</Typography>
        ) : (
          <MuiList>
            {filteredChats.map(chat => (
              <ChatItem key={chat.id} chat={chat} currentUserId={currentUserId} />
            ))}
          </MuiList>
        )}
      </Box>

      <MenuDrawer open={openMenu} setOpen={setOpenMenu} currentUserName={currentUserName} />
    </div>
  );
};
console.log("Render ChatList")
export default ChatList;
