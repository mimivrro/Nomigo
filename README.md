# 🍽️ Nomigo

> *Cook the world, one ingredient at a time.*

Nomigo is a food recipe web app that lets you explore global cuisines by region and find recipes based on ingredients you already have at home — reducing food waste and making cooking more fun.

---

## ✨ Features

- **Explore by Region** — Browse cuisines across Asia, Europe, the Americas, Africa, Oceania, and the Middle East via an interactive region map
- **Search by Ingredients** — Add whatever's in your fridge and get matched recipes ranked by ingredient overlap
- **Browse All Recipes** — Explore the full recipe collection for any cuisine
- **Recipe Detail View** — Step-by-step instructions, ingredients with measurements, cooking time, servings, and difficulty
- **Save Recipes** — Bookmark your favourite recipes (stored in localStorage)
- **Authentication** — Sign up / sign in with Supabase Auth
- **Dark Editorial UI** — Warm dark gold aesthetic with Cormorant Garamond typography and moody food photography

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS + custom CSS-in-JS |
| Backend / DB | Supabase (PostgreSQL) |
| External API | [TheMealDB](https://www.themealdb.com/) |
| Auth | Supabase Auth |
| Build Tool | Vite |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth.tsx              # Login / Sign up modal
│   ├── CuisineView.tsx       # Cuisine list & detail after region select
│   ├── Header.tsx            # Sticky nav header
│   ├── HomePage.tsx          # Landing page with hero, map, about
│   ├── IngredientSearch.tsx  # Leftover ingredient search + recipe matching
│   ├── RecipeBrowser.tsx     # Browse all recipes for a cuisine (MealDB)
│   ├── RecipeCard.tsx        # Recipe card used in ingredient search results
│   ├── RecipeDetail.tsx      # Full recipe detail modal (Supabase recipes)
│   └── RegionMap.tsx         # Interactive region selector grid
├── contexts/
│   └── AuthContext.tsx       # Supabase auth context & hooks
├── lib/
│   └── supabase.ts           # Supabase client setup
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🗄️ Database Schema (Supabase)

```sql
-- Cuisines table
cuisines (
  id          uuid primary key,
  name        text,
  region      text,   -- 'asia' | 'europe' | 'americas' | 'africa' | 'oceania' | 'middle-east'
  description text,
  image_url   text
)

-- Recipes table
recipes (
  id            uuid primary key,
  cuisine_id    uuid references cuisines(id),
  name          text,
  description   text,
  instructions  text,
  difficulty    text,   -- 'Easy' | 'Medium' | 'Hard'
  cooking_time  int,    -- minutes
  servings      int,
  image_url     text
)

-- Ingredients table
ingredients (
  id       uuid primary key,
  name     text,
  category text
)

-- Recipe <-> Ingredient join table
recipe_ingredients (
  recipe_id     uuid references recipes(id),
  ingredient_id uuid references ingredients(id),
  quantity      text,
  unit          text
)
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/mimivrro/Nomigoo.git
cd Nomigoo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these in your Supabase project under **Settings → API**.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌍 Deployment

This project is built with Vite and can be deployed to any static hosting platform.

### Vercel (recommended)

```bash
npm run build
# Then connect your GitHub repo to Vercel — it auto-detects Vite
```

### Netlify

```bash
npm run build
# Publish the dist/ folder via Netlify drag-and-drop or CLI
```

> Make sure to add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your deployment platform's settings.

---

## 📸 Screenshots

| Homepage | Region Map | Recipe Detail |
|----------|------------|---------------|
| Dark hero with food photography | Interactive cuisine region grid | Ingredients + step-by-step instructions |

---

## 🙏 Acknowledgements

- [TheMealDB](https://www.themealdb.com/) — Free recipe API used for browsing recipes
- [Supabase](https://supabase.com/) — Backend, database, and authentication
- [Unsplash](https://unsplash.com/) — Food photography used for cuisine images
- [Lucide React](https://lucide.dev/) — Icon library
- [Google Fonts](https://fonts.google.com/) — Cormorant Garamond & Jost typefaces

---

## 👩‍💻 Author

Made with ♥ by [@mimivrro](https://github.com/mimivrro)

---

*© 2026 Nomigo. All Rights Reserved.*
