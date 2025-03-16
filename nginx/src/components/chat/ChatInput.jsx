import { useState, useEffect, useRef } from 'react';
import { TextField, Box, IconButton, Popper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiPicker from 'emoji-picker-react';
import { EmojiEmotions } from '@mui/icons-material';
import './chat.css';
import PropTypes from 'prop-types';

const ChatInput = ({ onSendMessage }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSendMessage = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  return (
    <Box className="chat-input">
      <IconButton onClick={() => setOpen((prev) => !prev)} aria-label="Выбрать эмодзи">
        <EmojiEmotions className="emojiPicker" />
      </IconButton>
      <TextField
        className="chatInput"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        variant="outlined"
        placeholder="Введите сообщение..."
        fullWidth
        sx={{
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#6c7d9f',
            },
            '&:hover fieldset': {
              borderColor: '#6c7d9f',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6c7d9f',
            },
          },
        }}
      />
      <IconButton onClick={handleSendMessage} color="primary" disabled={!text.trim()} aria-label="Отправить сообщение">
        <SendIcon className="sendIcon" />
      </IconButton>
      {open && (
        <Popper open={open} anchorEl={emojiPickerRef.current} placement="top-end">
          <Box ref={emojiPickerRef}>
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </Box>
        </Popper>
      )}
    </Box>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
};

export default ChatInput;