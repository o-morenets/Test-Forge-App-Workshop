import {Box, ErrorMessage, Inline, Label, LoadingButton, RequiredAsterisk, Text, Textfield} from '@forge/react';
import {useState} from "react";
import {getGithubRepos, loadAccessToken, saveAccessToken} from "../services";
import {GithubRepos} from "./GithubRepos";

export const AdminModule = () => {
  const [accessTokenValue, setAccessTokenValue] = useState<string>('');
  const [accessTokenValidationError, setAccessTokenValidationError] = useState<string | null>(null);
  const [isSavingAccessTokenLoading, setSavingAccessTokenLoading] = useState(false);
  const [isLoadingAccessToken, setIsLoadingAccessToken] = useState(false);
  const [loadedAccessToken, setLoadedAccessToken] = useState<string | null>(null);
  const [isGithubReposLoading, setIsGithubReposLoading] = useState(false);
  const [githubRepos, setGithubRepos] = useState<any>(null);

  const handleChangeAccessTokenValue = (event: any) => {
    const value = event.target.value;
    setAccessTokenValue(value);
  }

  const handleSaveAccessToken = async () => {
    setSavingAccessTokenLoading(true);
    setAccessTokenValidationError(null);

    if (!accessTokenValue || accessTokenValue.trim() === '') {
      setAccessTokenValidationError("This field is required");
      setSavingAccessTokenLoading(false);
      return;
    }

    try {
      await saveAccessToken("access-token-field", accessTokenValue!);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAccessTokenLoading(false);
    }
  }

  const handleLoadAccessToken = async () => {
    setIsLoadingAccessToken(true);

    try {
      const tokenResult = await loadAccessToken("access-token-field");

      if (tokenResult && (tokenResult as any).success) {
        setLoadedAccessToken((tokenResult as any).data || "Not found");
      } else {
        setLoadedAccessToken("Not found");
      }
    } catch (e) {
      console.error(e);
      setLoadedAccessToken("Error loading");
    } finally {
      setIsLoadingAccessToken(false);
    }
  }

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
    <>
      <Box paddingBlockStart='space.500'>
        <Inline space="space.200" alignBlock="center">
          <Box>
            <Label labelFor="storage-github-access-token">Access Token <RequiredAsterisk/></Label>
            <Textfield
              name="storage-github-access-token"
              type="password"
              onChange={handleChangeAccessTokenValue}
              value={accessTokenValue}
            />
            {accessTokenValidationError && <ErrorMessage>{accessTokenValidationError}</ErrorMessage>}
          </Box>

          <Box paddingBlockStart="space.300">
            <LoadingButton
              onClick={handleSaveAccessToken}
              isLoading={isSavingAccessTokenLoading}
            >
              Save Access Token
            </LoadingButton>
          </Box>

          <Box paddingBlockStart="space.300">
            <LoadingButton
              onClick={handleLoadAccessToken}
              isLoading={isLoadingAccessToken}
            >
              Load Access Token
            </LoadingButton>
          </Box>

          <Box paddingBlockStart="space.300">
            {loadedAccessToken && (
              <Text>
                Access Token: {loadedAccessToken.length > 10
                ? `${loadedAccessToken.slice(0, 5)}*****${loadedAccessToken.slice(-5)}`
                : loadedAccessToken
              }
              </Text>
            )}
          </Box>
        </Inline>
      </Box>

      <Box paddingBlockStart={'space.300'} paddingBlockEnd={'space.300'}>
        <LoadingButton appearance="primary"
          isLoading={isGithubReposLoading}
          onClick={() => handleGetGithubRepos()}
        >
          Github Repositories
        </LoadingButton>
        <Box paddingBlockStart='space.500'>
          <GithubRepos githubRepos={githubRepos}/>
        </Box>
      </Box>
    </>
  )
}