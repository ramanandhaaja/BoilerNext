import { Button } from "@/components/ui/button";

export function WhatsAppStatusPanel() {
  // Mock status
  const status = {
    isConnected: false,
    statusText: 'Disconnected',
    canSendMessage: false
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">WhatsApp Status</span>
        <span className={`text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800`}>
          {status.statusText}
        </span>
      </div>
      
      <div className="mt-1 text-xs">
        {status.canSendMessage && (
          <div className="flex items-center text-green-600 mb-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            <span>Ready to send messages</span>
          </div>
        )}
      </div>
      
      {/* Connection button */}
      {!status.isConnected && (
        <Button 
          className="w-full mt-2" 
          size="sm"
          onClick={() => {}}
        >
          Connect WhatsApp
        </Button>
      )}
      
      {status.isConnected && (
        <div className="flex flex-col gap-2 mt-2">
          <Button 
            className="w-full" 
            size="sm"
            variant="outline"
            onClick={() => {}}
          >
            Refresh Status
          </Button>
          
          <Button 
            className="w-full" 
            size="sm"
            variant="secondary"
            onClick={() => {}}
          >
            Force Reconnect
          </Button>
        </div>
      )}
    </div>
  );
}
