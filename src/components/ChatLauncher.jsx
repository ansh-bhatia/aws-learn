import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import "./ChatLauncher.css";

export default function ChatLauncher() {
  return (
    <Link
      to="/chat"
      className="chat-launcher-fab"
      aria-label="Open AWS assistant"
      title="Ask the AWS assistant"
    >
      <MessageCircle size={22} />
    </Link>
  );
}
