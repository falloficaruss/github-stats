import express from 'express';
import 'dotenv/config';
import { fetchGitHubStats } from './fetchStats.js';
import { generateSVG } from './svgTemplate.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; padding: 2rem; background: #282a36; color: #f8f8f2;">
        <h1>GitHub Stats Server is Running! 🚀</h1>
        <p>To view your stats, access the API endpoint with your username:</p>
        <code style="background: #44475a; padding: 0.5rem; border-radius: 4px;">/api?username=YOUR_GITHUB_USERNAME</code>
        <br><br>
        <p>Example: <a href="/api?username=torvalds" style="color: #8be9fd;">/api?username=torvalds</a></p>
      </body>
    </html>
  `);
});

app.get('/api', async (req, res) => {
  try {
    const username = req.query.username;
    
    if (!username) {
      return res.status(400).send('Please provide a username parameter, e.g. /api?username=torvalds');
    }

    const stats = await fetchGitHubStats(username);
    const svg = generateSVG(stats);

    res.setHeader('Content-Type', 'image/svg+xml');
    // Cache for 2 hours
    res.setHeader('Cache-Control', 'public, max-age=7200');
    res.send(svg);

  } catch (error) {
    console.error('Error rendering stats:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Try accessing: http://localhost:${PORT}/api?username=yourusername`);
});
