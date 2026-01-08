import CanvasRoom from '@/components/CanvasRoom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import React from 'react'

const page = async ( {params}:
    {
        params: {
            roomId: string
        }
    }
) => {
    const roomId = (await params).roomId
    
  return (
      <ProtectedRoute>
        <CanvasRoom roomId={roomId} />    
      </ProtectedRoute>
  )
}

export default page