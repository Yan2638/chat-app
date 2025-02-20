import {useState} from 'react';
import { List as MuiList, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider, TextField, InputAdornment } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import './list.css';

const chats = [
  {
    id: 1,
    name: 'Чат 1',
    lastMessage: 'AaAaAaAaAaA',
    timestamp: '10:30',
  },
  {
    id: 2,
    name: 'Чат 2',
    lastMessage: 'BbBbBbBbBbB',
    timestamp: '10:40',
  },
  {
    id: 3,
    name: 'Чат 3',
    lastMessage: 'CcCcCcCcCcC',
    timestamp: '10:50',
  },
  {
    id: 4,
    name: 'Чат 4',
    lastMessage: 'VvVvVvVvVvV',
    timestamp: '11:00',
  },
  {
    id: 5,
    name: 'Чат 5',
    lastMessage: 'RrRrRrRrRrR',
    timestamp: '09:15',
  },
  {
    id: 6,
    name: 'Чат 6',
    lastMessage: 'YyYyYyYyYyY',
    timestamp: 'Вчера',
  },
  {
    id: 7,
    name: 'Чат 7',
    lastMessage: 'EeEeEeEeE',
    timestamp: '10:30',
  },
  {
    id: 8,
    name: 'Чат 8',
    lastMessage: 'WwWwWwWwW',
    timestamp: '09:15',
  },
  {
    id: 9,
    name: 'Чат 9',
    lastMessage: 'QqQqQqQqQ',
    timestamp: 'Вчера',
  },
];

const ChatList = () => {
    const [search, setSearch] = useState('');
  
    const filteredChats = chats.filter((chat) =>
      chat.name.toLowerCase().includes(search.toLowerCase())
    );
  
    return (
      <div className="sidebar">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск чатов"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            },
          }}
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
        
        <MuiList sx={{ width: '100%', maxWidth: 360, bgcolor: 'solid' }}>
          {filteredChats.map((chat) => (
            <React.Fragment key={chat.id}>
              <ListItem alignItems="flex-start">
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
                        {chat.lastMessage}
                      </Typography>
                      {` — ${chat.timestamp}`}
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </MuiList>
      </div>
    );
};

export default ChatList;
