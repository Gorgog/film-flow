import { supabase } from '@/lib/supabase';
import { fetchDetails, ITmdbMovieCache, searchMulti } from '@/lib/tmdb';
import { protectedProcedure, router } from '@/trpc/trpc';
import {
  addToMyListSchema,
  getMyListSchema,
  removeFromListSchema,
  searchMoviesSchema,
  updateUserMovieSchema,
} from '@film-flow/shared';
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
        let details: ITmdbMovieCache | null = null;

        try {
          details = await fetchDetails(input.tmdbId, input.mediaType);
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Не удалось загрузить данные с TMDB',
          });
        }

        if (details === null) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Контент не найден в TMDB',
          });
        }

        const { data: newMovie, error: insertError } = await supabase
          .from('movies')
          .insert({
            tmdb_id: input.tmdbId,
            media_type: input.mediaType,
            title: details.title,
            year: details.year,
            poster_url: details.posterUrl,
            overview: details.overview,
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
    .query(async ({ ctx, input }) => {
      try {
        const hits = await searchMulti(input.query);
        return hits;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }),
});
