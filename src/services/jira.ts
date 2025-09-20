import api, {route} from "@forge/api";

export const getJiraIssue = async (key: string) => {
  try {
    const response = await api.asApp().requestJira(route`/rest/api/3/issue/${key}`);
    const jsonData = await response.json();

    return {
      success: true,
      data: jsonData
    };
  } catch (error) {
    console.error('Error fetching Jira issue:', error);

    return {
      success: false,
      error: `Error fetching Jira issue ${key}`
    };
  }
};

export const changeJiraIssueStatusToDone = async (key: string) => {
  try {
    const jiraIssueResult = await getJiraIssue(key);

    if (!jiraIssueResult.success) {
      console.error(`Jira issue ${key} not found.`);
      return;
    }

    console.log('Jira issue found:', jiraIssueResult.data.key);

    // Get available transitions using app context
    const transitionsRes = await api.asApp().requestJira(route`/rest/api/3/issue/${key}/transitions`);
    const transitionsData = await transitionsRes.json();

    console.log('Available transitions:', transitionsData.transitions.map((t: any) => t.name));

    // Look for common "Done" transition names
    const doneTransition = transitionsData.transitions.find((t: { name: string }) => 
      t.name.toLowerCase().includes('done') || 
      t.name.toLowerCase().includes('close') ||
      t.name.toLowerCase() === 'mark as done'
    );

    if (doneTransition) {
      await api.asApp().requestJira(route`/rest/api/3/issue/${key}/transitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transition: { id: doneTransition.id } }),
      });
      console.log(`Jira issue ${key} status changed to Done using transition: ${doneTransition.name}`);
    } else {
      console.log(`No 'Done' transition found for issue ${key}. Available transitions: ${transitionsData.transitions.map((t: any) => t.name).join(', ')}`);
    }
  } catch (error) {
    console.error(`Error changing status for Jira issue ${key}:`, error);
  }
}