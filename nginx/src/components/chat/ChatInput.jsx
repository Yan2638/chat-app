import { useState } from 'react';
import { TextField, Box, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiPicker from 'emoji-picker-react';
import { EmojiEmotions } from '@mui/icons-material';
import './chat.css';
import PropTypes from 'prop-types';

const ChatInput = ({onSendMessage}) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const handleSendMessage = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };
  const handleEmoji = (e) => {
      setText((prev) => prev +e.emoji);
      setOpen(false);
  };

  return (
    <Box className="chat-input">
      <IconButton onClick={() => setOpen((prev) => !prev)}>
        <EmojiEmotions className='emojiPicker'/>
      </IconButton>
      <TextField
        value={text}
        onChange={(e) => setText(e.target.value)}
        variant="outlined"
        placeholder="Введите сообщение..."
        fullWidth
        sx={{
          backgroundColor: 'solid',
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#444',
            },
            '&:hover fieldset': {
              borderColor: '#888',
            },
          },
        }}
      />
      <IconButton onClick={handleSendMessage} color="primary" disabled={!text.trim()}>
        <SendIcon className='sendIcon'/>
      </IconButton>
      {open && (
        <Box sx={{ position: 'absolute', bottom: 60, right: 20 }}>
          <EmojiPicker open={open} onEmojiClick={handleEmoji} />
        </Box>
      )}  
    </Box>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
};

export default ChatInput;
