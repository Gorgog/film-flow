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
export type { User } from './types';
