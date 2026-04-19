import { MovieCard } from '@/components/ui/movies/MovieCard';
import { SearchInput } from '@/components/ui/search/SearchInput';
import { trpc } from '@/trpc/client';
import type { ITmdbMovie } from '@film-flow/shared';
import { Heading } from '@radix-ui/themes';
import { useState } from 'react';

export function SearchMoviesPage() {
  const [query, setQuery] = useState('');

  const { data: movies } = trpc.movies.searchMovies.useQuery({
    query: query,
  });

  const { mutate: addToMyList } = trpc.movies.addToMyList.useMutation();

  return (
    <div className="w-full">
      <Heading as="h1" size="5" mb="4">
        Поиск фильмов
      </Heading>
      <SearchInput
        placeholder="Поиск фильмов"
        value={query}
        onChange={setQuery}
        className="mb-4"
      />
      <div className="grid grid-cols-2 gap-4">
        {movies?.map((movie: ITmdbMovie) => (
          <MovieCard
            key={`${movie.media_type}-${movie.tmdb_id}`}
            posterUrl={movie.poster_url ?? ''}
            title={movie.title}
            type="search"
            onAdd={() =>
              addToMyList({
                tmdbId: movie.tmdb_id,
                mediaType: movie.media_type,
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
