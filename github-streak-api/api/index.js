const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { fetchContributionData, fetchStats } = require('../src/github-client');
const { calculateStreak } = require('../src/streak-calculator');
const { calculateStats, calculateLanguages } = require('../src/stats-calculator');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const CACHE_DURATION = 14400; // 4 hours

function setHeaders(res) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}`);
}

app.get('/streak/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const token = process.env.GITHUB_TOKEN;

        if (!token) return res.status(500).send('GITHUB_TOKEN missing');

        const userData = await fetchContributionData(username, token);
        const stats = calculateStreak(userData);

        // Read SVG template
        let svgTemplate = fs.readFileSync(path.join(__dirname, '../template.svg'), 'utf8');

        // Replace placeholders
        svgTemplate = svgTemplate
            .replace(/{{totalContributions}}/g, stats.totalContributions)
            .replace(/{{totalContributionsRange}}/g, `${new Date(userData.createdAt).getFullYear()} - Present`)
            .replace(/{{currentStreak}}/g, stats.currentStreak)
            .replace(/{{currentStreakRange}}/g, stats.currentStreakRange || 'No current streak')
            .replace(/{{longestStreak}}/g, stats.longestStreak)
            .replace(/{{longestStreakRange}}/g, stats.longestStreakRange || 'No streak');

        setHeaders(res);
        res.send(svgTemplate);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating streak card');
    }
});

app.get('/stats/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const token = process.env.GITHUB_TOKEN;
        if (!token) return res.status(500).send('GITHUB_TOKEN missing');

        const userData = await fetchStats(username, token);
        const stats = calculateStats(userData);

        let svgTemplate = fs.readFileSync(path.join(__dirname, '../templates/stats.svg'), 'utf8');

        svgTemplate = svgTemplate
            .replace(/{{totalStars}}/g, stats.totalStars)
            .replace(/{{totalCommits}}/g, stats.totalCommits)
            .replace(/{{totalPRs}}/g, stats.totalPRs)
            .replace(/{{totalIssues}}/g, stats.totalIssues);

        setHeaders(res);
        res.send(svgTemplate);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating stats card');
    }
});

app.get('/languages/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const token = process.env.GITHUB_TOKEN;
        if (!token) return res.status(500).send('GITHUB_TOKEN missing');

        const userData = await fetchStats(username, token);
        const languages = calculateLanguages(userData);

        let svgTemplate = fs.readFileSync(path.join(__dirname, '../templates/langs.svg'), 'utf8');

        // Generate SVG for language list
        let langSvg = '';
        languages.forEach((lang, index) => {
            const y = index * 25;
            const width = Math.max(10, Math.min(100, parseFloat(lang.percentage))); // Normalize roughly for visualization

            langSvg += `
        <g transform="translate(0, ${y})">
          <circle cx="5" cy="5" r="5" fill="${lang.color}" />
          <text x="15" y="9" class="lang-name">${lang.name} (${lang.percentage}%)</text>
          <rect x="150" y="2" width="100" height="8" class="progress-bg" />
          <rect x="150" y="2" width="${width}" height="8" fill="${lang.color}" class="progress-bar" />
        </g>
      `;
        });

        svgTemplate = svgTemplate.replace('{{languages}}', langSvg);

        setHeaders(res);
        res.send(svgTemplate);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating languages card');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
