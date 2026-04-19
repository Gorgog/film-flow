import {
  AspectRatio,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Inset,
} from '@radix-ui/themes';

interface Props {
  type: 'search' | 'library';
  posterUrl: string;
  title: string;
  onAdd?: () => void;
  onRemove?: () => void;
}

export function MovieCard({ posterUrl, title, onAdd, onRemove }: Props) {
  return (
    <Box className="h-full">
      <Card size="2" className="h-full !flex flex-col justify-between gap-4">
        <Flex direction="column">
          <Inset clip="padding-box" side="top" pb="current">
            <AspectRatio ratio={8 / 12}>
              <img
                src={posterUrl ?? 'https://via.placeholder.com/150'}
                alt={title}
                className="rounded-lg object-cover w-full h-full"
              />
            </AspectRatio>
          </Inset>
          <Heading as="h2" size="2">
            {title}
          </Heading>
        </Flex>

        <Flex gap="2" justify="between" direction="column">
          {onAdd && (
            <Button variant="outline" onClick={onAdd}>
              Добавить
            </Button>
          )}
          {onRemove && (
            <Button variant="outline" onClick={onRemove}>
              Убрать
            </Button>
          )}
        </Flex>
      </Card>
    </Box>
  );
}
