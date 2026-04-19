import { Container } from '@/components/ui/Container';
import { Outlet } from 'react-router-dom';

export function BaseLayout() {
  return (
    <Container className="!justify-between items-start py-4">
      <Outlet />
    </Container>
  );
}
