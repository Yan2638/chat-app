import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import axios from "axios";
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import "./chat.css";
import {API_URL} from '../../constants'

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: `2px solid ${theme.palette.background.paper}`,
  },
}));



export default function Header() {
  const [name, setName] = useState("Гость");

  useEffect(() => {
    axios.get(`${API_URL}/auth-check`, { withCredentials: true })
      .then((res) => {
        setName(res.data.user.Name || "Гость");
      })
      .catch(() => {
        setName("Гость");
      });
  }, []);


  return (
    <Box className="header">
      <Box display="flex" alignItems="center" justifyContent="space-between" padding={2}>
        <Box display="flex" alignItems="center">
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar alt={name} sx={{ width: 50, height: 50 }} />
          </StyledBadge>
          <Typography variant="h6" sx={{ marginLeft: 2, color: "black" }}>
            {name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '25px' }}>
        <PhoneIcon className='phoneIcon' fontSize="large" />
        </Box>
      </Box>
    </Box>
  );
}
