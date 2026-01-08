import { Loader2 } from "lucide-react";

export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="mt-3 text-sm text-gray-600 tracking-wide">
        Loading, please wait...
      </p>
    </div>
  );
}
