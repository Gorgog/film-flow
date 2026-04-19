export { loginSchema, registerSchema } from './auth/index';
export type { LoginInput, RegisterInput } from './auth/index';
export {
  addToMyListSchema,
  getMyListSchema,
  mediaTypeSchema,
  removeFromListSchema,
  searchMoviesSchema,
  updateUserMovieSchema,
  userMovieStatusSchema,
} from './movies/schemas';

// Types
export type {
  IMovie,
  ITmdbMovie,
  IUserMovie,
  TFilmFlowMovie,
  TUserMovieStatus,
} from './movies/type';
