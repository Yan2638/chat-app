import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import "./chat.css";

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
  return (
    <Box className="header">
      <Box display="flex" alignItems="center" justifyContent="space-between" padding={2}>
        <Box display="flex" alignItems="center">
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar
              alt="Yan Zimnitski"
              src="/static/images/avatar/1.jpg"
              sx={{ width: 50, height: 50 }}
            />
          </StyledBadge>
          <Typography variant="h5" color="white" sx={{ marginLeft: 2 }}>
            Yan Zimnitski
          </Typography>
        </Box>
        <PhoneIcon className='phoneIcon' color="white" fontSize="large"/>
      </Box>
    </Box>
  );
}
