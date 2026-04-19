import { ITmdbMovie, TFilmFlowMovie } from '@film-flow/shared';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_W200 = 'https://image.tmdb.org/t/p/w200';
const TMDB_LANGUAGE = 'ru-RU';

// Поля для insert/update кэша в таблице `movies`
export interface ITmdbMovieCache {
  title: string;
  year: number | null;
  posterUrl: string | null;
  overview: string | null;
}

// Элемент массива `results` у `GET /search/multi`
interface ITmdbMultiResult {
  id: number;
  media_type?: TFilmFlowMovie;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string | null;
}

interface ITmdbMovieApiResponse {
  title?: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string | null;
}

interface ITmdbTvApiResponse {
  name?: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string | null;
}

function getTmdbApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY is not set');
  }
  return key;
}

function posterUrlFromPath(
  posterPath: string | null | undefined
): string | null {
  return posterPath ? `${TMDB_IMAGE_W200}${posterPath}` : null;
}

function parseYear(dateStr: string | null | undefined): number | null {
  const year = parseInt((dateStr ?? '').slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

export async function searchMulti(query: string): Promise<ITmdbMovie[]> {
  const key = getTmdbApiKey();
  const url = new URL(`${TMDB_API_BASE}/search/multi`);
  url.searchParams.set('api_key', key);
  url.searchParams.set('query', query);
  url.searchParams.set('language', TMDB_LANGUAGE);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to search TMDB: ${response.statusText}`);
  }

  const json = (await response.json()) as { results: ITmdbMultiResult[] };
  const results = json.results ?? [];

  return results
    .filter(
      (r) =>
        (r.media_type === 'movie' || r.media_type === 'tv') &&
        Boolean(r.title ?? r.name)
    )
    .map((r) => ({
      tmdb_id: r.id,
      media_type: (r.media_type === 'tv'
        ? 'series'
        : 'movie') as TFilmFlowMovie,
      title: r.title ?? r.name ?? '',
      year: parseYear(r.release_date ?? r.first_air_date),
      poster_url: posterUrlFromPath(r.poster_path),
      overview: r.overview ?? '',
    }));
}

/**
 * Детали одного title для кэша в БД.
 * `404` от TMDB → `null` (в роутере → TRPCError NOT_FOUND).
 */

export async function fetchDetails(
  tmdbId: number,
  mediaType: TFilmFlowMovie
): Promise<ITmdbMovieCache | null> {
  const key = getTmdbApiKey();
  const path = mediaType === 'series' ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;
  const url = new URL(`${TMDB_API_BASE}${path}`);
  url.searchParams.set('api_key', key);
  url.searchParams.set('language', TMDB_LANGUAGE);

  const response = await fetch(url.toString());
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch TMDB details: ${response.statusText}`);
  }

  if (mediaType === 'series') {
    const json = (await response.json()) as ITmdbTvApiResponse;
    return {
      title: json.name ?? '',
      year: parseYear(json.first_air_date),
      posterUrl: posterUrlFromPath(json.poster_path ?? null),
      overview: json.overview ?? null,
    };
  }

  const json = (await response.json()) as ITmdbMovieApiResponse;

  return {
    title: json.title ?? '',
    year: parseYear(json.release_date),
    posterUrl: posterUrlFromPath(json.poster_path ?? null),
    overview: json.overview ?? null,
  };
}
