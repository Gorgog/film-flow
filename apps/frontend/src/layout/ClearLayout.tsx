import { Container } from '@/components/ui/Container';
import { Outlet } from 'react-router-dom';

export function ClearLayout() {
  return (
    <Container>
      <Outlet />
    </Container>
  );
}
