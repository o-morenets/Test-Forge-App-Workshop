import ForgeReconciler, {Box, Stack, Text} from "@forge/react";
import React from "react";

const GetStartedPage = () => {
  return (
    <Box paddingBlockStart="space.500">
      <Stack space="space.300">
        <Text as="strong">Get Started page</Text>
      </Stack>
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <GetStartedPage/>
  </React.StrictMode>
);