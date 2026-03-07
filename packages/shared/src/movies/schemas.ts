import z from 'zod';

const mediaTypeSchema = z.enum(['movie', 'cartoon', 'series']);
const userMovieStatusSchema = z.enum(['planned', 'in_progress', 'watching']);
const removeFromListSchema = z.object({
  userMovieId: z.string().uuid(),
});

const getMyListSchema = z
  .object({
    status: userMovieStatusSchema.optional(),
  })
  .optional();

const addToMyListSchema = z.object({
  tmdbId: z.number(),
  mediaType: mediaTypeSchema,
  title: z.string().min(1),
  year: z.number().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
});

const updateUserMovieSchema = z.object({
  userMovieId: z.string().uuid(),
  status: userMovieStatusSchema.optional(),
});

const searchMoviesSchema = z.object({
  query: z.string().min(1),
});

export {
  addToMyListSchema,
  getMyListSchema,
  mediaTypeSchema,
  removeFromListSchema,
  searchMoviesSchema,
  updateUserMovieSchema,
  userMovieStatusSchema,
};
