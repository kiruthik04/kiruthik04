const axios = require('axios');

const GITHUB_API_URL = 'https://api.github.com/graphql';

async function fetchContributionData(username, token) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        createdAt
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      GITHUB_API_URL,
      { query, variables: { username } },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching data from GitHub:', error.message);
    throw error;
  }
}

async function fetchStats(username, token) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}, privacy: PUBLIC) {
          nodes {
            stargazers {
              totalCount
            }
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  color
                  name
                }
              }
            }
          }
        }
        contributionsCollection {
          totalCommitContributions
          restrictedContributionsCount
        }
        pullRequests(first: 1) {
          totalCount
        }
        issues(first: 1) {
          totalCount
        }
        followers {
          totalCount
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      GITHUB_API_URL,
      { query, variables: { username } },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching stats from GitHub:', error.message);
    throw error;
  }
}

module.exports = { fetchContributionData, fetchStats };
