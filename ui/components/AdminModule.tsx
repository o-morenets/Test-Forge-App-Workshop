import {Box, ErrorMessage, Inline, Label, LoadingButton, RequiredAsterisk, Text, Textfield} from '@forge/react';
import {useState} from "react";
import {getMyGithubRepos, getMyJiraIssues, loadUserData, saveUserData} from "../services";
import {GithubRepos} from "./GithubRepos";
import {JiraIssues} from "./JiraIssues";

export const AdminModule = () => {
  const [usernameValue, setUsernameValue] = useState<string>();
  const [accessTokenValue, setAccessTokenValue] = useState<string>();
  const [usernameValidationError, setUsernameValidationError] = useState<string | null>(null);
  const [accessTokenValidationError, setAccessTokenValidationError] = useState<string | null>(null);
  const [isSavingUserDataLoading, setSavingUserDataLoading] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [loadedUsername, setLoadedUsername] = useState<string | null>(null);
  const [loadedAccessToken, setLoadedAccessToken] = useState<string | null>(null);
  const [isGithubReposLoading, setIsGithubReposLoading] = useState(false);
  const [githubRepos, setGithubRepos] = useState<any>(null);
  const [isJiraLoading, setIsJiraLoading] = useState(false);
  const [jiraIssues, setJiraIssues] = useState<any>(null);

  const handleChangeUsernameValue = (event: any) => {
    const value = event.target.value;
    setUsernameValue(value);
  };

  const handleChangeAccessTokenValue = (event: any) => {
    const value = event.target.value;
    setAccessTokenValue(value);
  };

  const handleSaveUserData = async () => {
    setSavingUserDataLoading(true);

    // Reset validation errors
    setUsernameValidationError(null);
    setAccessTokenValidationError(null);

    let hasErrors = false;

    // Validate username
    if (!usernameValue || usernameValue.trim() === '') {
      setUsernameValidationError("This field is required");
      hasErrors = true;
    }

    // Validate access token
    if (!accessTokenValue || accessTokenValue.trim() === '') {
      setAccessTokenValidationError("This field is required");
      hasErrors = true;
    }

    // If validation fails, stop here
    if (hasErrors) {
      setSavingUserDataLoading(false);
      return;
    }

    try {
      // Save both values
      await saveUserData("username-field", usernameValue!);
      await saveUserData("access-token-field", accessTokenValue!);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingUserDataLoading(false);
    }
  };

  const handleLoadUserData = async () => {
    setIsLoadingUserData(true);
    try {
      const usernameResult = await loadUserData("username-field");
      const tokenResult = await loadUserData("access-token-field");

      if (usernameResult && (usernameResult as any).success) {
        setLoadedUsername((usernameResult as any).data || "Not found");
      } else {
        setLoadedUsername("Not found");
      }

      if (tokenResult && (tokenResult as any).success) {
        setLoadedAccessToken((tokenResult as any).data || "Not found");
      } else {
        setLoadedAccessToken("Not found");
      }
    } catch (e) {
      console.error(e);
      setLoadedUsername("Error loading");
      setLoadedAccessToken("Error loading");
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const handleGetGithubRepos = async () => {
    setIsGithubReposLoading(true);
    setGithubRepos(null);
    try {
      const response = await getMyGithubRepos();

      setGithubRepos(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGithubReposLoading(false);
    }
  };

  const handleGetJiraIssues = async () => {
    setIsJiraLoading(true);
    setJiraIssues(null);
    try {
      const response = await getMyJiraIssues();

      setJiraIssues(response);
    } catch (e) {
      console.error(e);
    } finally {
      setIsJiraLoading(false);
    }
  };

  return (
    <>
      <Box paddingBlockStart='space.500'>
        <Inline space="space.200" alignBlock="start">
          <Box>
            <Label labelFor="storage-github-username">Username <RequiredAsterisk/></Label>
            <Textfield
              name="storage-github-username"
              onChange={handleChangeUsernameValue}
              value={usernameValue}
            />
            {usernameValidationError && <ErrorMessage>{usernameValidationError}</ErrorMessage>}
          </Box>

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
              onClick={handleSaveUserData}
              isLoading={isSavingUserDataLoading}
            >
              Save
            </LoadingButton>
          </Box>

          <Box paddingBlockStart="space.300">
            <LoadingButton
              onClick={handleLoadUserData}
              isLoading={isLoadingUserData}
              appearance="subtle"
            >
              Load User Data
            </LoadingButton>
          </Box>

          {(loadedUsername || loadedAccessToken) && (
            <Box paddingBlockStart="space.300">
              <Text as="strong">Loaded Data:</Text>
              {loadedUsername && <Text>Username: {loadedUsername}</Text>}
              {loadedAccessToken && (
                <Text>
                  Access Token: {loadedAccessToken.length > 10
                  ? `${loadedAccessToken.slice(0, 5)}*****${loadedAccessToken.slice(-5)}`
                  : loadedAccessToken
                }
                </Text>
              )}
            </Box>
          )}
        </Inline>
      </Box>

      <Inline>
        <Box backgroundColor='color.background.discovery'>
          <LoadingButton
            isLoading={isGithubReposLoading}
            onClick={() => handleGetGithubRepos()}
          >
            My Github Repositories
          </LoadingButton>
          <Box paddingBlockStart='space.500'>
            <GithubRepos githubRepos={githubRepos}/>
          </Box>
        </Box>

        <Box backgroundColor='color.background.success'>
          <LoadingButton
            isLoading={isJiraLoading}
            onClick={() => handleGetJiraIssues()}
          >
            My Jira Issues
          </LoadingButton>
          <Box paddingBlockStart='space.500'>
            <JiraIssues jiraIssues={jiraIssues}/>
          </Box>
        </Box>
      </Inline>
    </>
  )
}