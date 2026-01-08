"use client"

import { WebSocket_URL } from "@/config/config";
import { useEffect, useState } from "react";

export const useSocket = (RoomId:string) => {
    const [loading, setloading] = useState<Boolean>(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() =>{
        const ws = new WebSocket(`${WebSocket_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOThkMDE3ZS1iMjBiLTQwM2YtYTI4MS0xNGFhNDRlNDE3ZmEiLCJpYXQiOjE3Njc1MjU2MjV9.lJeQNR4URy86qV6_pWXuejriwuD035mwouLOVlhVmqg`)
        ws.onopen = ()=>{
            setSocket(ws);
            const data = JSON.stringify({
                type:"join_room",
                roomId: RoomId
            })
            ws.send(data);
            setloading(false);
        }
    } ,[RoomId]);
    return {socket, loading};
}