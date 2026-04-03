import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Mic,
  Paperclip,
  Image,
  FileText,
  MapPin,
  X,
  Square,
  Play,
  Pause,
} from "lucide-react";

interface Message {
  id: number;
  text?: string;
  type: "text" | "image" | "video" | "document" | "voice" | "location";
  sender: "me" | "them";
  time: string;
  fileName?: string;
  duration?: string;
  isPlaying?: boolean;
}

const initialMessages: Message[] = [
  { id: 1, type: "text", text: "Hey! How's your pet doing today? 🐾", sender: "them", time: "10:30 AM" },
  { id: 2, type: "text", text: "She's doing great! Just had her morning walk 🐕", sender: "me", time: "10:32 AM" },
  { id: 3, type: "text", text: "That's awesome! I saw your video of her at the park", sender: "them", time: "10:33 AM" },
  { id: 4, type: "image", text: "📷 Photo", sender: "me", time: "10:35 AM" },
  { id: 5, type: "voice", duration: "0:12", sender: "them", time: "10:36 AM" },
  { id: 6, type: "text", text: "She loves chasing squirrels 😂", sender: "me", time: "10:38 AM" },
  { id: 7, type: "location", text: "📍 Central Park, New York", sender: "me", time: "10:40 AM" },
];

const contacts: Record<string, { name: string; emoji: string; status: string }> = {
  "the-creative-giftshop": { name: "THE CREATIVE GIFTSHOP", emoji: "🎁", status: "Active now" },
  "anuadenuga-channel": { name: "Anuadenuga channel 🎉", emoji: "🎊", status: "Active yesterday" },
  "adenola-ayodele": { name: "Adenola Ayodele", emoji: "👤", status: "Online" },
  "tobi": { name: "TOBI", emoji: "🧑", status: "Last seen 2h ago" },
  "gideons-chariot": { name: "Gideon's chariot.", emoji: "⚡", status: "Online" },
};

