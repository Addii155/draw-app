import axios from 'axios';

import { Backend_Url } from '../config';
import ChatRoomClient from './ChatRoomClient';
async function getChat(roomId:Number){
    const res = await axios.get(`${Backend_Url}/chat/${roomId}`)
    console.log(res)
    return res.data.lastMsg;
}

const ChatRoom = async({ roomId }: { roomId: Number }) => {

    // const [chat, setchat] = useState<string[]>([]);
    const msg = await getChat(roomId);
    console.log(msg+" from ChatRoom component")
  return (
    <ChatRoomClient msg ={msg} id={roomId} ></ChatRoomClient>
  )
}

export default ChatRoom