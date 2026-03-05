import { Text, TextField } from '@radix-ui/themes';
import { type ComponentPropsWithoutRef } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = ComponentPropsWithoutRef<typeof TextField.Root> & {
  name: string;
};

export function BaseField({ name, ...props }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div>
      <TextField.Root {...register(name)} {...props} />
      {error && (
        <Text size="1" color="red" mt="1">
          {error}
        </Text>
      )}
    </div>
  );
}
