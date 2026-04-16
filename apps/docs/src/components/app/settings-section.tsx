import { ReactNode } from 'react';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

export function SettingsSection({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function SettingsSectionHeader({
  children,
  checked,
  onCheckedChange,
  id,
}: {
  children: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <Label htmlFor={id}>{children}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function SettingsSectionBody({
  open = true,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div>
      <div className="ml-3 border-l pl-3 py-2 space-y-2 mb-3">{children}</div>
    </div>
  );
}
