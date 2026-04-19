import { MovieCard } from '@/components/ui/movies/MovieCard';
import { trpc } from '@/trpc/client';
import type { IUserMovie } from '@film-flow/shared';
import { Heading } from '@radix-ui/themes';

export function MyListPage() {
  const utils = trpc.useUtils();
  const { data: movies } = trpc.movies.getMyList.useQuery();
  const { mutate: removeFromMyList } = trpc.movies.removeFromList.useMutation({
    onSuccess: () => {
      void utils.movies.getMyList.invalidate();
    },
  });

  const handleRemoveFromMyList = (userMovieId: string) => {
    removeFromMyList({ userMovieId });
  };

  return (
    <div>
      <Heading as="h1" size="5" mb="4">
        Мои фильмы
      </Heading>
      <div className="grid grid-cols-2 gap-4">
        {movies?.map((movie: IUserMovie) => (
          <MovieCard
            key={`${movie.movie.media_type}-${movie.movie.tmdb_id}`}
            posterUrl={movie.movie.poster_url ?? ''}
            title={movie.movie.title}
            type="library"
            onRemove={() => handleRemoveFromMyList(movie.id)}
          />
        ))}
      </div>
    </div>
  );
}
