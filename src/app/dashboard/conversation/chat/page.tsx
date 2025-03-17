"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  Phone, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Search,
  Paperclip,
  Smile,
  Send,
  Play,
  Download,
  X
} from "lucide-react";

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState("Leslie Alexander");
  const [showDetails, setShowDetails] = useState(true);
  const [messageText, setMessageText] = useState("");

  const contacts = [
    {
      id: 1,
      name: "Leslie Alexander",
      lastMessage: "Hi, Brandon! I am looking forward to meeting you!",
      time: "1h",
      avatar: "/avatar-female.png",
      isActive: true,
    },
    {
      id: 2,
      name: "Savannah Nguyen",
      lastMessage: "Fringilla leo sem cursus ut pulvina...",
      time: "1h",
      avatar: "/avatar-female-2.png",
      isActive: false,
    },
    {
      id: 3,
      name: "Kristin Watson",
      lastMessage: "Could you send me a link to join...",
      time: "1h",
      avatar: "/avatar-female-3.png",
      isActive: false,
      hasNotification: true,
    },
    {
      id: 4,
      name: "Cameron Williamson",
      lastMessage: "Fringilla leo sem cursus ut pulvina...",
      time: "1h",
      avatar: "/avatar-male.png",
      isActive: false,
    },
    {
      id: 5,
      name: "Jane Cooper",
      lastMessage: "Fringilla leo sem cursus ut pulvina...",
      time: "1h",
      avatar: "/avatar-female-4.png",
      isActive: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Leslie Alexander",
      content: "Hi, Brandon! I am looking forward to meeting you! Does tomorrow 9?",
      time: "10:33 am",
      isUser: false,
    },
    {
      id: 2,
      sender: "Leslie Alexander",
      content: "What about 2:30 PM?",
      time: "11:20 am",
      isUser: false,
    },
    {
      id: 3,
      sender: "Leslie Alexander",
      content: null,
      time: "11:20 am",
      isUser: false,
      hasAudio: true,
      audioDuration: "00:12",
    },
    {
      id: 4,
      sender: "Leslie Alexander",
      content: null,
      time: "13:11 pm",
      isUser: false,
      hasVideo: true,
      videoThumbnail: "/video-thumbnail.jpg",
    },
    {
      id: 5,
      sender: "You",
      content: "Of course! Here is the link: https://us02web.zoom.us/rec/share/AcJx1bmja-pUUwZVIH5uRh3FXyqBh1r54XYUTFXxWUJ96V3XV1",
      time: "13:11 pm",
      isUser: true,
    },
  ];

  const contactDetails = {
    name: "Leslie Alexander",
    position: "Co-Founder at Uxcel",
    email: "Leslie@example.com",
    phone: "(+1) 437-123-4567",
    created: "Sep 24, 2021 10:00 am",
    campaign: "Schedule Onboarding",
    assigned: "Sep 24, 2021 10:00 am",
    start: "Sep 24, 2021",
    senAI: true,
    library: "Lead Gen Library",
    facebook: "Leslie Alexander",
    company: "Ankla",
    address: "6545 Rodeo Drive",
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, you would add the message to the messages array
      // and send it to the backend
      setMessageText("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden bg-white rounded-lg shadow-sm">
      {/* Left sidebar - Contact list */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Paul Lean</h2>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">5 Open</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Newest</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                contact.name === selectedContact ? "bg-gray-50" : ""
              }`}
              onClick={() => setSelectedContact(contact.name)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium text-sm ${
                      contact.name === selectedContact ? "text-blue-600" : ""
                    }`}>
                      {contact.name}
                    </h3>
                    <span className="text-xs text-gray-500">{contact.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {contact.lastMessage}
                  </p>
                </div>
                {contact.hasNotification && (
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                    2
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle section - Chat */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold">{selectedContact}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
              <Calendar className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100" onClick={() => setShowDetails(!showDetails)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`flex ${message.isUser ? "justify-end" : "justify-start"} ${
                index > 0 && messages[index - 1].isUser === message.isUser ? "mt-2" : "mt-6"
              }`}
            >
              {!message.isUser && (
                <div className="flex-shrink-0 mr-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatar-female.png" alt={message.sender} />
                    <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              <div className={`max-w-[70%] flex flex-col ${message.isUser ? "items-end" : "items-start"}`}>
                {!message.isUser && (
                  <div className="text-sm font-medium text-gray-700 mb-1">{message.sender}</div>
                )}
                
                <div 
                  className={`${
                    message.isUser 
                      ? "bg-gray-100 text-gray-800" 
                      : "bg-white text-gray-800 border border-gray-200"
                  } rounded-2xl px-4 py-2 shadow-sm`}
                >
                  {message.content && (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                  
                  {message.hasAudio && (
                    <div className="flex items-center gap-3 bg-white rounded-md p-3 border border-gray-200 shadow-sm">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex-shrink-0">
                        <Play className="h-4 w-4" />
                      </Button>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-2 bg-blue-600 rounded-full w-1/3"></div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{message.audioDuration}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0 hover:bg-gray-100 rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {message.hasVideo && (
                    <div className="relative rounded-lg overflow-hidden shadow-md w-full max-w-md mb-1">
                      <Image 
                        src={message.videoThumbnail} 
                        alt="Video thumbnail" 
                        width={500}
                        height={280}
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-5 w-5 text-gray-800" />
                      </div>
                      <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Download className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  {message.time}
                </div>
              </div>
              
              {message.isUser && (
                <div className="flex-shrink-0 ml-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatar-male.png" alt="You" />
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))}
          
          <div className="py-4 text-center text-xs text-gray-500 border-t border-b border-gray-200">
            29 July 2024
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-gray-100">
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Write your SMS message here..."
                className="w-full pr-20 py-6 rounded-full border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                  <Smile className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-full shadow-sm"
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Right sidebar - Details */}
      {showDetails && (
        <div className="w-96 border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold">Details</h2>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowDetails(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="overflow-y-auto flex-1 p-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-20 w-20 mb-2">
                <AvatarImage src="/avatar-female.png" alt={contactDetails.name} />
                <AvatarFallback>{contactDetails.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{contactDetails.name}</h3>
              <p className="text-sm text-gray-500">{contactDetails.position}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm ml-auto">{contactDetails.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Phone</span>
                  <span className="text-sm ml-auto">{contactDetails.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm ml-auto">{contactDetails.created}</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Campaign</h4>
                <ChevronUp className="h-4 w-4 text-gray-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm ml-auto">{contactDetails.campaign}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Assigned</span>
                  <span className="text-sm ml-auto">{contactDetails.assigned}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Start</span>
                  <span className="text-sm ml-auto">{contactDetails.start}</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Sen AI</h4>
                <ChevronUp className="h-4 w-4 text-gray-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Send with Sen AI</span>
                  <div className="ml-auto">
                    <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                      <div className="absolute right-1 top-1 bg-white rounded-full h-4 w-4"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Current Library</span>
                  <span className="text-sm ml-auto">{contactDetails.library}</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Custom Info</h4>
                <ChevronUp className="h-4 w-4 text-gray-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Facebook</span>
                  <span className="text-sm ml-auto">{contactDetails.facebook}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Company</span>
                  <span className="text-sm ml-auto">{contactDetails.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Address</span>
                  <span className="text-sm ml-auto">{contactDetails.address}</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Notes</h4>
                <span className="text-xs text-gray-500">1</span>
              </div>
              <div className="border border-gray-200 rounded-md p-3">
                <textarea 
                  className="w-full h-20 text-sm resize-none focus:outline-none" 
                  placeholder="Add notes here..."
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Tags</h4>
              <span className="text-xs text-gray-500">3</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">Lead</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">Customer</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">VIP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
