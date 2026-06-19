# API storage configuration (dev)

This document explains how to configure storage for the page creator API in local development and production.

## What the API needs

The page creator backend uses Azure storage for two purposes:

- Blob storage for page assets and published output
- Azure Table storage for post metadata used by the editor/publishing flow

The API code prefers explicit page storage settings, but can also fallback to `AzureWebJobsStorage`.

## Local development

Copy `api/local.settings.sample.json` to `api/local.settings.json` and update as needed.

Example values:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "PAGE_CREATOR_ALLOW_LOCAL_DEV": "true",
    "PAGE_CREATOR_STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true",
    "PAGE_CREATOR_STORAGE_CONTAINER": "$web",
    "PAGE_CREATOR_AUTH_CLIENT_ID": "1f74e557-4d39-477a-953a-bf905cfb9b4"
  }
}
```

If you are using Azurite, `UseDevelopmentStorage=true` is fine for local blob and table operations. If you are using a real storage account locally, set `PAGE_CREATOR_STORAGE_CONNECTION_STRING` to the account connection string.

### Local auth bypass

For local testing only, set:

```json
"PAGE_CREATOR_ALLOW_LOCAL_DEV": "true"
```

That bypasses auth checks in the API while you develop.

## Production configuration

In production, prefer managed identity over a storage connection string.

### Managed identity recommended

1. Configure your Function App to use a managed identity.
2. Grant the Function App identity the role **Storage Blob Data Contributor** on the storage account.
3. Set app settings:

```powershell
az functionapp config appsettings set \
  --name storage-swa \
  --resource-group rg-sharepointportal \
  --settings \
    FUNCTIONS_WORKER_RUNTIME=node \
    PAGE_CREATOR_STORAGE_ACCOUNT_URL=https://rgsharepointportal91c7.blob.core.windows.net \
    PAGE_CREATOR_STORAGE_CONTAINER='$web' \
    PAGE_CREATOR_AUTH_CLIENT_ID=1f74e557-4d39-477a-953a-abf905cfb9b4 \
    PAGE_CREATOR_ALLOW_ALL_AUTHENTICATED=false \
    PAGE_CREATOR_ALLOW_LOCAL_DEV=false
```

These values are taken from the repository defaults:

- `storage-swa` — function app name used by `scripts/deploy-api-clean.ps1`
- `rg-sharepointportal` — resource group used by the repo deploy scripts
- `rgsharepointportal91c7` — storage account default in `docs/dev/azure-table-provisioning.sh`
- `1f74e557-4d39-477a-953a-abf905cfb9b4` — client ID used by the repo SPA auth config

If you use a user-assigned managed identity, also set:

```powershell
PAGE_CREATOR_STORAGE_CLIENT_ID=<user-assigned-client-id>
```

### Connection string fallback

If you cannot use managed identity, configure the storage connection string explicitly:

```powershell
az functionapp config appsettings set \
  --name <functionAppName> \
  --resource-group <resourceGroup> \
  --settings PAGE_CREATOR_STORAGE_CONNECTION_STRING="<connection-string>"
```

### `AzureWebJobsStorage` fallback

The API code now also supports using `AzureWebJobsStorage` as a fallback connection string if explicit storage settings are not configured. That means a Function App with `AzureWebJobsStorage` set correctly can still authenticate to blob/table storage if the same account is used, but explicit `PAGE_CREATOR_*` settings are still preferred.

## Supported environment variables

### Blob storage

- `PAGE_CREATOR_STORAGE_CONNECTION_STRING` — preferred explicit blob connection string
- `AZURE_STORAGE_CONNECTION_STRING` — fallback connection string source
- `AzureWebJobsStorage` — runtime storage connection string fallback
- `PAGE_CREATOR_STORAGE_ACCOUNT_URL` — blob account URL for managed identity access
- `PAGE_CREATOR_STORAGE_ACCOUNT_NAME` — alternate account name used to derive blob URL
- `STORAGE_ACCOUNT_URL` / `STORAGE_ACCOUNT_NAME` — alternate legacy account URL/name fallback
- `PAGE_CREATOR_STORAGE_CLIENT_ID` — user-assigned managed identity client ID
- `AzureWebJobsStorage__clientId` — fallback client ID when using a user-assigned managed identity with Function App built-in settings
- `AZURE_CLIENT_ID` — fallback managed identity client ID source
- `PAGE_CREATOR_STORAGE_CONTAINER` — container name, usually `$web`
- `STORAGE_CONTAINER_NAME` — alternate container name fallback

### Table storage

- `PAGE_CREATOR_STORAGE_CONNECTION_STRING` — preferred table connection string
- `AZURE_STORAGE_CONNECTION_STRING` — fallback table connection string source
- `AzureWebJobsStorage` — runtime storage connection string fallback
- `PAGE_CREATOR_STORAGE_ACCOUNT_URL` / `STORAGE_ACCOUNT_URL` — account URL used with Azure AD auth for tables
- `PAGE_CREATOR_STORAGE_ACCOUNT_NAME` / `STORAGE_ACCOUNT_NAME` — account name fallback for table endpoint derivation

### Auth / app settings

- `PAGE_CREATOR_AUTH_CLIENT_ID` — expected Entra app client ID for bearer token validation
- `PAGE_CREATOR_ALLOWED_OBJECT_IDS` — allowlist of user object IDs
- `PAGE_CREATOR_ALLOWED_GROUP_IDS` — allowlist of group IDs
- `PAGE_CREATOR_ALLOW_ALL_AUTHENTICATED` — set to `true` to allow any authenticated user
- `PAGE_CREATOR_ALLOW_LOCAL_DEV` — set to `true` to bypass auth locally

## Verify your configuration

Use the API debug endpoint to confirm authentication and storage access.

- `https://<your-site>/api/list-pages?debug=2` — validates bearer token processing
- `https://<your-site>/api/list-pages?debug=3` — inspects request headers and token payloads

If the API still returns a storage error, verify the Function App identity has the proper role assignment and the storage app settings point to the correct account.

## Recommended production setup

- Use managed identity wherever possible.
- Do not store account keys or long-lived SAS tokens in app settings unless necessary.
- Set `PAGE_CREATOR_STORAGE_ACCOUNT_URL` and `PAGE_CREATOR_STORAGE_CONTAINER` explicitly.
- Grant the function app **Storage Blob Data Contributor** on the storage account.
- Use `PAGE_CREATOR_ALLOW_LOCAL_DEV=false` in production.
