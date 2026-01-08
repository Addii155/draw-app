'use client'
import React, { useEffect, useState } from 'react'
import useSocket from '../hooks/useSocket'

const ChatRoomClient = ({
    msg,
    id
}: {
    msg: { message: string }[];
    id:   Number
}) => {
    const [chat, setchat] = useState(msg)
    const [currmsg, setcurrmsg] = useState("")
    const { Socket, loading } = useSocket();

    useEffect(() => {
        if (Socket && !loading) {
            Socket.send(JSON.stringify({
                type: "join_room",
                roomId: String(id)
            }))
            const handleMessage = (event: Event) => {
                const messageEvent = event as MessageEvent;
                const parsedData = JSON.parse(messageEvent.data);
                if (parsedData.type === "chat") {
                    setchat(c => [...c, { message: parsedData.message }])
                }
            }
            Socket.addEventListener('message', handleMessage);
            return () => Socket.removeEventListener('message', handleMessage);
        }
    }, [Socket, loading, id])

    return (
        <div>
            {chat.map(m => 
                <div>{m.message}</div>
            )}
            <input type="text" value={currmsg} onChange={(e) => setcurrmsg(e.target.value)} />
            <button onClick={(e)=>{
                Socket?.send(JSON.stringify({
                    type:"chat",
                    message:currmsg,
                    roomId:String(id),
                }))
                setcurrmsg("")
            }}>
                Send
            </button>

        </div>
    )
}

export default ChatRoomClient
