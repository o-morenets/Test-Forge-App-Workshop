import Resolver from '@forge/resolver';
import {loadAccessToken, saveAccessToken} from "../services/storage";
import {getGithubRepos, mergePullRequest} from "../services/github";
// import {getJiraIssue} from "../services/jira";

const resolver = new Resolver();

resolver.define("saveAccessToken", async (req) => {
  const {key, value} = req.payload;

  return saveAccessToken(key, value);
});

resolver.define("loadAccessToken", async (req) => {
  const {key} = req.payload;

  return loadAccessToken(key);
});

resolver.define("getGithubRepos", async (req) => {
  return getGithubRepos(req);
});

resolver.define("mergePullRequest", async (req) => {
  const {owner, repo, pullNumber} = req.payload;
  
  return mergePullRequest(owner, repo, pullNumber);
});

// resolver.define("getJiraIssue", async (req) => {
//   const {key} = req.payload;
//
//   return getJiraIssue(key);
// });

export const handler: any = resolver.getDefinitions();
