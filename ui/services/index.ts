import {invoke, requestJira} from "@forge/bridge";

type ResolverResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

export const saveAccessToken = (key: string, value: string): Promise<ResolverResponse> => {
  return invoke("saveUserData", {
    key,
    value,
  });
};

export const loadUserData = (key: string): Promise<ResolverResponse> => {
  return invoke("loadUserData", {
    key,
  });
};

export const getMyGithubRepos = (): Promise<ResolverResponse> => {
  return invoke("getMyGithubRepos", {});
};

export const mergePullRequest = (owner: string, repo: string, pullNumber: number): Promise<ResolverResponse> => {
  return invoke("mergePullRequest", {
    owner,
    repo,
    pullNumber,
  });
};

export const getMyJiraIssues = async (key: string): Promise<ResolverResponse> => {
  const response = await requestJira(`/rest/api/3/issue/${key}`);
  const jsonData = await response.json();

  console.log('Jira issue:', jsonData);

  return {
    success: true,
    data: jsonData
  };
};
