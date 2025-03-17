'use client';

import { useState, useEffect } from 'react';
import { useWhatsAppClient } from '@/hooks/useWhatsAppClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, RefreshCw, LogOut } from 'lucide-react';
import QRCode from 'qrcode.react';

export function WhatsAppQRCode() {
  const { status, isLoading, error, initializeClient, logoutClient, refreshStatus } = useWhatsAppClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStatus();
    setRefreshing(false);
  };

  const handleInitialize = async () => {
    await initializeClient();
  };

  const handleLogout = async () => {
    await logoutClient();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>WhatsApp Connection</CardTitle>
        <CardDescription>
          Connect your WhatsApp account to enable messaging
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading WhatsApp status...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && status && (
          <>
            <div className="flex items-center justify-center w-full mb-4">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                status.status === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : status.status === 'disconnected'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                Status: {status.status}
              </div>
            </div>

            {status.status === 'connected' && status.clientInfo && (
              <div className="bg-green-50 p-4 rounded-lg w-full">
                <div className="flex items-center mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="font-medium text-green-900">Connected to WhatsApp</h3>
                </div>
                <div className="text-sm text-green-800 space-y-1">
                  <p>Name: {status.clientInfo.pushname}</p>
                  <p>Phone: {status.clientInfo.wid}</p>
                  <p>Platform: {status.clientInfo.platform}</p>
                </div>
              </div>
            )}

            {status.qrCode && (
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <QRCode value={status.qrCode} size={256} />
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  Scan this QR code with your WhatsApp app to connect
                </p>
              </div>
            )}

            {status.status === 'not_initialized' && !status.qrCode && (
              <div className="text-center p-4">
                <p className="mb-4 text-muted-foreground">WhatsApp client is not initialized</p>
                <Button onClick={handleInitialize}>
                  Initialize WhatsApp
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        {status?.status === 'connected' && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
