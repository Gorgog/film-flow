import { Container } from '@/components/ui/Container';
import { Outlet } from 'react-router-dom';

export function BaseLayout() {
  return (
    <Container>
      <Outlet />
    </Container>
  );
}
