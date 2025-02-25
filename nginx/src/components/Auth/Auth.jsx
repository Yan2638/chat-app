import { useState, useEffect } from "react";
import "./auth.css";
import { Button, Box, Dialog, DialogTitle, DialogContent, Stack, TextField, FormControlLabel, IconButton, Checkbox, } from '@mui/material';
import Close from "@mui/icons-material/Close";
import axios from "axios";


const Authentication = () => {
    const [openSI, setOpenSi] = useState(false); 
    const [openSU, setOpenSu] = useState(false);  
    const [agree, setAgree] = useState(false);    
    const [loginData, setLoginData] = useState({email:"",password:""});
    const [registerData, setRegisterData] = useState({email:"",name:"",password:"",confirmPassword:""});


    const handleOpenSI = () => setOpenSi(true);
    const handleOpenSU = () => setOpenSu(true);
    const handleCloseSI = () => setOpenSi(false);
    const handleCloseSU = () => setOpenSu(false);

    const handleLoginChange = (e) => setLoginData({...loginData,[e.target.name]: e.target.value})
    const handleRegisterChange = (e) => setRegisterData({...registerData,[e.target.name]: e.target.value}) 
    
    const API_URL = "http://localhost:3000"
    axios.defaults.withCredentials = true;

    const handleLogin = async () => {
        try {
          const response = await axios.post(
            `${API_URL}/login`,
            { email: loginData.email, password: loginData.password },
            { withCredentials: true }
          );
          
          console.log('Авторизация успешна', response.data);
          window.location.href = '/chat';
        } catch (error) {
          console.error('Ошибка при логине', error.response?.data?.error || error);
        }
      };

        const handleRegister = async () => {
            const { name, email, password } = registerData
            try {
              const response = await axios.post(
                `${API_URL}/register`,
                { username: name, email, password },
                { withCredentials: true } 
              );
              
              console.log('Регистрация успешна', response.data);
              window.location.href = '/chat'; 
            } catch (error) {
              console.error('Ошибка при регистрации', error.response?.data?.error || error);
            }
          };

          const checkAuth = async () => {
            try {
              const response = await axios.get(
                `${API_URL}/auth-check`,
                { withCredentials: true } 
              );
              
              console.log('Пользователь авторизован', response.data);
            } catch (error) {
              console.error('Пользователь не авторизован', error.response?.data?.error || error);
            }
          };

          useEffect(() => {
            checkAuth();
        }, []);

    return (

<Box maxWidth="xs" display="flex" flexDirection="row" gap={15}>
<Button onClick={handleOpenSI} className="button" variant="contained">Sign-In</Button>
<Dialog open={openSI} onClose={handleCloseSI} fullWidth maxWidth="sm">
    <DialogTitle>Sign-In</DialogTitle>
    <DialogContent>
        <Stack spacing={2} margin={2}>
            <TextField name="email" label="Email" value={loginData.email} onChange={handleLoginChange}></TextField>
            <TextField name="password" label="Password" type="password" value={loginData.password} onChange={handleLoginChange}></TextField>
            <Button color="primary" variant="contained" onClick={handleLogin}>Login</Button>
        </Stack>
    </DialogContent>
</Dialog>
<Button onClick={handleOpenSU} className="button" variant="contained">Sign-Up</Button>
<Dialog open={openSU} onClose={handleCloseSU} fullWidth maxWidth="sm">
    <DialogTitle>Sign-Up<IconButton style={{float:"right"}} onClick={handleCloseSU}><Close color="primary"/></IconButton></DialogTitle>
    <DialogContent>
        <Stack spacing={2} margin={2}>
            <TextField name="name" label="Name" value={registerData.name} onChange={handleRegisterChange}></TextField>
            <TextField name="email" label="Email" value={registerData.email} onChange={handleRegisterChange}></TextField>
            <TextField name="password" label="Password" type="password" value={registerData.password || ""} onChange={handleRegisterChange}></TextField>
            <TextField name="confirmPassword" label="Confirm Password" type="password" value={registerData.confirmPassword || ""} onChange={handleRegisterChange}></TextField>
            <FormControlLabel control={<Checkbox checked={agree} onChange={(e)=> setAgree(e.target.checked)} color="primary"></Checkbox>} label="Agree terms & conditions"/>
            <Button color="primary" variant="contained" disabled={!agree} onClick={handleRegister}>Submit</Button>
        </Stack>
    </DialogContent>
</Dialog>
</Box>
    )
};
export default Authentication;