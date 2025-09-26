import {changeJiraIssueStatusToDone} from "../services/jira";

export const webhookHandler = async (event: any) => {
  const payload = JSON.parse(event.body);

  if (payload.pull_request && payload.action === 'closed' && payload.pull_request.merged_at) {
    const prTitle = payload.pull_request.title;
    const prBranch = payload.pull_request.head.ref;
    const jiraIssueKey = (prTitle.match(/([A-Z]+-\d+)/) || prBranch.match(/([A-Z]+-\d+)/))?.[1] || null;

    if (jiraIssueKey) {
      await changeJiraIssueStatusToDone(jiraIssueKey);
    } else {
      console.log('No Jira key found in PR title or branch name.');
    }
  }

  return {
    statusCode: 200,
    body: 'Webhook triggered.'
  };
}
