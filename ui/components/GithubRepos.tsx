import {Text, Box, Lozenge, Strong} from '@forge/react';

interface GithubReposProps {
  githubRepos?: any;
}

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
          <Box key={repo.id || index} paddingBlockStart="space.100">
              <Text>
                <Strong>{repo.name}</Strong> {repo.language && <Lozenge appearance="new" isBold>{repo.language}</Lozenge>} - {repo.description || <Lozenge>No description</Lozenge>}
              </Text>
          </Box>
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