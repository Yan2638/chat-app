import { ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import "./list.css"


const ChatItem = ({ chat, currentUserId }) => {
  const navigate = useNavigate();
  const isSender = chat.sender_id === currentUserId;
  const userName = isSender ? chat.receiver_name : chat.sender_name;

  console.log("chat object:", chat);


  return (
    <>
      <ListItem alignItems="flex-start" onClick={() => navigate(`/chat-app/chat/${chat.id}`)} button>
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
                {chat?.last_message || 'Нет сообщений'}
              </Typography>
              {chat.timestamp ? ` — ${chat.timestamp}` : ''}
            </>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};

ChatItem.propTypes = {
    chat: PropTypes.shape({
      sender_id: PropTypes.number.isRequired,
      receiver_name: PropTypes.string.isRequired,
      sender_name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      last_message: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired
    }).isRequired,
    currentUserId: PropTypes.number.isRequired
  };
  
  export default ChatItem;
