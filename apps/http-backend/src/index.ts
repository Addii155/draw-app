import express from 'express';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';
import { JWT_SECRET } from "@repo/backend-common/config"
import {CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types"
import  { prisma }  from '@repo/db/prisma';
import  bbcrypt  from "bcryptjs";
import cors from 'cors';
const app = express() ;


app.use(express.json()) 
app.use(cors({
  origin: "*",
  credentials: false
}))



app.post("/singup", async(req,res)=>{

    const PareseData = CreateUserSchema.safeParse(req.body);

    if(!PareseData.success)
    {
        return res.json({
            message:"Incorrect Input"
        })
    }

    try {
        const salt = await bbcrypt.genSalt(10);
        const hash = await bbcrypt.hash(PareseData.data.password,salt)

        const user  = await prisma.user.create({
            data:{
                email: PareseData.data.email,
                password : hash,
                name: PareseData.data.username
            }
        })
         res.json({
            userId: user.id
        })
    } catch (error) {
        
          res.status(411).json({
            message: error
        })
    }


    
})

app.post("/signin", async(req,res)=>{

    const data = SigninSchema.safeParse(req.body)

    if(!data.success)
    {
        return res.json({
            message:"invalid input"
        })
    }

    try {
        
        const user = await prisma.user.findFirst(
            {
                where:{
                    email:data.data.email
                }
            }
        )
        if(!user)
        {
            return res.json({
                message:"Invalid credentials"
            })
        }

        const ispass = await bbcrypt.compare(data.data.password, user.password)
        if(!ispass)
        {
            return res.json({
                message:"Invalid password"
            })
        }
        
        const token = jwt.sign({userId: user.id}, JWT_SECRET);
        
        return res.json({
            token,
            user
        })
    } catch (error) {
          res.status(411).json({
            message: error
        })
    }

})

app.post("/room",middleware,async(req,res)=>{

    const safeParse = CreateRoomSchema.safeParse(req.body);

    if(!safeParse.success)
    {
        return res.json({
            message:"Invalid input"
        })
    }

    try {
        const userId = req.userId;
        
        if(!userId) {
            return res.status(403).json({
                message: "Unauthorized - no userId"
            })
        }

        const room = await prisma.room.create({
            data:{
                slug: safeParse.data.name,
                adminId: userId
            }
        });

        return res.json({
            roomId: room.id
        })
    } catch (error) {
        res.status(411).json({
            message: "Error creating room"
        })
    }

})

app.get("/chat/:roomId",async(req,res)=>{
    const roomId = Number(req.params.roomId)
    try {
        const lastMsg = await prisma.chat.findMany({
            where:{
                roomId:roomId
            },
            orderBy:{
                id: 'desc'
            }
        })
        return res.json({
            lastMsg
        })
        
    } catch (error) {
        return res.json({
            message:"Invalid room id"
        })
    }
})

app.get('/room/:slug', async(req,res)=>{
    const slug = req.params.slug;
    
    if(!slug || slug.trim() === "") {
        return res.status(400).json({
            message: "Slug is required"
        })
    }

    try {
        const room = await prisma.room.findFirst({
            where:{
                slug
            }
        })
        
        if(!room) {
            return res.status(404).json({
                message: "Room not found"
            })
        }
        
        return res.json({
            roomId: room.id,
            slug: room.slug
        })
            
    } catch (error) {
        console.error("Room fetch error:", error);
        return res.status(500).json({
            message: "Invalid slug or server error"
        })
    }
})

app.get("/allrooms",async(req , res)=>{
    try {

        const allRooms = await prisma.room.findMany();
        return res.json({
            allRooms
        })
        
    } catch (error) {
        return res.json({
            message:"error fectching rooms"
        })
    }
})

app.listen(4000,()=>{
    console.log("Server started on port 4000")
})