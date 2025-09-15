import { Request } from "@forge/resolver";
import { Octokit } from "@octokit/core";
import { loadUserData } from "./storage";

export const getMyGithubRepos = async (req: Request) => {
  // Load username and access token from storage
  const usernameResult = await loadUserData("username-field");
  const tokenResult = await loadUserData("access-token-field");
  
  if (!usernameResult.success || !usernameResult.data) {
    return {
      success: false,
      error: "Username not found in storage"
    };
  }
  
  if (!tokenResult.success || !tokenResult.data) {
    return {
      success: false,
      error: "Access token not found in storage"
    };
  }
  
  const username = usernameResult.data;
  const octokit = new Octokit({
    auth: tokenResult.data
  })

  try {
    const response = await octokit.request(`GET /users/${username}/repos`, {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    console.log(response.data);

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error(error);
  }
};
