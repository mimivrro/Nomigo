/*
  # Nomigo Recipe Database Schema

  ## New Tables
  
  ### cuisines
  - `id` (uuid, primary key)
  - `name` (text) - Cuisine name (e.g., "Italian", "Japanese")
  - `region` (text) - Geographical region (e.g., "Europe", "Asia")
  - `description` (text) - Brief description of the cuisine
  - `image_url` (text) - URL to cuisine image
  - `created_at` (timestamptz)
  
  ### recipes
  - `id` (uuid, primary key)
  - `cuisine_id` (uuid, foreign key) - References cuisines
  - `name` (text) - Recipe name
  - `description` (text) - Brief description
  - `instructions` (text) - Cooking instructions
  - `difficulty` (text) - Easy, Medium, Hard
  - `cooking_time` (integer) - Time in minutes
  - `servings` (integer) - Number of servings
  - `image_url` (text) - URL to recipe image
  - `created_at` (timestamptz)
  
  ### ingredients
  - `id` (uuid, primary key)
  - `name` (text, unique) - Ingredient name
  - `category` (text) - Vegetable, Meat, Spice, etc.
  - `created_at` (timestamptz)
  
  ### recipe_ingredients
  - `id` (uuid, primary key)
  - `recipe_id` (uuid, foreign key) - References recipes
  - `ingredient_id` (uuid, foreign key) - References ingredients
  - `quantity` (text) - Amount needed
  - `unit` (text) - cup, tbsp, gram, etc.
  - `created_at` (timestamptz)
  
  ### user_profiles
  - `id` (uuid, primary key) - References auth.users
  - `username` (text, unique)
  - `dietary_restrictions` (text[]) - Array of restrictions
  - `favorite_cuisines` (uuid[]) - Array of cuisine IDs
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### user_favorite_recipes
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References user_profiles
  - `recipe_id` (uuid, foreign key) - References recipes
  - `created_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Public read access for cuisines, recipes, ingredients, and recipe_ingredients
  - Authenticated users can manage their own profiles and favorites
*/

-- Create cuisines table
CREATE TABLE IF NOT EXISTS cuisines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuisine_id uuid REFERENCES cuisines(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  instructions text NOT NULL,
  difficulty text DEFAULT 'Medium',
  cooking_time integer DEFAULT 30,
  servings integer DEFAULT 4,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text DEFAULT 'Other',
  created_at timestamptz DEFAULT now()
);

-- Create recipe_ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  quantity text NOT NULL,
  unit text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  dietary_restrictions text[] DEFAULT ARRAY[]::text[],
  favorite_cuisines uuid[] DEFAULT ARRAY[]::uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_favorite_recipes table
CREATE TABLE IF NOT EXISTS user_favorite_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_recipes ENABLE ROW LEVEL SECURITY;

-- Cuisines policies (public read)
CREATE POLICY "Anyone can view cuisines"
  ON cuisines FOR SELECT
  TO authenticated, anon
  USING (true);

-- Recipes policies (public read)
CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT
  TO authenticated, anon
  USING (true);

-- Ingredients policies (public read)
CREATE POLICY "Anyone can view ingredients"
  ON ingredients FOR SELECT
  TO authenticated, anon
  USING (true);

-- Recipe ingredients policies (public read)
CREATE POLICY "Anyone can view recipe ingredients"
  ON recipe_ingredients FOR SELECT
  TO authenticated, anon
  USING (true);

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User favorite recipes policies
CREATE POLICY "Users can view own favorites"
  ON user_favorite_recipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorite_recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorite_recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_recipe ON user_favorite_recipes(recipe_id);