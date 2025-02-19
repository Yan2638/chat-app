import { StyledEngineProvider } from "@mui/material";
import Chat from "./components/chat/Chat.jsx";
// import Detail from "./components/detail/Detail.jsx";
import List from "./components/list/List.jsx";
import Message from "./components/chat/Message.jsx";
import './index.css';
import Login from "./components/sign-in/Login.jsx"

const App = () => {
  const user = true;

  return (
    <div className='container'>
      {user ? (
        <>
      <StyledEngineProvider injectFirst>
        <List/>
        <Chat/>
        <Message/>
      </StyledEngineProvider>
      </>
      ) : (
        <Login />
      )}
    </div>
  );
};
export default App
