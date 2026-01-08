import axios from 'axios'
import React from 'react'
import { Backend_Url } from '../../../config'
import ChatRoom from '../../../components/ChatRoom';

async function getRoomId(slug:string)
{
    const res = await axios.get(`${Backend_Url}/room/${slug}`);
    return res.data.roomId;
}


const  page = async({ params }
    :
    {
        params:{
            id:string
        }

    }
) =>  {
    const slug = (await params).id
    console.log(slug)
    const roomId = await getRoomId(slug)
    return (
        <>
        <h1>{roomId}</h1>
        <ChatRoom roomId={roomId} />
        </>
    )
}

export default page