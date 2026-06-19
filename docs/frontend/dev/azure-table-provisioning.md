# Compacted conversation

Starting: *Draft provisioning options + commands* (1/5)

**Plan:** I'll give CLI and PowerShell options, example commands/scripts, verification steps, and recommendations. Refer to the storage schema at azure-storage-config.md.

- **Option Summary:**  
  - **Azure CLI:** Fast, scriptable; use `az storage` commands and the `storage` extension when needed. Good for CI/CD.  
  - **PowerShell (Az + AzTable):** Good for Windows/PowerShell workflows; `Az` for account/container, `AzTable` module for table operations.  
  - **Infra-as-Code (ARM/Bicep/Terraform):** Recommended for repeatable production provisioning.

**1) Azure CLI — quick script**

- **Prereqs:** Logged in (`az login`) and subscription selected (`az account set --subscription <id>`). Install table extension if `az storage table` is unavailable:
```bash
az extension add --name storage-preview
```
- **Create resource group and storage account**
```bash
az group create --name my-rg --location eastus
az storage account create \
  --name mystorageacct$RANDOM \
  --resource-group my-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2
```
- **Get keys / connection string**
```bash
export AZURE_STORAGE_ACCOUNT=$(az storage account show -n mystorageacct --query name -o tsv)
export AZURE_STORAGE_KEY=$(az storage account keys list -n $AZURE_STORAGE_ACCOUNT -g my-rg --query '[0].value' -o tsv)
export AZURE_STORAGE_CONNECTION_STRING=$(az storage account show-connection-string -n $AZURE_STORAGE_ACCOUNT -g my-rg -o tsv)
```
- **Create blob containers (posts, media)**
```bash
az storage container create --name posts --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_KEY
az storage container create --name media --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_KEY
```
- **Create Table for metadata**
```bash
az storage table create --name BlogPosts --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_KEY
```
- **Verify**
```bash
az storage table list --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_KEY -o table
az storage container list --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_KEY -o table
```

**2) PowerShell — Az + AzTable**
- **Prereqs:** Install modules and authenticate:
```powershell
Install-Module -Name Az -Scope CurrentUser -Force
Install-Module -Name AzTable -Scope CurrentUser -Force
Connect-AzAccount
Select-AzSubscription -SubscriptionId <id>
```
- **Create resource group and storage account**
```powershell
New-AzResourceGroup -Name my-rg -Location eastus
$sa = New-AzStorageAccount -ResourceGroupName my-rg -Name mystorageacct -SkuName Standard_LRS -Kind StorageV2 -Location eastus
$ctx = $sa.Context
```
- **Create blob containers**
```powershell
New-AzStorageContainer -Name posts -Context $ctx
New-AzStorageContainer -Name media -Context $ctx
```
- **Create Table (AzTable)**
```powershell
New-AzStorageTable -Name BlogPosts -Context $ctx
# Verify
Get-AzStorageTable -Context $ctx
```
- **Insert sample metadata entity (example)**
```powershell
$entity = @{ PartitionKey = "2026"; RowKey = "my-post-slug"; title="My Post Title"; date=(Get-Date).ToString("o"); blobPath="posts/2026/05/my-post-slug.json"; status="published" }
Add-AzTableRow -Table BlogPosts -PartitionKey $entity.PartitionKey -RowKey $entity.RowKey -Entity $entity -Context $ctx
```

**3) IAM / Access control**
- **Assign managed identity or principal the minimal role for publishing from your Private SWA or CI:**
```bash
az role assignment create --assignee <principalId-or-spn> --role "Storage Blob Data Contributor" --scope /subscriptions/<sub>/resourceGroups/my-rg/providers/Microsoft.Storage/storageAccounts/<acct>
```
- For read-only public site, host blobs behind CDN or give public read access on containers (`--public-access blob`) only for the `media` container:
```bash
az storage container set-permission --name media --public-access blob --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_KEY
```

**4) Production recommendations**
- Use StorageV2 (general-purpose v2). Use RBAC roles (`Storage Blob Data Contributor`) rather than account keys where possible. Prefer Managed Identity for serverless apps (SWA/Functions). Use soft-delete/versioning for blobs. Use partitioning by year as in azure-storage-config.md for scale.
- For heavy metadata/query needs, consider Cosmos DB Table API (higher cost) or add an indexing/search service.

**5) ARM/Bicep / Terraform approach (recommended for infra)**
- Create a Bicep snippet to declare the storage account, containers and table resource (Tables are part of the storage account; you can create tables via REST/CLI/AzTable). For full reproducibility, include a small Bicep or Terraform module and run in CI.

**6) Verification & testing**
- CLI: `az storage table list` and `az storage entity query` to inspect rows.  
- PowerShell: `Get-AzStorageTable` and `Get-AzTableRow` (AzTable helper).  
- Test publish flow from your Private SWA: use assigned principal credentials (or connection string env var) to create blob and insert table entity matching the schema.