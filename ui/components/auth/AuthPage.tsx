import {useState} from "react";
import {Box, Inline, Label, LoadingButton, RequiredAsterisk, Text, Textfield} from "@forge/react";
import {loadAccessToken, saveAccessToken} from "../../services";

export const AuthPage = () => {
  const [accessTokenValue, setAccessTokenValue] = useState<string>('');
  const [accessTokenValidationError, setAccessTokenValidationError] = useState<string | null>(null);
  const [isSavingAccessTokenLoading, setSavingAccessTokenLoading] = useState(false);
  const [isAccessTokenLoading, setIsAccessTokenLoading] = useState(false);
  const [loadedAccessToken, setLoadedAccessToken] = useState<string | null>(null);

  const handleChangeAccessTokenValue = (event: any) => {
    const value = event.target.value;
    setAccessTokenValue(value);

    // Clear validation error when user starts typing
    if (accessTokenValidationError) {
      setAccessTokenValidationError(null);
    }
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

      // Clear the input field and loaded token after successful save
      setAccessTokenValue("");
      setLoadedAccessToken("");
      setAccessTokenValidationError(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAccessTokenLoading(false);
    }
  }

  const handleLoadAccessToken = async () => {
    setAccessTokenValidationError(null);
    setAccessTokenValue('')
    setIsAccessTokenLoading(true);

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
      setIsAccessTokenLoading(false);
    }
  }

  return (
    <Box paddingBlockStart='space.500'>
      <Inline space="space.200" alignBlock="center">
        <Box>
          <Label labelFor="storage-github-access-token">Access Token <RequiredAsterisk/></Label>
          <Textfield
            name="storage-github-access-token"
            type="password"
            onChange={handleChangeAccessTokenValue}
            value={accessTokenValue}
            isInvalid={accessTokenValidationError !== null}
          />
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
            isLoading={isAccessTokenLoading}
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
  );
}