const MessageView = () => {
  const navigate = useNavigate();
  const { contactId } = useParams<{ contactId: string }>();
  const contact = contacts[contactId || ""] || { name: "Chat", emoji: "💬", status: "Offline" };

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCallModal, setShowCallModal] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (type: Message["type"], text?: string, fileName?: string, duration?: string) => {
    const newMsg: Message = {
      id: Date.now(),
      type,
      text,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      fileName,
      duration,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage("text", inputText.trim());
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingInterval.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    const mins = Math.floor(recordingTime / 60);
    const secs = recordingTime % 60;
    sendMessage("voice", undefined, undefined, `${mins}:${secs.toString().padStart(2, "0")}`);
    setRecordingTime(0);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    setRecordingTime(0);
  };

  const handleAttachment = (type: "image" | "video" | "document" | "location") => {
    setShowAttachMenu(false);
    if (type === "location") {
      sendMessage("location", "📍 Shared location");
    } else if (type === "image") {
      sendMessage("image", "📷 Photo");
    } else if (type === "video") {
      sendMessage("video", "🎬 Video");
    } else {
      sendMessage("document", "📄 Document", "file.pdf");
    }
  };

  const formatRecordTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const renderMessage = (msg: Message) => {
    const isMe = msg.sender === "me";

    return (
      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
        <div
          className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
            isMe
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-border text-foreground rounded-bl-md"
          }`}
        >
          {msg.type === "text" && <p className="text-sm leading-relaxed">{msg.text}</p>}

          {msg.type === "image" && (
            <div>
              <div className={`w-48 h-32 rounded-lg mb-1 flex items-center justify-center text-4xl ${isMe ? "bg-primary-foreground/10" : "bg-secondary"}`}>
                📷
              </div>
              <p className="text-xs opacity-70">Photo</p>
            </div>
          )}

          {msg.type === "video" && (
            <div>
              <div className={`w-48 h-32 rounded-lg mb-1 flex items-center justify-center relative ${isMe ? "bg-primary-foreground/10" : "bg-secondary"}`}>
                <span className="text-4xl">🎬</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                    <Play className="w-5 h-5 text-foreground" />
                  </div>
                </div>
              </div>
              <p className="text-xs opacity-70">Video</p>
            </div>
          )}

          {msg.type === "document" && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isMe ? "bg-primary-foreground/10" : "bg-secondary"}`}>
              <FileText className="w-8 h-8 opacity-60" />
              <div>
                <p className="text-sm font-medium">{msg.fileName || "Document"}</p>
                <p className="text-xs opacity-60">PDF · 2.4 MB</p>
              </div>
            </div>
          )}

          {msg.type === "voice" && (
            <div className="flex items-center gap-2 min-w-[160px]">
              <button
                onClick={() => setPlayingVoice(playingVoice === msg.id ? null : msg.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? "bg-primary-foreground/20" : "bg-primary/20"}`}
              >
                {playingVoice === msg.id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex gap-[2px] items-end h-5">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-[3px] rounded-full ${isMe ? "bg-primary-foreground/40" : "bg-primary/40"}`}
                      style={{ height: `${Math.random() * 16 + 4}px` }}
                    />
                  ))}
                </div>
                <p className="text-[10px] opacity-60 mt-0.5">{msg.duration}</p>
              </div>
            </div>
          )}

          {msg.type === "location" && (
            <div>
              <div className={`w-48 h-28 rounded-lg mb-1 flex items-center justify-center ${isMe ? "bg-primary-foreground/10" : "bg-secondary"}`}>
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-1 text-destructive" />
                  <p className="text-xs font-medium">Shared Location</p>
                </div>
              </div>
              <p className="text-xs opacity-70">{msg.text}</p>
            </div>
          )}

          <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/50" : "text-muted-foreground"} text-right`}>
            {msg.time}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 border-b border-border bg-card shrink-0">
        <button onClick={() => navigate("/inbox")} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl border border-border shrink-0">
          {contact.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
          <p className="text-xs text-muted-foreground">{contact.status}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCallModal(true)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Phone className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary transition-colors">
            <Video className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary transition-colors">
            <MoreVertical className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="text-center mb-4">
          <span className="text-[10px] bg-secondary text-muted-foreground px-3 py-1 rounded-full">Today</span>
        </div>
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Recording Bar */}
      {isRecording && (
        <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border-t border-border shrink-0">
          <button onClick={cancelRecording} className="p-1.5 rounded-full hover:bg-secondary">
            <X className="w-5 h-5 text-destructive" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-medium text-foreground">{formatRecordTime(recordingTime)}</span>
            <span className="text-xs text-muted-foreground">Recording...</span>
          </div>
          <button
            onClick={stopRecording}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
          >
            <Send className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      )}

      {/* Attachment Menu */}
      {showAttachMenu && (
        <div className="px-4 py-3 bg-card border-t border-border grid grid-cols-4 gap-3 shrink-0">
          {[
            { icon: Image, label: "Image", type: "image" as const, color: "text-green-500" },
            { icon: Video, label: "Video", type: "video" as const, color: "text-blue-500" },
            { icon: FileText, label: "Document", type: "document" as const, color: "text-orange-500" },
            { icon: MapPin, label: "Location", type: "location" as const, color: "text-red-500" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleAttachment(item.type)}
              className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <div className={`w-11 h-11 rounded-full bg-secondary flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      {!isRecording && (
        <div className="flex items-center gap-2 px-3 py-3 border-t border-border bg-card shrink-0">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 rounded-full hover:bg-secondary transition-colors shrink-0"
          >
            <Paperclip className={`w-5 h-5 ${showAttachMenu ? "text-primary" : "text-muted-foreground"}`} />
          </button>
          <div className="flex-1 flex items-center bg-secondary rounded-full px-4 py-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Message..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          {inputText.trim() ? (
            <button
              onClick={handleSend}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5 text-primary-foreground" />
            </button>
          ) : (
            <button
              onMouseDown={startRecording}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0"
            >
              <Mic className="w-5 h-5 text-primary-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Voice Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-5xl border-2 border-border">
              {contact.emoji}
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{contact.name}</p>
              <p className="text-sm text-muted-foreground mt-1">Calling...</p>
            </div>
            <div className="flex items-center gap-6 mt-8">
              <button className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                <Mic className="w-6 h-6 text-foreground" />
              </button>
              <button className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                <Video className="w-6 h-6 text-foreground" />
              </button>
              <button
                onClick={() => setShowCallModal(false)}
                className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center"
              >
                <Phone className="w-7 h-7 text-destructive-foreground rotate-[135deg]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageView;
