import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { fetchGitHubStats } from './fetchStats.js';
import { generateSVG } from './svgTemplate.js';

async function generate() {
  try {
    // We will use the GitHub username from an environment variable, 
    // or fallback to the authenticated user's login.
    const username = process.env.GITHUB_USERNAME;
    
    if (!username) {
      throw new Error("Please set GITHUB_USERNAME in your environment variables.");
    }

    console.log(`Fetching stats for ${username}...`);
    const stats = await fetchGitHubStats(username);
    
    console.log(`Generating SVG...`);
    const svg = generateSVG(stats);

    // Save it to the root directory
    const outputPath = path.resolve('github-stats.svg');
    fs.writeFileSync(outputPath, svg, 'utf8');

    console.log(`Successfully generated ${outputPath}!`);
  } catch (error) {
    console.error('Error generating stats:', error);
    process.exit(1);
  }
}

generate();
