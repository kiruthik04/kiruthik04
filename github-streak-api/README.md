# GitHub Streak API

This is a dynamic SVG generation service for your GitHub README. It currently fetches your contribution data and renders it into a cool streak card.

## 🚀 Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Get a GitHub Personal Access Token (PAT)**:
    - Go to [GitHub Developer Settings > Personal Access Tokens > Tokens (classic)](https://github.com/settings/tokens).
    - Click **Generate new token (classic)**.
    - Give it a name (e.g., "Streak Card").
    - Select the **`read:user`** scope (this is enough for public stats). If you want private contributions to count, check `repo` as well (use with caution).
    - Click **Generate token** and copy it.

3.  **Configure Environment**:
    - Create a `.env` file in this directory.
    - Add your token:
      ```env
      GITHUB_TOKEN=your_generated_token_here
      ```

4.  **Run the Server**:
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3000`.

## 🖼️ Usage

To see your streak card, visit:
`http://localhost:3000/streak/YOUR_USERNAME`

Example:
`http://localhost:3000/streak/kiruthik04`

## 📦 Deployment (Vercel)

1.  Create a `vercel.json` file:
    ```json
    {
      "version": 2,
      "builds": [
        {
          "src": "api/index.js",
          "use": "@vercel/node"
        }
      ],
      "routes": [
        {
          "src": "/(.*)",
          "dest": "/api/index.js"
        }
      ]
    }
    ```
2.  Deploy using Vercel CLI or connect your GitHub repo to Vercel.
3.  Add `GITHUB_TOKEN` to your Vercel project Environment Variables.

## 📝 Embedding in README

Once deployed, you can use the URL in your usage:

```markdown
![GitHub Streak](https://your-vercel-app.vercel.app/streak/kiruthik04)
```
