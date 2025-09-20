import {invoke} from "@forge/bridge";

type ResolverResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

export const saveAccessToken = (key: string, value: string): Promise<ResolverResponse> => {
  return invoke("saveAccessToken", {
    key,
    value,
  });
};

export const loadAccessToken = (key: string): Promise<ResolverResponse> => {
  return invoke("loadAccessToken", {
    key,
  });
};

export const getGithubRepos = (): Promise<ResolverResponse> => {
  return invoke("getGithubRepos", {});
};

export const mergePullRequest = (owner: string, repo: string, pullNumber: number): Promise<ResolverResponse> => {
  return invoke("mergePullRequest", {
    owner,
    repo,
    pullNumber,
  });
};

export const getJiraIssue = (key: string): Promise<ResolverResponse> => {
  return invoke("getJiraIssue", {
    key,
  });
};
