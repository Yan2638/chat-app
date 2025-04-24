import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Avatar, Typography, Box } from '@mui/material';
import PropTypes from 'prop-types';

const ProfileModal = ({ open, onClose, user }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Мой профиль</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: "flex", flexDirection: "line", alignItems: "center", marginBottom: 2 }}>
        <Avatar sx={{ width: 100, height: 100, marginBottom: 2 }} />
        <Typography variant="h6">{user.name}</Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">{user.email}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ProfileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired
};

export default ProfileModal;
