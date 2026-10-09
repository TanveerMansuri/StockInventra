
import { AlertTriangle } from "lucide-react";
import { Button } from "@stock-inventra/ui";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message, 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-lg border border-semantic-error/20 bg-semantic-error-bg p-32 text-center">
      <AlertTriangle className="mb-16 h-40 w-40 text-semantic-error" />
      <h3 className="mb-8 text-section-title text-semantic-error">{title}</h3>
      <p className="mb-24 max-w-md text-body text-semantic-error/80">{message}</p>
      
      {onRetry && (
        <Button variant="danger" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
