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
  Image as ImageIcon,
  FileText,
  MapPin,
  X,
  Play,
  Pause,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging, type ChatMessage, type MessageType } from "@/contexts/MessagingContext";
import { useEngagement } from "@/contexts/EngagementContext";
import { toast } from "sonner";

interface PendingAttachment {
  type: Extract<MessageType, "image" | "video" | "voice">;
  mediaUrl: string;
  mediaMime?: string;
  fileName?: string;
  duration?: string;
}

const MessageView = () => {
  const navigate = useNavigate();
  const { contactId } = useParams<{ contactId: string }>();
  const { activeProfile } = useAuth();
  const { getContact, getConversation, sendMessage, markRead, setTyping, isTyping } = useMessaging();
  const { clearMessageNotifications } = useEngagement();

  const myId = activeProfile?.id || "";
  const contact = getContact(contactId || "");
  const messages = contactId ? getConversation(myId, contactId) : [];

  const [inputText, setInputText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCallModal, setShowCallModal] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAttachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (myId && contactId) {
      markRead(myId, contactId);
      clearMessageNotifications(myId, contactId);
    }
  }, [myId, contactId, messages.length, markRead, clearMessageNotifications]);

  if (!contact || !contactId || !myId) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-background">
        <p className="text-foreground font-semibold">Conversation not found</p>
        <button onClick={() => navigate("/inbox")} className="mt-4 text-primary text-sm">
          Back to inbox
        </button>
      </div>
    );
  }

  const otherTyping = isTyping(myId, contactId);

  const send = (msg: Omit<ChatMessage, "id" | "createdAt" | "senderId">) => {
    sendMessage(myId, contactId, msg);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    send({ type: "text", text: inputText.trim() });
    setInputText("");
  };

  const handleInputChange = (v: string) => {
    setInputText(v);
    if (v.trim()) setTyping(myId, contactId);
  };

  const handlePickPhoto = () => {
    setShowAttachMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      send({
        type: file.type.startsWith("video/") ? "video" : "image",
        mediaUrl: url,
        mediaMime: file.type,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          const mins = Math.floor(recordingTime / 60);
          const secs = recordingTime % 60;
          send({
            type: "voice",
            mediaUrl: reader.result as string,
            mediaMime: "audio/webm",
            duration: `${mins}:${secs.toString().padStart(2, "0")}`,
          });
          setRecordingTime(0);
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    mediaRecorderRef.current?.stop();
  };

  const cancelRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current.stop();
    }
    recordedChunksRef.current = [];
    setRecordingTime(0);
  };

  const handleAttachment = (type: "image" | "video" | "document" | "location") => {
    if (type === "image" || type === "video") return handlePickPhoto();
    setShowAttachMenu(false);
    if (type === "location") send({ type: "location", text: "📍 Shared location" });
    else send({ type: "document", text: "📄 Document", fileName: "Document.pdf" });
  };

  const togglePlay = (msgId: string) => {
    const audio = audioRefs.current[msgId];
    if (!audio) return;
    if (playingVoice === msgId) {
      audio.pause();
      setPlayingVoice(null);
    } else {
      // pause others
      Object.entries(audioRefs.current).forEach(([id, a]) => {
        if (id !== msgId && a) a.pause();
      });
      audio.play().catch(() => toast.error("Could not play voice note"));
      setPlayingVoice(msgId);
    }
  };

  const formatRecordTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const renderMessage = (msg: ChatMessage) => {
    const isMe = msg.senderId === myId;

    return (
      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
        <div
          className={`max-w-[75%] rounded-2xl px-3 py-2 ${
            isMe
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-border text-foreground rounded-bl-md"
          }`}
        >
          {msg.type === "text" && <p className="text-sm leading-relaxed px-1">{msg.text}</p>}

          {msg.type === "image" && (
            <div>
              {msg.mediaUrl ? (
                <img
                  src={msg.mediaUrl}
                  alt={msg.fileName || "Photo"}
                  className="max-w-[240px] max-h-[280px] rounded-lg object-cover"
                />
              ) : (
                <div className={`w-48 h-32 rounded-lg flex items-center justify-center text-4xl ${isMe ? "bg-primary-foreground/10" : "bg-secondary"}`}>
                  📷
                </div>
              )}
            </div>
          )}

          {msg.type === "video" && (
            <div>
              {msg.mediaUrl ? (
                <video
                  src={msg.mediaUrl}
                  controls
                  className="max-w-[240px] max-h-[280px] rounded-lg"
                />
              ) : (
                <div className={`w-48 h-32 rounded-lg flex items-center justify-center ${isMe ? "bg-primary-foreground/10" : "bg-secondary"}`}>
                  <span className="text-4xl">🎬</span>
                </div>
              )}
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
            <div className="flex items-center gap-2 min-w-[180px] py-1">
              <button
                onClick={() => togglePlay(msg.id)}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isMe ? "bg-primary-foreground/20" : "bg-primary/20"}`}
              >
                {playingVoice === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <div className="flex-1 flex items-center gap-0.5 h-6">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full ${isMe ? "bg-primary-foreground/60" : "bg-primary/60"}`}
                    style={{ height: `${30 + Math.abs(Math.sin(i * 1.3)) * 70}%` }}
                  />
                ))}
              </div>
              <span className="text-[10px] opacity-70 shrink-0">{msg.duration}</span>
              {msg.mediaUrl && (
                <audio
                  ref={(el) => (audioRefs.current[msg.id] = el)}
                  src={msg.mediaUrl}
                  onEnded={() => setPlayingVoice(null)}
                  className="hidden"
                />
              )}
            </div>
          )}

          {msg.type === "location" && (
            <div>
              <div className={`w-48 h-28 rounded-lg mb-1 flex items-center justify-center ${isMe ? "bg-primary-foreground/10" : "bg-secondary"}`}>
                <MapPin className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-xs opacity-70">{msg.text}</p>
            </div>
          )}

          <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"} text-right`}>
            {formatTime(msg.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <div className="flex items-center gap-3 px-3 py-3 border-b border-border bg-card shrink-0">
        <button onClick={() => navigate("/inbox")} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl border border-border shrink-0">
          {contact.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {otherTyping ? (
              <span className="text-primary font-medium inline-flex items-center gap-1">
                typing
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </span>
            ) : (
              <>
                {contact.subtitle ? `${contact.subtitle} · ` : ""}You're chatting as {activeProfile?.name}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowCallModal(true)} className="p-2 rounded-full hover:bg-secondary">
            <Phone className="w-5 h-5 text-foreground" />
          </button>
          <button onClick={() => toast.info("Video call coming soon")} className="p-2 rounded-full hover:bg-secondary">
            <Video className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary">
            <MoreVertical className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl mb-3">
              {contact.emoji}
            </div>
            <p className="text-base font-semibold text-foreground">{contact.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Say hi from {activeProfile?.name}! Messages persist across both profiles.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <span className="text-[10px] bg-secondary text-muted-foreground px-3 py-1 rounded-full">
                Conversation between {activeProfile?.name} & {contact.name}
              </span>
            </div>
            {messages.map(renderMessage)}
            {otherTyping && (
              <div className="flex justify-start mb-2">
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelected}
      />

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
          <button onClick={stopRecording} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Send className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      )}

      {showAttachMenu && (
        <div className="px-4 py-3 bg-card border-t border-border grid grid-cols-4 gap-3 shrink-0">
          {[
            { icon: ImageIcon, label: "Photo", type: "image" as const, color: "text-green-500" },
            { icon: Video, label: "Video", type: "video" as const, color: "text-blue-500" },
            { icon: FileText, label: "Document", type: "document" as const, color: "text-orange-500" },
            { icon: MapPin, label: "Location", type: "location" as const, color: "text-red-500" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleAttachment(item.type)}
              className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-secondary"
            >
              <div className={`w-11 h-11 rounded-full bg-secondary flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {!isRecording && (
        <div className="flex items-center gap-2 px-3 py-3 border-t border-border bg-card shrink-0">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 rounded-full hover:bg-secondary shrink-0"
          >
            <Paperclip className={`w-5 h-5 ${showAttachMenu ? "text-primary" : "text-muted-foreground"}`} />
          </button>
          <div className="flex-1 flex items-center bg-secondary rounded-full px-4 py-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message as ${activeProfile?.name}...`}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          {inputText.trim() ? (
            <button onClick={handleSend} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-primary-foreground" />
            </button>
          ) : (
            <button onClick={startRecording} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </button>
          )}
        </div>
      )}

      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-5xl border-2 border-border">
            {contact.emoji}
          </div>
          <p className="text-xl font-bold text-foreground mt-6">{contact.name}</p>
          <p className="text-sm text-muted-foreground mt-1">Calling...</p>
          <button
            onClick={() => setShowCallModal(false)}
            className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center mt-10"
          >
            <Phone className="w-7 h-7 text-destructive-foreground rotate-[135deg]" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageView;
