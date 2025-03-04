import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks/useSettings";

interface SettingsMenuProps {
  onSelectOption: () => void;
  onLogout: () => void;
}

export function SettingsMenu({ onSelectOption }: Omit<SettingsMenuProps, 'onLogout'>) {
  const { settings } = useSettings();
  const hasApiKey = !!settings.apiKeys[settings.apiProvider];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className={`h-4 w-4 ${hasApiKey ? 'text-green-500' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onSelectOption}>
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
