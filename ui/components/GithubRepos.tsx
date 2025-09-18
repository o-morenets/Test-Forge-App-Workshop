import {Text, Box, Lozenge, Strong, Link, Stack, Button, Inline} from '@forge/react';
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

  const handleMergePR = async (pr: any) => {
    setMergingPRs(prev => new Set(prev.add(pr.number)));
    
    try {
      const response = await mergePullRequest(repo.owner.login, repo.name, pr.number);
      if (response.success) {
        console.log('PR merged successfully:', pr.number);
        // You might want to refresh the data here
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

  return (
    <Box paddingBlockStart="space.100">
      <Text>
        <Link href={repo.html_url} openNewTab>
          <Strong>{repo.name}</Strong>
        </Link>
        {repo.language && <> <Lozenge appearance="new" isBold>{repo.language}</Lozenge></>}{repo.description && ` - ${repo.description}`}
      </Text>
      
      {repo.pullRequests && repo.pullRequests.length > 0 && (
        <Box paddingInlineStart="space.200" paddingBlockStart="space.050">
          <Text size="small">Pull Requests:</Text>
          <Stack space="space.050">
            {repo.pullRequests.map((pr: any) => (
              <Inline key={pr.id} space="space.100" alignBlock="center">
                <Link href={pr.html_url} openNewTab>
                  <Lozenge appearance="inprogress">{pr.title}</Lozenge>
                </Link>
                {!pr.isMerged && (
                  <Button 
                    appearance="primary"
                    onClick={() => handleMergePR(pr)}
                    isDisabled={mergingPRs.has(pr.number)}
                  >
                    {mergingPRs.has(pr.number) ? 'Merging...' : 'Merge'}
                  </Button>
                )}
              </Inline>
            ))}
          </Stack>
        </Box>
      )}
      
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