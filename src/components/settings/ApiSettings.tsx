import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Settings, APIProvider } from "@/types";
import { API_PROVIDERS } from "@/config/constants";

interface APISettingsProps {
  settings: Settings;
  onUpdateProvider: (provider: APIProvider) => void;
  onUpdateKey: (provider: APIProvider, key: string) => void;
  onClose: () => void;
}

export function APISettings({ settings, onUpdateProvider, onUpdateKey, onClose }: APISettingsProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const provider = settings.apiProvider;
    const key = settings.apiKeys[provider];
    
    if (!key?.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    toast.success("API settings saved successfully");
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>API Settings</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">API Provider</label>
          <Select
            value={settings.apiProvider}
            onValueChange={(value: APIProvider) => onUpdateProvider(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select API provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={API_PROVIDERS.GEMINI}>Google Gemini</SelectItem>
              <SelectItem value={API_PROVIDERS.OPENAI}>OpenAI Vision</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">API Key</label>
          <Input
            type="password"
            value={settings.apiKeys[settings.apiProvider] || ''}
            onChange={(e) => onUpdateKey(settings.apiProvider, e.target.value)}
            placeholder={`Enter your ${settings.apiProvider === API_PROVIDERS.GEMINI ? 'Gemini' : 'OpenAI'} API key`}
          />
        </div>

        <Button type="submit" className="w-full">
          Save API Settings
        </Button>
      </form>
    </DialogContent>
  );
}
