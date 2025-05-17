import { createFileRoute } from '@tanstack/react-router'
import ChatInterface from '../components/chat-interface'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      <header className="w-screen h-screen">
        <ChatInterface />
      </header>
    </div>
  )
}
