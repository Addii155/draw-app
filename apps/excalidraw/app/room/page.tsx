'use client'
import { HTTP_URL } from '@/config/config'
import { getAllROOM } from '@/draw/https'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const page = () => {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [roomName, setRoomName] = useState('')
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const { user,token } = useAuth()

    const fetchRooms = async () => {
        setLoading(true)
        try {
            const data = await getAllROOM()
            setRooms(data.allRooms || [])
        } catch (err) {
            console.error('Error fetching rooms:', err)
            setError('Failed to load rooms')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRooms()
    }, [])

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!roomName.trim()) {
            setError('Room name cannot be empty')
            return
        }

        setCreating(true)
        setError('')
        try {
            const response = await axios.post(
                `${HTTP_URL}/room`,
                {
                    slug: roomName.trim(),
                    name: roomName.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            
            if (response.data?.id) {
                setRoomName('')
                setShowModal(false)
                await fetchRooms()
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create room')
            console.error('Error creating room:', err)
        } finally {
            setCreating(false)
        }
    }

    const handleRoomClick = (roomId: number) => {
        router.push(`/canvas/${roomId}`)
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
            {/* Header */}
            <div className='bg-white shadow-md'>
                <div className='max-w-6xl mx-auto px-6 py-8'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-800'>Rooms</h1>
                            <p className='text-gray-600 mt-1'>Manage and access your drawing rooms</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 shadow-md'
                        >
                            + Create Room
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='max-w-6xl mx-auto px-6 py-12'>
                {error && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6'>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className='flex justify-center items-center h-64'>
                        <div className='text-center'>
                            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4'></div>
                            <p className='text-gray-600'>Loading rooms...</p>
                        </div>
                    </div>
                ) : rooms && rooms.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {rooms.map((room: any) => (
                            <div
                                key={room.id}
                                onClick={() => handleRoomClick(room.id)}
                                className='bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer overflow-hidden transform hover:scale-105'
                            >
                                <div className='bg-gradient-to-r from-indigo-500 to-blue-500 h-32 flex items-center justify-center'>
                                    <div className='text-white text-4xl'>🎨</div>
                                </div>
                                <div className='p-6'>
                                    <h3 className='text-xl font-bold text-gray-800 mb-2 truncate'>
                                        {room.slug}
                                    </h3>
                                    <p className='text-gray-600 text-sm mb-4'>
                                        Created on {new Date(room.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className='flex items-center text-xs text-gray-500'>
                                        <span className='bg-gray-100 px-3 py-1 rounded-full'>
                                            Room #{room.id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-16'>
                        <div className='text-6xl mb-4'>📭</div>
                        <h2 className='text-2xl font-bold text-gray-800 mb-2'>No rooms yet</h2>
                        <p className='text-gray-600 mb-6'>Create your first room to get started</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200'
                        >
                            Create First Room
                        </button>
                    </div>
                )}
            </div>

            {/* Create Room Modal */}
            {showModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
                        <h2 className='text-2xl font-bold text-gray-800 mb-4'>Create New Room</h2>
                        
                        <form onSubmit={handleCreateRoom}>
                            <div className='mb-4'>
                                <label className='block text-gray-700 font-semibold mb-2'>
                                    Room Name
                                </label>
                                <input
                                    type='text'
                                    value={roomName}
                                    onChange={(e) => {
                                        setRoomName(e.target.value)
                                        setError('')
                                    }}
                                    placeholder='e.g., Chemistry class'
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent'
                                    disabled={creating}
                                />
                            </div>

                            {error && (
                                <div className='bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm'>
                                    {error}
                                </div>
                            )}

                            <div className='flex gap-3'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setShowModal(false)
                                        setRoomName('')
                                        setError('')
                                    }}
                                    disabled={creating}
                                    className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={creating}
                                    className='flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center'
                                >
                                    {creating ? (
                                        <>
                                            <span className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></span>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Room'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default page