export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-sage-200 border-t-sage-600" />
    </div>
  );
}
