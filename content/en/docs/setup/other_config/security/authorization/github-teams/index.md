---
title: "GitHub Teams"
linkTitle: "GitHub Teams"
description: Spinnaker supports using GitHub teams for authorization. Roles from GitHub are mapped to the Teams under a specific GitHub organization.
---



## GitHub App Authentication (Recommended)

GitHub App authentication is the preferred method for connecting Spinnaker to GitHub. It offers significant advantages over Personal Access Tokens (PATs):

*   **Higher Rate Limits**: GitHub Apps have a rate limit of [15,000](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#primary-rate-limit-for-authenticated-users) requests per hour (vs [5,000](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#primary-rate-limit-for-authenticated-users) for PATs).
*   **Enhanced Security**: Uses short-lived tokens that are automatically refreshed, rather than long-lived static tokens.
*   **Granular Permissions**: Apps can be scoped to specific permissions.

### Prerequisites

*   You have GitHub organization admin permissions to create and install the app.
*   If you use GitHub Enterprise, ensure the Halyard host trusts the enterprise TLS chain.

### 1. Create a GitHub App

1.  Navigate to your GitHub Organization Settings > Developer settings > GitHub Apps.
2.  Click **New GitHub App**.
3.  Set the following fields:
    *   **GitHub App Name**: e.g., `spinnaker-fiat-auth`.
    *   **Homepage URL**: Your Spinnaker URL (or placeholder).
    *   **Callback URL**: Your Spinnaker URL (or placeholder).
    *   **Webhook**: Uncheck "Active" (not needed for authorization).
4.  **Permissions**:
    *   **Organization Permissions > Members**: Read-only
5.  Click **Create GitHub App**.
6.  Note the **App ID**.
7.  Generate a **Private key** and save the `.pem` file to your Halyard machine (e.g., `/home/spinnaker/.github/spinnaker-fiat.pem`).
8.  **Install App**: Go to "Install App" in the sidebar and install it on your organization. Note the **Installation ID** from the URL (e.g., `https://github.com/organizations/my-org/settings/installations/12345678` -> `12345678`).
    *   Install at the organization level (not per-repo) so team membership lookups work for all repos.
    *   Restrict the private key file to the Halyard user (for example, `chmod 600 /home/spinnaker/.github/spinnaker-fiat.pem`) to avoid permissive-permission failures and protect the key.

### 2. Configure with Halyard

Run the following commands to configure Fiat to use the GitHub App:

```bash
# Set your values
APP_ID=12345
INSTALL_ID=67890
PRIVATE_KEY_PATH=/home/spinnaker/.github/spinnaker-fiat.pem
ORG=my-org

hal config security authz github edit \
    --organization $ORG \
    --baseUrl https://api.github.com \  # For GitHub Enterprise, use https://<your-ghe>/api/v3
    --auth-method AUTO \
    --app-id $APP_ID \
    --installation-id $INSTALL_ID \
    --private-key-path $PRIVATE_KEY_PATH

hal config security authz edit --type github
hal config security authz enable
```

The `--auth-method` flag controls which authentication method Spinnaker uses:
*   `AUTO` (Default): Automatically prefers GitHub App if `app-id`, `installation-id`, and `private-key-path` are configured. Falls back to PAT if App credentials are missing.
*   `GITHUB_APP`: Forces GitHub App authentication. The configuration fails if App credentials are not provided or invalid.
*   `PAT`: Forces Personal Access Token authentication. The configuration fails if `access-token` is not provided.

Token handling:

*   GitHub App installation tokens are short-lived (1 hour) and Fiat caches them in memory with an early refresh buffer. They are never written to disk.
*   The GitHub App private key stays on the Halyard host at the path you provide; keep it tightly permissioned.
*   PATs configured with `--accessToken` are stored in Halyard/Fiat configuration; rotate them periodically and handle them like any other long-lived secret.

## Personal Access Token (Legacy)

If you cannot use a GitHub App, you can still use a Personal Access Token (PAT). Note that this has lower rate limits.

1. Under an administrator's account, generate a new Personal Access Token from
[https://github.com/settings/tokens](https://github.com/settings/tokens).
1. Give it a descriptive name such as "spinnaker-fiat."
1. Select the `read:org` scope.
1. Click "Generate Token"

    ![GitHub personal access token](personal-access-token.png)

## Configure with Halyard

With the personal access token in hand, use Halyard to configure Fiat:

```bash
TOKEN=b22a54...  # Personal access token under admin account
ORG=myorg        # GitHub Organization

hal config security authz github edit \
    --accessToken $TOKEN \
    --organization $ORG \
    --baseUrl https://api.github.com

hal config security authz edit --type github

hal config security authz enable
```
