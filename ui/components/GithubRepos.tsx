import {Text, Box, Lozenge, Strong, Link, Stack, Button, Inline, Code} from '@forge/react';
import { useState, useEffect } from 'react';
import { mergePullRequest, getGithubRepos, getJiraIssue } from '../services';

interface GithubReposProps {
  githubRepos?: any;
  onReposUpdate?: (repos: any) => void;
}

interface RepoItemProps {
  repo: any;
  onMergeComplete?: () => void;
  onJiraRefreshNeeded?: () => void;
}

const RepoItem: React.FC<RepoItemProps> = ({ repo, onMergeComplete, onJiraRefreshNeeded }) => {
  const [mergingPRs, setMergingPRs] = useState<Set<number>>(new Set());
  const [mergedPRs, setMergedPRs] = useState<Set<number>>(new Set());
  const [lastMergedPR, setLastMergedPR] = useState<number | null>(null);
  const [jiraIssues, setJiraIssues] = useState<Map<string, any>>(new Map());

  // Show all PRs (no filtering needed)
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
      }
    } catch (error) {
      console.error(`Error fetching Jira issue ${jiraKey}:`, error);
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

  // Refresh Jira issues when merges complete
  const refreshJiraIssues = () => {
    // Clear cached Jira issues to force refresh
    setJiraIssues(new Map());
    // Re-fetch all Jira issues
    visiblePRs.forEach((pr: any) => {
      const jiraKey = extractJiraKey(pr);
      if (jiraKey) {
        fetchJiraIssue(jiraKey);
      }
    });
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
        // Refresh Jira issues to get updated status
        setTimeout(() => refreshJiraIssues(), 2000); // Wait 2 seconds for webhook to process
        // Clear loading state after some time
        setTimeout(() => setLastMergedPR(null), 15000); // Clear after 15 seconds
        // Notify parent component about merge completion
        onMergeComplete?.();
        onJiraRefreshNeeded?.();
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

  // Show repo if it has any PRs
  if (!visiblePRs || visiblePRs.length === 0) {
    return null;
  }

  return (
    <Box paddingBlockStart="space.300">
      <Text>
        <Link href={repo.html_url} openNewTab>
          <Strong>{repo.name}</Strong>
        </Link>
        {repo.language && <> <Lozenge appearance="new">{repo.language}</Lozenge></>}{repo.description && ` - ${repo.description}`}
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
            
            // Debug logging
            console.log(`PR #${pr.number}: mergeable=${pr.mergeable}, state=${pr.mergeable_state}, merged=${pr.merged}`);
            
            const jiraKey = extractJiraKey(pr);
            const jiraIssue = jiraKey ? jiraIssues.get(jiraKey) : null;
            const isLastMerged = lastMergedPR === pr.number;
            
            return (
            <Inline key={pr.id} space="space.100" alignBlock="center" shouldWrap>
              <Button
                spacing="compact"
                appearance={isMerged ? "primary" : isMergeable ? "primary" : isCalculating ? "default" : "warning"}
                onClick={() => handleMergePR(pr)}
                isDisabled={isLoading || !isMergeable || isMerged}
              >
                {isLoading ? 'Merging...' : isMerged ? 'Merged' : isMergeable ? 'Merge' : isCalculating ? 'Calculating...' : 'Conflicts'}
              </Button>
              <Link href={pr.html_url} openNewTab>
                {pr.title}
              </Link>
              <Link href={`${repo.html_url}/tree/${pr.head?.ref || 'main'}`} openNewTab>
                <Code>{pr.head?.ref || 'unknown'}</Code>
              </Link>
              <Text size="small">→</Text>
              <Link href={`${repo.html_url}/tree/${pr.base?.ref || 'main'}`} openNewTab>
                <Code>{pr.base?.ref || 'unknown'}</Code>
              </Link>
              {jiraKey && (
                <>
                  {jiraIssue && (
                    <>
                      <Lozenge appearance="default">
                        {jiraIssue.fields?.issuetype?.name || 'Unknown'}
                      </Lozenge>
                      <Text size="small">
                        <Strong>{jiraKey}</Strong>
                      </Text>
                      <Text size="small">
                        {jiraIssue.fields?.summary || 'No description'}
                      </Text>
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
                    </>
                  )}
                  {!jiraIssue && (
                    <>
                      <Text size="small">
                        <Strong>{jiraKey}</Strong>
                      </Text>
                      <Text size="small">Loading description...</Text>
                      <Lozenge appearance="default">Loading...</Lozenge>
                    </>
                  )}
                </>
              )}
            </Inline>
            );
          })}
          </Stack>
        </Box>
      </Box>
      
    </Box>
  );
};

export const GithubRepos: React.FC<GithubReposProps> = ({ githubRepos, onReposUpdate }) => {
  const [lastMergeTime, setLastMergeTime] = useState<number | null>(null);
  const [needsJiraRefresh, setNeedsJiraRefresh] = useState<boolean>(false);

  useEffect(() => {
    if (!githubRepos || !onReposUpdate) return;

    // Check if any PRs are in calculating state
    const hasCalculatingPRs = Array.isArray(githubRepos) && githubRepos.some((repo: any) =>
      repo.pullRequests && repo.pullRequests.some((pr: any) => pr.mergeable === null)
    );

    // Check if we should poll due to recent merge activity (within last 30 seconds)
    const hasRecentMerge = lastMergeTime && (Date.now() - lastMergeTime < 30000);

    if (!hasCalculatingPRs && !hasRecentMerge && !needsJiraRefresh) return;

    // Set up polling for calculating PRs
    const interval = setInterval(async () => {
      try {
        console.log('Polling for updated PR and Jira status...');
        const response = await getGithubRepos();
        if (response.success) {
          onReposUpdate(response.data);
          // Reset Jira refresh flag after successful update
          setNeedsJiraRefresh(false);
        }
      } catch (error) {
        console.error('Error polling PR status:', error);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [githubRepos, onReposUpdate, lastMergeTime, needsJiraRefresh]);

  const handleMergeComplete = () => {
    setLastMergeTime(Date.now());
  };

  const handleJiraRefreshNeeded = () => {
    setNeedsJiraRefresh(true);
  };

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
            onMergeComplete={handleMergeComplete}
            onJiraRefreshNeeded={handleJiraRefreshNeeded}
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