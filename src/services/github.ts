import { Request } from "@forge/resolver";
import { Octokit } from "@octokit/core";
import { loadUserData } from "./storage";

export const getMyGithubRepos = async (req: Request) => {
  const accessToken = await loadUserData("access-token-field");
  
  if (!accessToken.success || !accessToken.data || typeof accessToken.data !== 'string') {
    return {
      success: false,
      error: "Access token not found in storage"
    };
  }
  
  const octokit = new Octokit({
    auth: accessToken.data
  })

  try {
    const reposResponse = await octokit.request(`GET /user/repos`, {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const repos = reposResponse.data;
    
    // Fetch pull requests for each repository
    const reposWithPRs = await Promise.all(
      repos.map(async (repo: any) => {
        try {
          const prResponse = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
            owner: repo.owner.login,
            repo: repo.name,
            per_page: 50,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
          
          return {
            ...repo,
            pullRequests: prResponse.data
          };
        } catch (error) {
          console.error(`Error fetching PRs for ${repo.name}:`, error);
          return {
            ...repo,
            pullRequests: []
          };
        }
      })
    );

    // Filter repos to only include those with PRs containing key format (e.g., ABCDE-12345)
    const keyPattern = /[A-Z]{3,5}-\d{1,5}/;
    const filteredRepos = reposWithPRs.filter(repo => 
      repo.pullRequests.some((pr: any) => 
        keyPattern.test(pr.title) || keyPattern.test(pr.body || '')
      )
    );

    // Check merge status only for filtered PRs
    const filteredReposWithMergeStatus = await Promise.all(
      filteredRepos.map(async (repo: any) => {
        const prsWithMergeStatus = await Promise.all(
          repo.pullRequests.map(async (pr: any) => {
            // Only check merge status for PRs that match the key pattern
            if (keyPattern.test(pr.title) || keyPattern.test(pr.body || '')) {
              try {
                const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
                  owner: repo.owner.login,
                  repo: repo.name,
                  pull_number: pr.number,
                  headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                  }
                });
                // Only status 204 means PR is merged
                return { ...pr, isMerged: response.status === 204 };
              } catch (error) {
                // Any error means PR is not merged
                return { ...pr, isMerged: false };
              }
            }
            return pr; // Return PR without merge status if it doesn't match pattern
          })
        );
        
        return {
          ...repo,
          pullRequests: prsWithMergeStatus
        };
      })
    );

    console.log('Repos with PRs containing keys:', JSON.stringify(filteredReposWithMergeStatus, null, 2));

    return {
      success: true,
      data: filteredReposWithMergeStatus,
    }
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: error
    };
  }
};

export const mergePullRequest = async (owner: string, repo: string, pullNumber: number, token: string) => {
  const octokit = new Octokit({
    auth: token
  });

  try {
    const response = await octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
      owner: owner,
      repo: repo,
      pull_number: pullNumber,
      commit_title: 'Merge pull request',
      commit_message: 'Merged via Forge app',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error merging PR:', error);
    return {
      success: false,
      error: error
    };
  }
};

