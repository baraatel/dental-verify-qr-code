import { Wifi, WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useClinicCRUD";
import { cn } from "@/lib/utils";

export const NetworkStatus = () => {
  const isOnline = useNetworkStatus();

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
      isOnline 
        ? "bg-green-100 text-green-800 border border-green-200" 
        : "bg-red-100 text-red-800 border border-red-200"
    )}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>متصل</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>غير متصل</span>
        </>
      )}
    </div>
  );
};