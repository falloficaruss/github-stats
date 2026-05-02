import express from 'express';
import 'dotenv/config';
import { fetchGitHubStats } from './fetchStats.js';
import { generateSVG } from './svgTemplate.js';

const app = express();
const PORT = process.env.PORT || 3000;

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
