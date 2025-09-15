import Resolver from '@forge/resolver';
import {loadUserData, saveUserData} from "../services/storage";
import {getMyGithubRepos} from "../services/github";

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
})

export const handler: any = resolver.getDefinitions();
