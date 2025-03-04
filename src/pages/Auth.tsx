import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AuthProps {
  onAuthenticate: () => void;
}

const Auth = ({ onAuthenticate }: AuthProps) => {
  const [licenseKey, setLicenseKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (licenseKey === "Admin123") {
      localStorage.setItem("license_authenticated", "true");
      onAuthenticate();
      toast.success("Successfully authenticated!");
    } else {
      toast.error("Invalid license key. Please contact sarowarhn@gmail.com for support.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 glass-panel animate-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">IMG Keyworder</h1>
          <p className="text-gray-600 mt-2">Enter your license key to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter license key"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Button type="submit" className="w-full">
            Authenticate
          </Button>
          
          <p className="text-sm text-center text-gray-600">
            Need a license key? Contact{" "}
            <a href="mailto:sarowarhn@gmail.com" className="text-blue-600 hover:underline">
              sarowarhn@gmail.com
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
