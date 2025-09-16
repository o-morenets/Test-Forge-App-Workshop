import {invoke, requestJira} from "@forge/bridge";

type ResolverResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

export const saveUserData = (key: string, value: string): Promise<ResolverResponse> => {
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

export const getMyJiraIssues = async (): Promise<ResolverResponse> => {
  const response = await requestJira('/rest/api/3/issue/FRG-5');
  const jsonData = await response.json();

  console.log('Parsed JSON:', jsonData);

  return {
    success: true,
    data: jsonData
  };
};
