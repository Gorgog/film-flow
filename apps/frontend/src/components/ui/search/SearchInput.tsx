import { BaseInput } from '@/components/ui/base/BaseInput';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

interface Props {
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchInput({
  placeholder,
  className,
  value,
  onChange,
}: Props) {
  return (
    <BaseInput
      placeholder={placeholder}
      icon={<MagnifyingGlassIcon height="16" width="16" />}
      type="search"
      value={value}
      onChange={onChange}
      className={className}
    />
  );
}
