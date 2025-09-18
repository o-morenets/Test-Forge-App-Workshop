import {requestJira} from "@forge/bridge";

export const getJiraIssue = async (key: string) => {
  const response = await requestJira(`/rest/api/3/issue/${key}`);
  const jsonData = await response.json();

  console.log('Jira issue:', jsonData);

  return {
    success: true,
    data: jsonData
  };
};
