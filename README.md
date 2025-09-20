App Practice

Initial setup:

1) Create your site on Jira

2) Create template app with Forge CLI for Jira with Jira admin page module (https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-admin-page/ );

App description:

Create an app with two screens:

1) The first one is an auth with a field for saving your Github API token to storage

2) The second one is connected screen with main functionality.

On the Connected screen gets your repositories from GitHub (renders a list of the repositories) and gets full information about your repository (name, language, etc.), and an opened pull request that is related to the task from the Jira board. If you don’t have any open pull requests related to the task, renders empty state for it (Have no opened pull requests). If you have an opened pull requests, show it in the card with repository information, with a link to the GitHub site with PR. Also, add an option to approve and merge this PR and show it in the card with repository information. If PR is merged, change the status of the Jira ticket to Done (use webhooks to check if is PR merged, and in the webtrigger handler, change the Jira ticket status).

Parse PR name or branch name to get a key that relates to the task name. For example task has a key KAN-1 and a PR name KAN-1: first-commit.

To get a task (issue) information, use the endpoint: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-get

To call Jira use requestJira method: https://developer.atlassian.com/platform/forge/apis-reference/ui-api-bridge/requestJira/

List of Github repositories: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28

Github API to get Pull Request: https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests Merge PR: https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#merge-a-pull-request

For UI, you have two options: UI kit or Custom UI. For a pet project, I suggest to use UI Kit for easier creation of markup without additional usage Atlaskit. For backend part of work I suggest to create a services folder and use services in your resolvers to send the data from the backend to UI. Add a screenshot for the project structure.


If you have a time, write a tests for the services and main UI part logic.

Demo: [FORGE - JiraProject - Kanban Board - Jira - 20 September 2025.mp4](FORGE%20-%20JiraProject%20-%20Kanban%20Board%20-%20Jira%20-%2020%20September%202025.mp4)