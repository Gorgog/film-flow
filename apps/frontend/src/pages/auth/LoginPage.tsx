import { BaseField } from '@/components/ui/base/BaseField';
import { useAuthStore } from '@/stores/auth.store';
import { trpc } from '@/trpc/client';
import { registerSchema, type LoginInput } from '@film-flow/shared/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Flex, Text } from '@radix-ui/themes';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const form = useForm<LoginInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      navigate('/');
    },
  });

  return (
    <Card size="3" className="max-w-md w-full mx-auto">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((d) => loginMutation.mutate(d))}>
          <Flex direction="column" gap="5">
            <Text size="5" weight="bold">
              Вход
            </Text>
            {loginMutation.isError && (
              <Text size="2" color="red">
                {loginMutation.error.message}
              </Text>
            )}
            <Flex direction="column" gap="3">
              <BaseField name="email" placeholder="Email" type="email" />
              <BaseField name="password" placeholder="Пароль" type="password" />
            </Flex>
            <Flex direction="column" gap="3">
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="!cursor-pointer"
              >
                {loginMutation.isPending ? '…' : 'Войти'}
              </Button>
              <Button asChild type="button" className="w-full">
                <Link to="/register">Зарегистрироваться</Link>
              </Button>
            </Flex>
          </Flex>
        </form>
      </FormProvider>
    </Card>
  );
}
