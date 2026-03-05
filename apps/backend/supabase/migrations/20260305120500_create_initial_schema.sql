-- 1. Таблица movies
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id BIGINT UNIQUE NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'cartoon', 'series')),
  title TEXT NOT NULL,
  year INT,
  poster_url TEXT,
  overview TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Функция updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Таблица profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Таблица user_movies
CREATE TABLE user_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'watched')),
  progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  current_season INT,
  current_episode INT,
  total_seasons INT,
  total_episodes INT,
  last_watched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

CREATE TRIGGER user_movies_updated_at
  BEFORE UPDATE ON user_movies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Таблица user_movie_ratings
CREATE TABLE user_movie_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_movie_id UUID NOT NULL REFERENCES user_movies(id) ON DELETE CASCADE UNIQUE,
  overall NUMERIC(3,1) CHECK (overall >= 0 AND overall <= 10),
  acting NUMERIC(3,1) CHECK (acting >= 0 AND acting <= 10),
  plot NUMERIC(3,1) CHECK (plot >= 0 AND plot <= 10),
  emotions NUMERIC(3,1) CHECK (emotions >= 0 AND emotions <= 10),
  visuals NUMERIC(3,1) CHECK (visuals >= 0 AND visuals <= 10),
  music NUMERIC(3,1) CHECK (music >= 0 AND music <= 10),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER user_movie_ratings_updated_at
  BEFORE UPDATE ON user_movie_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movies_read" ON movies FOR SELECT USING (true);
CREATE POLICY "movies_insert" ON movies FOR INSERT WITH CHECK (true);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE user_movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_movies_all" ON user_movies FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_movie_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_movie_ratings_all" ON user_movie_ratings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_movies
      WHERE user_movies.id = user_movie_ratings.user_movie_id
      AND user_movies.user_id = auth.uid()
    )
  );