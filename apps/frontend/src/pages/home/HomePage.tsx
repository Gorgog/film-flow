import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@radix-ui/themes';

export function HomePage() {
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <div>
      <span>Home</span>
      <Button onClick={signOut}>Выйти</Button>
    </div>
  );
}
