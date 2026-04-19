import { TextField } from '@radix-ui/themes';

interface Props {
  placeholder: string;
  icon?: React.ReactNode;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function BaseInput({
  placeholder,
  icon,
  type = 'text',
  value,
  onChange,
  className,
}: Props) {
  return (
    <TextField.Root
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={className}
    >
      <TextField.Slot>{icon}</TextField.Slot>
    </TextField.Root>
  );
}
