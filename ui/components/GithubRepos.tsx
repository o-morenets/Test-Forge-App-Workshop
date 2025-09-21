import {Box, Code, Inline, Link, LoadingButton, Lozenge, Stack, Strong, Text, xcss} from '@forge/react';
import {useEffect, useState} from 'react';
import {getGithubRepos, getJiraIssue, mergePullRequest} from '../services';

// XCSS styles for consistent column widths
const mergeButtonStyle = xcss({
  minWidth: '100px',
  display: 'inline-block',
});

const prTitleStyle = xcss({
  minWidth: '300px',
  maxWidth: '300px',
  display: 'inline-block',
});

const branchContainerStyle = xcss({
  minWidth: '300px',
  maxWidth: '300px',
  display: 'inline-block',
});

const branchFromStyle = xcss({
  display: 'inline-block',
});

const arrowStyle = xcss({
  display: 'inline-block',
  marginInline: 'space.050',
});

const branchToStyle = xcss({
  display: 'inline-block',
});

const issueTypeStyle = xcss({
  minWidth: '80px',
  display: 'inline-block',
});

const jiraKeyStyle = xcss({
  minWidth: '100px',
  display: 'inline-block',
});

const issueDescriptionStyle = xcss({
  minWidth: '300px',
  maxWidth: '300px',
  display: 'inline-block',
});

const issueStatusStyle = xcss({
  minWidth: '100px',
  display: 'inline-block',
});

interface GithubReposProps {
  githubRepos?: any;
  onReposUpdate?: (repos: any) => void;
}

interface RepoItemProps {
  repo: any;
  onReposUpdate?: (repos: any) => void;
}

