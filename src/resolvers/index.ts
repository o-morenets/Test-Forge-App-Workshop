import Resolver from '@forge/resolver';
import {loadUserData, saveUserData} from "../services/storage";
import {getMyGithubRepos, mergePullRequest} from "../services/github";
import {getJiraIssue} from "../services/jira";

const resolver = new Resolver();

resolver.define("saveUserData", async (req) => {
  const {key, value} = req.payload;

  return saveUserData(key, value);
});

resolver.define("loadUserData", async (req) => {
  const {key} = req.payload;

  return loadUserData(key);
});

resolver.define("getMyGithubRepos", async (req) => {
  return getMyGithubRepos(req);
});

resolver.define("mergePullRequest", async (req) => {
  const {owner, repo, pullNumber} = req.payload;
  
  const accessToken = await loadUserData("access-token-field");
  
  if (!accessToken.success || !accessToken.data || typeof accessToken.data !== 'string') {
    return {
      success: false,
      error: "Access token not found in storage"
    };
  }
  
  return mergePullRequest(owner, repo, pullNumber, accessToken.data);
});

resolver.define("getJiraIssue", async (req) => {
  const {key} = req.payload;
  return getJiraIssue(key);
});

export const handler: any = resolver.getDefinitions();
