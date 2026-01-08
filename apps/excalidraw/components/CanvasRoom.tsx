'use client'
import { Game } from '@/draw/Game';
import { useSocket } from '@/hooks/useSocket';
import React, {useState, useEffect, useRef, use } from 'react'

const CanvasRoom = ({ roomId }: { roomId: string }) => {

    const ref = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const [game, setGame] = useState<Game>();
    const [shape, setShape] = useState<"rect" | "circle" | "line">("rect");
    const {socket, loading} = useSocket(roomId);
    const [winddowwidth, setwinddowwidth] = useState(window.innerWidth);
    const [windowheight, setwindowheight] = useState(window.innerHeight);

    useEffect(()=>{
        if(game) {
            game.setShape(shape);
        }
    },[shape, game])

    const shapeChangeHandler = (newShape:"rect" | "circle" | "line")=>{
        setShape(newShape);
    }

    useEffect(() => {
        if (ref.current && !gameRef.current) {
            const newGame = new Game(ref.current, roomId, socket);
            gameRef.current = newGame;
            setGame(newGame);
        }
        
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy();
                gameRef.current = null;
            }
        }
    }, [ref, roomId, socket])

    useEffect(() => {
        const handleResize = () => {
            setwinddowwidth(window.innerWidth);
            setwindowheight(window.innerHeight);
            if (ref.current) {
                ref.current.width = window.innerWidth;
                ref.current.height = window.innerHeight;
            }
        };  
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };      
    }, []);

    if(!socket || loading)
    {
        return <div className='w-full h-full justify-center items-center flex'>
            <div className='text-2xl font-semibold'>
                Loading...
            </div>
            </div>
    }

    return (
       <div className='w-screen h-screen'>
            <div className='absolute top-4  z-10 bg-white p-2 rounded-md shadow-md flex space-x-2'>
            <button
                className={`px-4 py-2 rounded ${shape === "rect" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                    }`} 
                onClick={() => shapeChangeHandler("rect")}
            >
                Rectangle
            </button>
            <button
                className={`px-4 py-2 rounded ${shape === "circle" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                    }`}
                onClick={() => shapeChangeHandler("circle")}
            >
                Circle
            </button>
            <button
                className={`px-4 py-2 rounded ${shape === "line" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                    }`}
                onClick={() => shapeChangeHandler("line")}
            >
                Line
            </button>
            </div>
         <canvas  ref={ref} className='bg-black'  width={winddowwidth} height={windowheight } ></canvas>
       </div>
    )
}

export default CanvasRoom