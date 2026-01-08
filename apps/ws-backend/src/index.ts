import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { prisma } from "@repo/db/prisma";

interface User {
    ws: WebSocket,
    rooms: string[]
    userId: string
}

const users: User[] = [];

const ws = new WebSocketServer({ port: 8080 });

function checkUserToken(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || typeof decoded === 'string') {
            return null
        }
        if (!decoded.userId) {
            return null
        }
        return decoded.userId;
    } catch (error) {
        console.log(error)
        return null
    }

}

ws.on("connection", function connection(ws, request) {

    const url = request.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get('token') || "";
    const userid = checkUserToken(token);
    console.log(userid)

    if (!userid) {
        ws.close();
        return null;
    }
    users.push({
        rooms: [],
        userId: userid,
        ws
    })


    ws.on("message", async function message(data) {

        let parseData;
        try {
            if (typeof data !== 'string') {
                parseData = JSON.parse(data.toString());
            }
            else {
                parseData = JSON.parse(data)
            }
        } catch (error) {
            console.log("Failed to parse message:", error)
            return;
        }

        if (parseData.type === 'join_room') {
            const user = users.find(x => x.ws === ws);
            if (!user) {
                return;
            }
            if (!user.rooms.includes(parseData.roomId)) {
                user.rooms.push(parseData.roomId)
            }

        }
        if (parseData.type === 'leave_room') {
            const user = users.find(x => x.ws === ws)
            if (!user) {
                return null;
            }
            user.rooms = user?.rooms.filter(x => x !== parseData.roomId)
        }
        console.log("message received")
        console.log(parseData);
        if (parseData.type === 'chat') {

            const roomId = parseData.roomId;
            const msg = parseData.message

            users.forEach(userItem => {
                if (userItem.rooms.includes(roomId)) {
                    userItem.ws.send(JSON.stringify({
                        type: "chat",
                        message: msg,
                        roomId: roomId
                    }))
                }
            }
            )
            await prisma.chat.create({
                data: {
                    message: msg,
                    userId:userid,
                    roomId:Number(roomId)
                }
            })


        }
        console.log(users)

    });

    ws.on("close", function close() {
        const userIndex = users.findIndex(x => x.ws === ws);
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            console.log("User disconnected");
        }   
    });

});