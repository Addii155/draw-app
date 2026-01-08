import { useEffect, useState } from "react"
import { WebSocket_URL } from "../config";


function useSocket()
{
    const [loading,setloading] = useState(true);
    const [Socket,setSocket] = useState<WebSocket | null>(null)
    useEffect(()=>{
        const ws = new WebSocket(`${WebSocket_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOThkMDE3ZS1iMjBiLTQwM2YtYTI4MS0xNGFhNDRlNDE3ZmEiLCJpYXQiOjE3NjY3MjI0ODV9.un3FHw7zKATENMZRW3vBEm4lhu6E1KS3w2gyXWyIags`)
        ws.onopen=()=>{
            console.log("WebSocket connected")
            setloading(false);
            setSocket(ws);
        }
        ws.onerror = (error) => {
            console.error("WebSocket error:", error)
            setloading(false);
        }
        ws.onclose = () => {
            console.log("WebSocket closed")
            setSocket(null);
            setloading(true);
        }
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        }
    },[]);
    return {
        Socket,
        loading
    }
}
export default useSocket