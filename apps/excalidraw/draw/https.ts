import { HTTP_URL } from "@/config/config";
import axios from "axios";

export async function getexistingShapesFromDB(roomId:string){
    try {
        const res = await axios.get(`${HTTP_URL}/chat/${roomId}`);
        return res.data;
    } catch (error) {
        console.log("Error fetching existing shapes:", error);
    }
}

export async function getAllROOM()
{
    try {
        const res = await axios.get(`${HTTP_URL}/allrooms`)
        return res.data;
    } catch (error) {
        console.log("error while fectching all room ")
    }
}