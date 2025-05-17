import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Menu, Send, Plus, Trash, User } from 'lucide-react';

// Message component to display chat messages
const Message = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-2 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`p-2 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
          <div className="flex items-center gap-2 mb-1">
            {isUser ? (
              <>
                <span className="font-medium">You</span>
                <User size={16} />
              </>
            ) : (
              <>
                <MessageSquare size={16} />
                <span className="font-medium">AI</span>
              </>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

// Chat item component for sidebar
const ChatItem = ({ chat, active, onClick, onDelete }) => {
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${active ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <MessageSquare size={18} />
        <span className="truncate">{chat.title || 'New Chat'}</span>
      </div>
      {active && (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(chat.id); }}>
          <Trash size={16} />
        </Button>
      )}
    </div>
  );
};

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState('');
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load chats from localStorage on component mount
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {

      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      
      // Set active chat if there is at least one chat
      if (parsedChats.length > 0 && !activeChatId) {
        setActiveChatId(parsedChats[0].id);
        setMessages(parsedChats[0].messages || []);
      }
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Create a new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: []
    };
    
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setMessages([]);
    setIsMenuOpen(false);
  };

  // Handle chat selection
  const selectChat = (chatId) => {
    setActiveChatId(chatId);
    const selectedChat = chats.find(chat => chat.id === chatId);
    if (selectedChat) {
      console.log(selectedChat)
      setMessages(selectedChat.messages || []);
    }
    setIsMenuOpen(false);
  };

  // Delete a chat
  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (chatId === activeChatId && updatedChats.length > 0) {
      setActiveChatId(updatedChats[0].id);
      setMessages(updatedChats[0].messages || []);
    } else if (updatedChats.length === 0) {
      setActiveChatId(null);
      setMessages([]);
    }
    
    localStorage.setItem('chats', JSON.stringify(updatedChats));
  };

  // Send a message
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    // Mock AI response (in a real app, you would call your LLM API here) ///////////////////////////////////////////////////////
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: `This is a simulated response to: "${inputValue}"`,
      isUser: false,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, userMessage, aiMessage];
    setMessages(updatedMessages);
    
    // Update the chat in the chats array
    const updatedChats = chats.map(chat => {
      if (chat.id === activeChatId) {
        // Set chat title to first few words of first message if this is the first message
        const title = chat.title === 'New Chat' && chat.messages.length === 0 
          ? inputValue.split(' ').slice(0, 3).join(' ') + '...'
          : chat.title;
          
        return {
          ...chat,
          title,
          messages: updatedMessages
        };
      }
      return chat;
    });
    
    setChats(updatedChats);
    setInputValue('');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMenuOpen(true)}
      >
        <Menu size={24} />
      </Button>
      
      {/* Chat sidebar */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <div className="h-full flex flex-col">
            <div className="p-4">
              <Button className="w-full" onClick={createNewChat}>
                <Plus className="mr-2" size={16} />
                New Chat
              </Button>
            </div>
            
            <Separator />
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {chats.map(chat => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onClick={() => selectChat(chat.id)}
                    onDelete={deleteChat}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-80 md:flex-col md:border-r border-gray-200">
        <div className="p-4">
          <Button className="w-full" onClick={createNewChat}>
            <Plus className="mr-2" size={16} />
            New Chat
          </Button>
        </div>
        
        <Separator />
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                onClick={() => selectChat(chat.id)}
                onDelete={deleteChat}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat messages */}
        <ScrollArea className="flex-1 px-4 py-6">
          {messages.length > 0 ? (
            messages.map(message => (
              <Message key={message.id} message={message} isUser={message.isUser} />
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <MessageSquare size={40} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold">Welcome to Chat</h3>
                <p className="text-gray-500 mt-2">
                  Start a conversation with the AI assistant.
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
        
        {/* Chat input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputValue.trim()}
              className="self-end"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}