interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="w-full max-w-2xl rounded-lg border border-red-500/30 bg-red-900/30 p-4">
      <p className="mb-3 text-sm text-red-300">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-md bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition-all duration-200 hover:bg-red-500/30"
      >
        Try Again
      </button>
    </div>
  );
}
