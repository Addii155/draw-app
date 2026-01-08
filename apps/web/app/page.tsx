'use client'
import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Backend_Url } from "../config";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${Backend_Url}/allrooms`);
        console.log(res);
        setRooms(res.data.allRooms);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  if(loading) return <h1>Loading rooms...</h1>
  if(!rooms || rooms.length === 0) return <h1>No rooms available</h1>

  return (
    <>
     {
       rooms.map((room:any) => <div 
        onClick={ (e)=>
          router.push(`/room/${room.slug}`)
        }
       key={room.id}>
         <h2>{room.slug}</h2>
       </div>)
     }
     <form onSubmit={handleSubmit}>
       <input value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room Id"
      />
      <button type="submit" style={{padding: 10}}>Join room</button>
     </form>
    </>
  );
}
