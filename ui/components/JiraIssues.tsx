import {Box, Strong, Text} from '@forge/react';

interface JiraIssues {
  jiraIssues?: any;
}

export const JiraIssues: React.FC<JiraIssues> = ({ jiraIssues }) => {
  if (!jiraIssues) {
    return null;
  }

  // Handle error case
  if (jiraIssues.success === false) {
    return (
      <Box>
        <Text as="strong">Error loading Jira issue:</Text>
        <Text>{jiraIssues.error}</Text>
      </Box>
    );
  }

  // Handle successful JSON data
  const issueData = jiraIssues.data || jiraIssues;
  
  return (
    <Box>
      <Text as="strong">Jira Issue:</Text>
      <Text>
        <Strong>{issueData.key}</Strong> - {issueData.fields?.summary || 'No summary'}
      </Text>
      <Text>Status: {issueData.fields?.status?.name || 'Unknown'}</Text>
      <Text>Type: {issueData.fields?.issuetype?.name || 'Unknown'}</Text>
    </Box>
  );
};