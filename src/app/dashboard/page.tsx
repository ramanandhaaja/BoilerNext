"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    // Log session information for debugging
    setDebugInfo(JSON.stringify({ session, status }, null, 2));
  }, [session, status]);

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You need to be signed in to view this page.</p>
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
        <div className="mt-4 p-4 bg-gray-100 rounded text-xs whitespace-pre-wrap">
          <p>Debug Info:</p>
          <pre>{debugInfo}</pre>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome to Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {session?.user?.name || "Not provided"}</p>
              <p><strong>Email:</strong> {session?.user?.email || "Not provided"}</p>
              <p><strong>User ID:</strong> {session?.user?.id || "Not available"}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Your recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No recent activity to display.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Configure your account settings here.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/settings">Go to Settings</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded text-xs whitespace-pre-wrap">
        <p>Debug Info:</p>
        <pre>{debugInfo}</pre>
      </div>
    </div>
  );
}
