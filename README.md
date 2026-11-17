# RecipeBook

A React recipe discovery app built with Vite, Tailwind CSS, and Lucide icons. It uses TheMealDB public API and stores favorites and shopping-list items in the current browser using `localStorage`.

## Requirements

- Node.js 20.19+ (or a compatible current LTS release)
- npm
- Internet connection (recipes are loaded from TheMealDB)

## Run locally

1. Extract this project folder.
2. Open a terminal in the `recipebook-react-project` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in the terminal (usually `http://localhost:5173`).

## Create and test the production build

```bash
npm run build
npm run preview
```

Vite creates the deployable website in the `dist/` folder. Check the preview locally before submitting or deploying.

## Deploy to Vercel

1. Create a GitHub repository and upload the contents of this project folder.
2. Sign in to Vercel and choose **Add New → Project**.
3. Import the GitHub repository.
4. Use these build settings (Vercel usually detects them automatically):
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
5. Select **Deploy**. When deployment finishes, open the generated public URL and test it.

You can also deploy the same Vite project to Netlify using build command `npm run build` and publish directory `dist`.

## Notes for submission

- TheMealDB is the external recipe-data provider. The app includes a visible API credit in its footer; review the provider's current terms and attribution requirements before publishing.
- Favorites and shopping-list entries are saved in the visitor's own browser. They are not shared between users or devices.
- The app needs an internet connection to retrieve recipes.
- Do not add passwords, private information, or secret API credentials to frontend source code.
- Keep this README and the source files with your submission. Share the deployed URL with your lecturer; if source code is also required, share the repository or a ZIP of this folder according to your lecturer's instructions.
