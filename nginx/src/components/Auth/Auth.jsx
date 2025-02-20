import { useState } from "react";
import "./auth.css"
import { Button, Box, Dialog, DialogTitle, DialogContent, Stack, TextField, FormControlLabel, IconButton, Checkbox, } from '@mui/material';
import Close from "@mui/icons-material/Close"


const Authentication = () => {
    const [openSI, setOpenSi] = useState(false); 
    const [openSU, setOpenSu] = useState(false);  
    const [agree, setAgree] = useState(false);    

    const handleOpenSI = () => setOpenSi(true);
    const handleOpenSU = () => setOpenSu(true);

    const handleCloseSI = () => setOpenSi(false);
    const handleCloseSU = () => setOpenSu(false);


    return (

<Box maxWidth="xs" display="flex" flexDirection="row" gap={15}>
<Button onClick={handleOpenSI} className="button" variant="contained">Sign-In</Button>
<Dialog open={openSI} onClose={handleCloseSI} fullWidth maxWidth="sm">
    <DialogTitle>Sign-In</DialogTitle>
    <DialogContent>
        <Stack spacing={2} margin={2}>
            <TextField label="Email"></TextField>
            <TextField label="Password"></TextField>
        </Stack>
    </DialogContent>
</Dialog>
<Button onClick={handleOpenSU} className="button" variant="contained">Sign-Up</Button>
<Dialog open={openSU} onClose={handleCloseSU} fullWidth maxWidth="sm">
    <DialogTitle>Sign-Up<IconButton style={{float:"right"}} onClick={handleCloseSU}><Close color="primary"/></IconButton></DialogTitle>
    <DialogContent>
        <Stack spacing={2} margin={2}>
            <TextField label="Name"></TextField>
            <TextField label="Email"></TextField>
            <TextField label="Password"></TextField>
            <TextField label="Confirm Password"></TextField>
            <FormControlLabel control={<Checkbox checked={agree} onChange={(e)=> setAgree(e.target.checked)} color="primary"></Checkbox>} label="Agree terms & conditions"/>
            <Button color="primary" variant="contained" disabled={!agree}>Submit</Button>
        </Stack>
    </DialogContent>
</Dialog>
</Box>
    )
};
export default Authentication;