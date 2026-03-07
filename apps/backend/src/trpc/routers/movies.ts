import { supabase } from '@/lib/supabase';
import { protectedProcedure, router } from '@/trpc/trpc';
import {
  addToMyListSchema,
  getMyListSchema,
  removeFromListSchema,
  searchMoviesSchema,
  updateUserMovieSchema,
} from '@film-flow/shared';
import { Movie } from '@film-flow/shared/types';
import { TRPCError } from '@trpc/server';

export const moviesRouter = router({
  getMyList: protectedProcedure
    .input(getMyListSchema)
    .query(async ({ ctx, input }) => {
      let query = supabase
        .from('user_movies')
        .select(
          `
        id,
        status,
        progress_percent,
        movie:movies(id, tmdb_id, media_type, title, year, poster_url, overview)
        `
        )
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false });

      if (input?.status) {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data ?? [];
    }),

  addToMyList: protectedProcedure
    .input(addToMyListSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await supabase
        .from('movies')
        .select('id')
        .eq('tmdb_id', input.tmdbId)
        .single();

      let movieId: string;

      if (existing) {
        movieId = existing.id;
      } else {
        const { data: newMovie, error: insertError } = await supabase
          .from('movies')
          .insert({
            tmdb_id: input.tmdbId,
            media_type: input.mediaType,
            title: input.title,
            year: input.year ?? null,
            poster_url: input.posterUrl ?? null,
            overview: input.overview ?? null,
          })
          .select('id')
          .single();

        if (insertError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: insertError.message,
          });
        }
        movieId = newMovie.id;
      }

      const { data: existingLink } = await supabase
        .from('user_movies')
        .select('id')
        .eq('user_id', ctx.user.id)
        .eq('movie_id', movieId)
        .single();

      if (existingLink) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Фильм уже в списке',
        });
      }

      const { data: userMovie, error: linkError } = await supabase
        .from('user_movies')
        .insert({
          user_id: ctx.user.id,
          movie_id: movieId,
          status: 'planned',
        })
        .select(
          `
            id,
            status,
            movie:movies(id, tmdb_id, media_type, title, year, poster_url, overview)
            `
        )
        .single();

      if (linkError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: linkError.message,
        });
      }

      return userMovie;
    }),

  updateUserMovie: protectedProcedure
    .input(updateUserMovieSchema)
    .mutation(async ({ ctx, input }) => {
      const { userMovieId, ...updates } = input;

      const updateData: Record<string, unknown> = {};
      if (updates.status !== undefined) updateData.status = updates.status;

      const { data, error } = await supabase
        .from('user_movies')
        .update(updateData)
        .eq('id', userMovieId)
        .eq('user_id', ctx.user.id)
        .select(
          `
          id,
          status,
          movie:movies(id, title, poster_url, year)
          `
        )
        .single();

      if (error) {
        throw new TRPCError({
          code:
            error.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data ?? null;
    }),

  removeFromList: protectedProcedure
    .input(removeFromListSchema)
    .mutation(async ({ ctx, input }) => {
      const { error } = await supabase
        .from('user_movies')
        .delete()
        .eq('id', input.userMovieId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { success: true };
    }),

  searchMovies: protectedProcedure
    .input(searchMoviesSchema)
    .query(async (ctx, input) => {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'TMDB API Key is not set',
        });
      }

      const url = new URL('https://api.themoviedb.org/3/search/multi');
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('query', input.query);
      url.searchParams.set('language', 'ru-RU');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search movies',
        });
      }

      const json = (await response.json()) as { results: Movie[] };

      const results = json.results ?? [];
      return results
        .filter(
          (r) =>
            (r.media_type === 'movie' || r.media_type === 'tv') &&
            (r.title ?? r.name)
        )
        .map((r) => ({
          tmdbId: r.id,
          mediaType: r.media_type === 'tv' ? 'series' : 'movie',
          title: r.title ?? r.name ?? '',
          year:
            parseInt(
              (r.release_date ?? r.first_air_date ?? '').slice(0, 4),
              10
            ) || null,
          posterUrl: r.poster_path
            ? `https://image.tmdb.org/t/p/w200${r.poster_path}`
            : null,
          overview: r.overview ?? null,
        }));
    }),
});
