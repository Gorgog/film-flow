type TFilmFlowMovie = 'movie' | 'cartoon' | 'series' | 'tv';

type TUserMovieStatus = 'planned' | 'in_progress' | 'watching';

interface ITmdbMovie {
  media_type: TFilmFlowMovie;
  tmdb_id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
  overview: string;
}

interface IMovie extends ITmdbMovie {
  id: string;
}

interface IUserMovie {
  id: string;
  movie: IMovie;
  status: TUserMovieStatus;
  progress_percent: number;
}

export type {
  IMovie,
  ITmdbMovie,
  IUserMovie,
  TFilmFlowMovie,
  TUserMovieStatus,
};
