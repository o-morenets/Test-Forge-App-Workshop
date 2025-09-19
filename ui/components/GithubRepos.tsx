import {Text, Box, Lozenge, Strong, Link, Stack, Button, Inline, Code} from '@forge/react';
import { useState } from 'react';
import { mergePullRequest } from '../services';

interface GithubReposProps {
  githubRepos?: any;
}

interface RepoItemProps {
  repo: any;
}

const RepoItem: React.FC<RepoItemProps> = ({ repo }) => {
  const [mergingPRs, setMergingPRs] = useState<Set<number>>(new Set());
  const [hiddenPRs, setHiddenPRs] = useState<Set<number>>(new Set());

  const handleMergePR = async (pr: any) => {
    setMergingPRs(prev => new Set(prev.add(pr.number)));
    
    try {
      const response = await mergePullRequest(repo.owner.login, repo.name, pr.number);
      if (response.success) {
        console.log('PR merged successfully:', pr.number);

        // Hide the PR immediately after successful merge
        setHiddenPRs(prev => new Set(prev.add(pr.number)));
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

  // Filter out hidden PRs and already merged PRs
  const visiblePRs = repo.pullRequests ? repo.pullRequests.filter((pr: any) => 
    !hiddenPRs.has(pr.number) && !pr.isMerged
  ) : [];

  // Hide entire repo if no visible PRs remain
  if (!visiblePRs || visiblePRs.length === 0) {
    return null;
  }

  return (
    <Box paddingBlockStart="space.100">
      <Text>
        <Link href={repo.html_url} openNewTab>
          <Strong>{repo.name}</Strong>
        </Link>
        {repo.language && <> <Lozenge appearance="new" isBold>{repo.language}</Lozenge></>}{repo.description && ` - ${repo.description}`}
      </Text>
      
      <Box paddingInlineStart="space.200" paddingBlockStart="space.050">
        <Text size="small">Pull Requests:</Text>
        <Stack space="space.050">
          {visiblePRs.map((pr: any) => {
            const isMergeable = pr.mergeable !== false && pr.mergeable_state !== 'dirty';
            const isLoading = mergingPRs.has(pr.number);
            
            return (
            <Inline key={pr.id} space="space.100" alignBlock="center" shouldWrap>
              <Button
                spacing="compact"
                appearance={isMergeable ? "primary" : "warning"}
                onClick={() => handleMergePR(pr)}
                isDisabled={isLoading || !isMergeable}
              >
                {isLoading ? 'Merging...' : isMergeable ? 'Merge' : 'Conflicts'}
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
              </Inline>
            );
          })}
          </Stack>
      </Box>
      
    </Box>
  );
};

export const GithubRepos: React.FC<GithubReposProps> = ({ githubRepos }) => {
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
          <RepoItem key={repo.id || index} repo={repo} />
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