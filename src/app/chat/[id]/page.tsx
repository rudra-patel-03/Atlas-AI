'use client'

import ChatPage from '../page'

export default function DynamicChatPage({ params }: { params: { id: string } }) {
  return <ChatPage params={params} />
}
