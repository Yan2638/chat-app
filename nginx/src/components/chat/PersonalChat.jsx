// import { useState } from 'react';
// import { List as MuiList, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider, TextField, Box, Modal, Button, Alert } from '@mui/material';
// import { Chat as ChatIcon } from '@mui/icons-material';
// import AddIcon from '@mui/icons-material/Add';

// const fetchUserById = async (userId) => {
//   const response = await fetch(`http://localhost:3000/user/${userId}`);
//   if (!response.ok) {
//     throw new Error('Пользователь не найден');
//   }
//   return await response.json();
// };

// const createChat = async (senderId, userId2) => {
//   const response = await fetch('http://localhost:3000/createChat', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ senderId, userId2 }),
//   });

//   if (!response.ok) {
//     throw new Error('Ошибка при создании чата');
//   }

//   return await response.json();
// };

// const ChatList = () => {
//   const [search, setSearch] = useState('');
//   const [openModal, setOpenModal] = useState(false);
//   const [userId, setUserId] = useState('');
//   const [error, setError] = useState(null);
//   const [chatsList, setChatsList] = useState([]);

//   const filteredData = chatsList.filter(item => {
//     const name = item.name;
//     return name && name.toLowerCase().includes(search.toLowerCase());
//   });

//   const handleOpenModal = () => {
//     setOpenModal(true);
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     setUserId('');
//     setError(null);
//   };

//   const handleCreateChat = async () => {
//     if (userId.trim()) {
//       try {
//         const user = await fetchUserById(userId);
//         const currentUserId = 1;  // Если всегда 1, оставьте так, иначе передавайте из состояния
//         const newChat = await createChat(currentUserId, user.id);
//         setChatsList((prevChatsList) => [...prevChatsList, newChat]);
//         handleCloseModal();
//       } catch {
//         setError('Пользователь не найден');
//       }
//     } else {
//       setError('Введите ID пользователя');
//     }
//   };

//   return (
//     <div className="sidebar">
//       <Box sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
//         <TextField
//           fullWidth
//           variant="outlined"
//           placeholder="Поиск чатов"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           sx={{
//             mt: 2,
//             borderRadius: 4,
//             '& .MuiOutlinedInput-root': {
//               borderRadius: '16px',
//               height: '40px',
//               '& fieldset': { borderWidth: '2px' },
//             },
//           }}
//         />
//         <Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ marginTop: 2 }}>
//           <AddIcon />
//         </Button>
//       </Box>

//       <Box className="chatList">
//         <MuiList sx={{ width: '100%', maxWidth: 360 }}>
//           {filteredData.map((chat) => (
//             <React.Fragment key={chat.id}>
//               <ListItem alignItems="flex-start">
//                 <ListItemAvatar>
//                   <Avatar>
//                     <ChatIcon />
//                   </Avatar>
//                 </ListItemAvatar>
//                 <ListItemText
//                   primary={chat.name}
//                   secondary={
//                     <>
//                       <Typography component="span" variant="body2" color="text.primary">
//                         {chat.lastMessage}
//                       </Typography>
//                       {` — ${chat.timestamp}`}
//                     </>
//                   }
//                 />
//               </ListItem>
//               <Divider variant="inset" component="li" />
//             </React.Fragment>
//           ))}
//         </MuiList>
//       </Box>

//       <Modal open={openModal} onClose={handleCloseModal}>
//         <Box sx={{ ...modalStyles }}>
//           <Typography variant="h6">Создать новый чат</Typography>

//           <TextField
//             label="ID собеседника"
//             fullWidth
//             value={userId}
//             onChange={(e) => setUserId(e.target.value)}
//             sx={{ mb: 2 }}
//           />

//           {error && <Alert severity="error">{error}</Alert>}

//           <Box sx={{ textAlign: 'right' }}>
//             <Button variant="outlined" onClick={handleCloseModal}>Отмена</Button>
//             <Button variant="contained" color="primary" onClick={handleCreateChat}>Создать</Button>
//           </Box>
//         </Box>
//       </Modal>
//     </div>
//   );
// };

// const modalStyles = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   backgroundColor: 'white',
//   padding: 4,
//   borderRadius: 2,
//   boxShadow: 3,
//   width: '300px',
// };

// export default ChatList;
