import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const LoadingButton = ({ 
  isLoading, 
  children, 
  loadingText = "กำลังประมวลผล...",
  disabled,
  ...props 
}: LoadingButtonProps) => {
  return (
    <Button 
      disabled={isLoading || disabled} 
      {...props}
      className="relative"
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin absolute left-0" />
      )}
      <span className={isLoading ? "ml-8" : ""}>
        {isLoading ? loadingText : children}
      </span>
    </Button>
  );
}; 