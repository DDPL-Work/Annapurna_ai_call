import { RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-12 w-12 rounded-full bg-brick-100 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-brick-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="font-display text-lg text-ink mb-1">Something went wrong</h3>
      <p className="text-sm text-muted max-w-md mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
