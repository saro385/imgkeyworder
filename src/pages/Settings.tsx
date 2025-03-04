import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { APISettings } from "@/components/settings/ApiSettings";
import { useSettings } from "@/hooks/useSettings";
import { APIProvider } from "@/types";

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, updateAPIKey } = useSettings();
  const [activeDialog, setActiveDialog] = useState<'api' | null>(null);

  const handleUpdateProvider = (provider: APIProvider) => {
    updateSettings({ apiProvider: provider });
  };

  const handleUpdateAPIKey = (provider: APIProvider, key: string) => {
    updateAPIKey(provider, key);
  };

    const handleCloseDialog = () => {
    setActiveDialog(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8 animate-in">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="gap-2 mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your Image Tagger settings</p>
        </div>

        <div className="space-y-6">
          <div
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveDialog('api')}
          >
            <h2 className="text-lg font-medium">API Settings</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure your API provider and credentials
            </p>
            <div className="mt-4 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Current Provider:</span>
                <span className="font-medium">
                  {settings.apiProvider === 'gemini' ? 'Google Gemini' : 'OpenAI Vision'}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600 mt-2">
                <span>API Key:</span>
                <span className="font-medium">
                  {settings.apiKeys[settings.apiProvider] ? '••••••••' : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* API Settings Dialog */}
        <Dialog
          open={activeDialog === 'api'}
          onOpenChange={(open) => !open && setActiveDialog(null)}
        >
          <APISettings
            settings={settings}
            onUpdateProvider={handleUpdateProvider}
            onUpdateKey={handleUpdateAPIKey}
            onClose={() => setActiveDialog(null)}
          />
        </Dialog>
      </div>
    </div>
  );
};

export default Settings;