const RepoItem: React.FC<RepoItemProps> = ({repo, onReposUpdate}) => {
  const [mergingPRs, setMergingPRs] = useState<Set<number>>(new Set());
  const [mergedPRs, setMergedPRs] = useState<Set<number>>(new Set());
  const [lastMergedPR, setLastMergedPR] = useState<number | null>(null);
  const [jiraIssues, setJiraIssues] = useState<Map<string, any>>(new Map());

  // Show all PRs including those with conflicts
  const visiblePRs = repo.pullRequests || [];

  // Extract Jira key from PR title or branch name
  const extractJiraKey = (pr: any): string | null => {
    const keyPattern = /([A-Z]+-\d+)/;
    const titleMatch = pr.title.match(keyPattern);
    const branchMatch = pr.head?.ref?.match(keyPattern);
    return titleMatch?.[1] || branchMatch?.[1] || null;
  };

  // Fetch Jira issue details
  const fetchJiraIssue = async (jiraKey: string) => {
    if (jiraIssues.has(jiraKey)) return; // Already fetched

    try {
      const response = await getJiraIssue(jiraKey);
      if (response.success) {
        setJiraIssues(prev => new Map(prev.set(jiraKey, response.data)));
      } else {

        // Mark as not found so we don't keep trying to fetch it
        setJiraIssues(prev => new Map(prev.set(jiraKey, null)));
      }
    } catch (error) {
      console.error(`Error fetching Jira issue ${jiraKey}:`, error);

      // Mark as not found on error as well
      setJiraIssues(prev => new Map(prev.set(jiraKey, null)));
    }
  };

  // Fetch Jira issues for all visible PRs
  useEffect(() => {
    visiblePRs.forEach((pr: any) => {
      const jiraKey = extractJiraKey(pr);
      if (jiraKey) {
        fetchJiraIssue(jiraKey);
      }
    });
  }, [visiblePRs]);

  // Refresh specific Jira issue when merge completes
  const refreshJiraIssue = (jiraKey: string) => {
    if (!jiraKey) return;

    // Remove the specific issue from cache to force refresh
    setJiraIssues(prev => {
      const newMap = new Map(prev);
      newMap.delete(jiraKey);
      return newMap;
    });

    // Re-fetch only this specific Jira issue
    fetchJiraIssue(jiraKey);
  };


  const handleMergePR = async (pr: any) => {
    setMergingPRs(prev => new Set(prev.add(pr.number)));

    try {
      const response = await mergePullRequest(repo.owner.login, repo.name, pr.number);
      if (response.success) {
        console.log('PR merged successfully:', pr.number);

        // Mark PR as merged immediately
        setMergedPRs(prev => new Set(prev.add(pr.number)));

        // Set this as the last merged PR (for loading indicator)
        setLastMergedPR(pr.number);

        // Refresh only this PR's Jira issue to get updated status
        const jiraKey = extractJiraKey(pr);
        if (jiraKey) {
          setTimeout(() => refreshJiraIssue(jiraKey), 2000); // Wait 2 seconds for webhook to process
        }

        // Clear loading state after some time
        setTimeout(() => setLastMergedPR(null), 15000); // Clear after 15 seconds

        // Refresh all repos to update mergeable status of other PRs
        if (onReposUpdate) {
          setTimeout(async () => {
            try {
              console.log('Refreshing all repos to check for new merge conflicts...');
              const reposResponse = await getGithubRepos();
              if (reposResponse.success) {
                onReposUpdate(reposResponse.data);
              }
            } catch (error) {
              console.error('Error refreshing repos after merge:', error);
            }
          }, 3000); // Wait 3 seconds for GitHub to process the merge
        }
      } else {
        console.error('Failed to merge PR:', response.error);
      }
    } catch (error) {
      console.error('Error merging PR:', error);
    } finally {
      setMergingPRs(prev => {
        const newSet = new Set(prev);
        newSet.delete(pr.number);

        return newSet;
      });
    }
  };

  // No PRs to show
  if (!visiblePRs || visiblePRs.length === 0) {
    return null;
  }

  return (
    <Box paddingBlockStart="space.300">
      <Text>
        <Link href={repo.html_url} openNewTab>
          <Strong>{repo.name}</Strong>
        </Link>
        {repo.language && <> <Lozenge
            appearance="new">{repo.language}</Lozenge></>}{repo.description && ` - ${repo.description}`}
      </Text>

      <Box paddingInlineStart="space.200" paddingBlockStart="space.050">
        <Text size="small">Pull Requests:</Text>
        <Box paddingBlockStart="space.100">
          <Stack space="space.050">
            {visiblePRs.map((pr: any) => {
              const isMergeable = pr.mergeable === true && pr.mergeable_state !== 'dirty';
              const isCalculating = pr.mergeable === null;
              const isLoading = mergingPRs.has(pr.number);
              const isMerged = pr.merged || mergedPRs.has(pr.number);

              const jiraKey = extractJiraKey(pr);
              const jiraIssue = jiraKey ? jiraIssues.get(jiraKey) : null;
              const isLastMerged = lastMergedPR === pr.number;

              return (
                <Box key={pr.id} paddingBlockStart="space.050">
                  <Inline space="space.100" alignBlock="center" shouldWrap>
                    {/* Merge Button - Fixed width */}
                    <Box xcss={mergeButtonStyle}>
                      <LoadingButton
                        isLoading={isLoading}
                        spacing="compact"
                        appearance={isMerged ? "primary" : isMergeable ? "primary" : isCalculating ? "default" : "warning"}
                        onClick={() => handleMergePR(pr)}
                        isDisabled={isLoading || !isMergeable || isMerged}
                      >
                        {isMerged ? 'Merged' : isMergeable ? 'Merge' : isCalculating ? 'Waiting...' : 'Conflicts'}
                      </LoadingButton>
                    </Box>
                    
                    {/* PR Title - Flexible width */}
                    <Box xcss={prTitleStyle}>
                      <Link href={pr.html_url} openNewTab>
                        {pr.title}
                      </Link>
                    </Box>
                    
                    {/* Branch Container - Fixed width 300px */}
                    <Box xcss={branchContainerStyle}>
                      <Box xcss={branchFromStyle}>
                        <Link href={`${repo.html_url}/tree/${pr.head?.ref || 'main'}`} openNewTab>
                          <Code>{pr.head?.ref || 'unknown'}</Code>
                        </Link>
                      </Box>
                      <Box xcss={arrowStyle}>
                        <Text size="small">→</Text>
                      </Box>
                      <Box xcss={branchToStyle}>
                        <Link href={`${repo.html_url}/tree/${pr.base?.ref || 'main'}`} openNewTab>
                          <Code>{pr.base?.ref || 'unknown'}</Code>
                        </Link>
                      </Box>
                    </Box>
                    
                    {/* Jira Issue Elements */}
                    {jiraKey && (
                      <>
                        {jiraIssue && (
                          <>
                            {/* Issue Type - Fixed width */}
                            <Box xcss={issueTypeStyle}>
                              <Lozenge appearance="default">
                                {jiraIssue.fields?.issuetype?.name || 'Unknown'}
                              </Lozenge>
                            </Box>
                            
                            {/* Jira Key - Fixed width */}
                            <Box xcss={jiraKeyStyle}>
                              <Lozenge appearance="inprogress" isBold>{jiraKey}</Lozenge>
                            </Box>
                            
                            {/* Issue Description - Flexible width */}
                            <Box xcss={issueDescriptionStyle}>
                              <Text size="small">
                                {jiraIssue.fields?.summary || 'No description'}
                              </Text>
                            </Box>
                            
                            {/* Issue Status - Fixed width */}
                            <Box xcss={issueStatusStyle}>
                              <Lozenge
                                appearance={
                                  isLastMerged ? 'default' :
                                    jiraIssue.fields?.status?.name?.toLowerCase() === 'to do' ? 'new' :
                                      jiraIssue.fields?.status?.name?.toLowerCase() === 'in progress' ? 'inprogress' :
                                        jiraIssue.fields?.status?.name?.toLowerCase() === 'done' ? 'success' :
                                          'default'
                                }
                              >
                                {isLastMerged ? 'Loading...' : (jiraIssue.fields?.status?.name || 'Unknown')}
                              </Lozenge>
                            </Box>
                          </>
                        )}
                        {jiraIssues.has(jiraKey) && jiraIssue === null && (
                          <>
                            {/* Issue Type - Not Found */}
                            <Box xcss={issueTypeStyle}>
                              <Lozenge appearance="removed">Unknown</Lozenge>
                            </Box>
                            
                            {/* Jira Key - Not Found */}
                            <Box xcss={jiraKeyStyle}>
                              <Lozenge appearance="inprogress" isBold>{jiraKey}</Lozenge>
                            </Box>
                            
                            {/* Issue Description - Not Found */}
                            <Box xcss={issueDescriptionStyle}>
                              <Text size="small">Issue not found</Text>
                            </Box>
                            
                            {/* Issue Status - Not Found */}
                            <Box xcss={issueStatusStyle}>
                              <Lozenge appearance="removed">Unknown</Lozenge>
                            </Box>
                          </>
                        )}
                        {!jiraIssues.has(jiraKey) && (
                          <>
                            {/* Issue Type - Loading */}
                            <Box xcss={issueTypeStyle}>
                              <Lozenge appearance="default">Loading...</Lozenge>
                            </Box>
                            
                            {/* Jira Key - Loading */}
                            <Box xcss={jiraKeyStyle}>
                              <Lozenge appearance="inprogress" isBold>{jiraKey}</Lozenge>
                            </Box>
                            
                            {/* Issue Description - Loading */}
                            <Box xcss={issueDescriptionStyle}>
                              <Text size="small">Loading description...</Text>
                            </Box>
                            
                            {/* Issue Status - Loading */}
                            <Box xcss={issueStatusStyle}>
                              <Lozenge appearance="default">Loading...</Lozenge>
                            </Box>
                          </>
                        )}
                      </>
                    )}
                  </Inline>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Box>

    </Box>
  );
};

export const GithubRepos: React.FC<GithubReposProps> = ({githubRepos, onReposUpdate}) => {
  if (!githubRepos) {
    return null;
  }

  if (Array.isArray(githubRepos) && githubRepos.length === 0) {
    return (
      <Box>
        <Text>No repositories found.</Text>
      </Box>
    );
  }

  if (Array.isArray(githubRepos)) {
    return (
      <Box>
        <Text as="strong">GitHub Repositories:</Text>
        {githubRepos.map((repo: any, index: number) => (
          <RepoItem
            key={repo.id || index}
            repo={repo}
            onReposUpdate={onReposUpdate}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Text>Error loading repositories.</Text>
    </Box>
  );
};