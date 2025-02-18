import { StyledEngineProvider } from "@mui/material";
import Chat from "./components/chat/chat.jsx";
// import Detail from "./components/detail/Detail.jsx";
import List from "./components/list/List.jsx";
import Message from "./components/chat/message.jsx";
import './index.css';


const App = () => {

  return (
    <div className='container'>
      <StyledEngineProvider injectFirst>
        <List/>
        <Chat/>
        <Message/>
      </StyledEngineProvider>
    </div>
  )
}
export default App
