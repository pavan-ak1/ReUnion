"use client";

import { useEffect, useState } from "react";

export default function DashboardRedirect() {
  const [status, setStatus] = useState("Checking authentication...");

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication status...');
      
      // First, check if we have a token in localStorage
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');
      
      if (!token || !userString) {
        console.log('No token or user data found, redirecting to login');
        window.location.replace('/signin');
        return;
      }

      try {
        // Parse user data from localStorage
        const userData = JSON.parse(userString);
        
        if (userData?.role) {
          // Verify with the server
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            console.log('Auth response status:', response.status);
            
            if (response.ok) {
              const serverUserData = await response.json();
              console.log('Server user data:', serverUserData);
              
              // Use server data if available, otherwise fall back to localStorage
              const role = serverUserData.role || userData.role;
              
              if (role === "alumni" || role === "student") {
                console.log(`User is authenticated as ${role}, redirecting...`);
                setStatus(`Redirecting to ${role} Dashboard...`);
                window.location.replace(`/${role}/dashboard`);
                return;
              }
            }
          } catch (serverError) {
            console.warn('Error verifying with server, using localStorage data', serverError);
          }
          
          // If we get here, either server verification failed or role is invalid
          if (userData.role === "alumni" || userData.role === "student") {
            console.log(`Using localStorage role: ${userData.role}`);
            setStatus(`Redirecting to ${userData.role} Dashboard...`);
            window.location.replace(`/${userData.role}/dashboard`);
            return;
          }
        }
        
        // If we get here, the role is invalid
        console.warn('Invalid role, redirecting to login');
        setStatus("Invalid role. Redirecting to login...");
        window.location.replace("/signin");
        
      } catch (error) {
        console.error('Error during authentication check:', error);
        setStatus("Authentication error. Redirecting to login...");
        window.location.replace("/signin");
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 text-center">
        <h1 className="text-2xl font-semibold text-blue-700 mb-2">
          {status}
        </h1>
        <p className="text-gray-500">Please wait while we redirect you...</p>
      </div>
    </div>
  );
}
