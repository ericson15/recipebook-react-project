
import { LoaderCircle } from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoaderCircle className="w-10 h-10 text-orange-500 animate-spin" />

      <p className="mt-3 text-gray-500">
        Loading delicious recipes...
      </p>
    </div>
  );
}

export default LoadingSpinner;
