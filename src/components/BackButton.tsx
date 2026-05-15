import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

const BackButton = ({ to, label, className = "" }: BackButtonProps) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
    else if (window.history.length > 1) navigate(-1);
    else navigate("/feed");
  };
  return (
    <button
      onClick={handleClick}
      aria-label="Go back"
      className={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-full bg-secondary/80 hover:bg-secondary text-foreground text-sm font-medium transition-colors active:scale-95 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label && <span className="text-xs">{label}</span>}
    </button>
  );
};

export default BackButton;
