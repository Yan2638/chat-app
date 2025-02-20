import { StyledEngineProvider } from "@mui/material";
import Chat from "./components/chat/Chat.jsx";
// import Detail from "./components/detail/Detail.jsx";
import List from "./components/list/List.jsx";
import Message from "./components/chat/Message.jsx";
import './index.css';
import Auth from "./components/Auth/Auth.jsx"

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
        <Auth />
      )}
    </div>
  );
};
export default App
