const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const STATS_QUERY = `
  query userInfo($login: String!) {
    user(login: $login) {
      name
      login
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
        totalCount
        nodes {
          stargazers {
            totalCount
          }
        }
      }
      pullRequests {
        totalCount
      }
      issues {
        totalCount
      }
      contributionsCollection {
        totalCommitContributions
        restrictedContributionsCount
      }
    }
  }
`;

export async function fetchGitHubStats(username) {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    throw new Error('GITHUB_TOKEN is missing from environment variables');
  }

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: STATS_QUERY,
      variables: { login: username },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  const user = result.data.user;

  // Calculate total stars
  const totalStars = user.repositories.nodes.reduce((acc, repo) => {
    return acc + repo.stargazers.totalCount;
  }, 0);

  // Total commits (public + private if access token allows)
  const totalCommits = 
    user.contributionsCollection.totalCommitContributions + 
    user.contributionsCollection.restrictedContributionsCount;

  return {
    name: user.name || user.login,
    totalStars,
    totalCommits,
    totalPRs: user.pullRequests.totalCount,
    totalIssues: user.issues.totalCount,
  };
}
