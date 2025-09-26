import {Box, Text} from '@forge/react';
import React from 'react';
import {RepoItem} from './RepoItem';


interface GithubReposProps {
  githubRepos?: any;
  onReposUpdate?: (repos: any) => void;
}


export const Repos: React.FC<GithubReposProps> = ({githubRepos, onReposUpdate}) => {
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