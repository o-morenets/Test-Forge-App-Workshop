import {useState} from "react";
import {Box, LoadingButton} from "@forge/react";
import {Repos} from "./Repos";
import {getGithubRepos} from "../../services";

export const ReposPage = () => {
  const [isGithubReposLoading, setIsGithubReposLoading] = useState(false);
  const [githubRepos, setGithubRepos] = useState<any>(null);

  const handleGetGithubRepos = async () => {
    setIsGithubReposLoading(true);
    setGithubRepos(null);

    try {
      const response = await getGithubRepos();
      setGithubRepos(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGithubReposLoading(false);
    }
  }

  return (
    <Box paddingBlockStart={'space.300'} paddingBlockEnd={'space.300'}>
      <LoadingButton
        appearance="primary"
        isLoading={isGithubReposLoading}
        onClick={() => handleGetGithubRepos()}
      >
        Github Repositories
      </LoadingButton>
      <Box paddingBlockStart='space.500'>
        <Repos githubRepos={githubRepos} onReposUpdate={setGithubRepos}/>
      </Box>
    </Box>
  );
}