
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-32 text-text-secondary">
      <Loader2 className="mb-16 h-32 w-32 animate-spin text-primary" />
      <p className="text-body-strong">{message}</p>
    </div>
  );
}
