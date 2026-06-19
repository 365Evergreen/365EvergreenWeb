# Azure Table provisioning (dev)

This folder contains helper scripts and documentation for development operations related to storage, table provisioning, and editor/publishing configuration.

Files

- `azure-table-provisioning.sh` — Bash script to create the `BlogPosts` table, insert a sample entity, optionally assign RBAC to a principal, and optionally generate an account SAS for Table service.
- `azure-table-provisioning.ps1` — PowerShell wrapper providing the same operations for Windows/Pwsh users, with optional RBAC assignment, sample metadata seeding, SAS generation, and table-name overrides.
- `storage-api-configuration.md` — configuration guidance for the page creator API storage and identity settings.

Usage (Bash)

Make executable and run (defaults to the project's storage account and resource group):

```bash
chmod +x docs/dev/azure-table-provisioning.sh
./docs/dev/azure-table-provisioning.sh [storageAccountName] [resourceGroup] [principalId] [sas]
```

- `storageAccountName` (optional) — defaults to `rgsharepointportal91c7`
- `resourceGroup` (optional) — defaults to `rg-sharepointportal`
- `principalId` (optional) — if provided, script assigns `Storage Table Data Contributor` to this principal on the storage account
- `sas` (optional literal) — if provided as fourth arg, script will generate an account SAS for the Table service (30 days)

Usage (PowerShell)

```powershell
# Defaults to rgsharepointportal91c7 / rg-sharepointportal / BlogPosts / login auth
.
\docs\dev\azure-table-provisioning.ps1 -AccountName <acct> -ResourceGroup <rg> -TableName BlogPosts -AuthMode login -AssignPrincipalId <principalId> -InsertSampleEntity -CreateSas -SasDays 30
```

- `TableName` (optional) — defaults to `BlogPosts`
- `SubscriptionId` (optional) — sets the active Azure subscription before provisioning
- `AuthMode` (optional) — defaults to `login`; use `key` only for flows that require shared-key auth, such as account SAS generation
- `InsertSampleEntity` (optional switch) — seeds a sample metadata row matching the canonical `BlogPosts` fields in `docs\architecture\metadata.md`
- `AssignPrincipalId` (optional) — assigns `Storage Table Data Contributor` on the storage account if not already present
- `CreateSas` / `SasDays` (optional) — generates an account SAS for the Table service

IAM recommendations

- Prefer managed identities for server-to-Azure access rather than account keys or long-lived SAS tokens.
- For publisher/CI service principals, grant the **Storage Table Data Contributor** role scoped to the storage account:

```bash
az role assignment create --assignee <principalId> --role "Storage Table Data Contributor" --scope /subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<acct>
```

- For blob reads by the public site, mark the `media` container as public (if appropriate) or use CDN + SAS/managed identity for secure access. Example to set blob container public:

```bash
az storage container set-permission --name media --public-access blob --account-name <acct> --account-key <key>
```

Notes

- The scripts use the Azure CLI `storage-preview` extension for table commands; the script attempts to install it if missing.
- If your environment disallows account keys, prefer Azure AD role assignment + SDKs/managed identity flows.

Security

- If you generate a SAS token, treat it as a secret and rotate/expire it frequently. Use narrow permissions and short expiry where possible.