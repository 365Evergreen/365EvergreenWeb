#!/usr/bin/env bash
set -euo pipefail

# Provision an Azure Storage Table named 'BlogPosts'
# Usage: ./azure-table-provisioning.sh <storage-account-name> [resource-group]
# Example: ./azure-table-provisioning.sh mystorageacct my-rg

DEFAULT_ACCOUNT="rgsharepointportal91c7"
DEFAULT_RG="rg-sharepointportal"

ACCOUNT_NAME="${1:-$DEFAULT_ACCOUNT}"
RG="${2:-$DEFAULT_RG}"

if [ "$1" = "" ]; then
  echo "No storage account provided; using default: $ACCOUNT_NAME"
fi
if [ "$2" = "" ]; then
  echo "No resource group provided; using default: $RG"
fi

# Ensure storage-preview extension (table commands) is available
if ! az extension show -n storage-preview &>/dev/null; then
  echo "Installing azure 'storage-preview' extension for table commands..."
  az extension add --name storage-preview
fi

echo "Fetching storage account key for $ACCOUNT_NAME..."
ACCOUNT_KEY=$(az storage account keys list --account-name "$ACCOUNT_NAME" ${RG:+--resource-group "$RG"} --query '[0].value' -o tsv)
if [ -z "$ACCOUNT_KEY" ]; then
  echo "Failed to get storage account key." >&2
  exit 1
fi

export AZURE_STORAGE_ACCOUNT="$ACCOUNT_NAME"
export AZURE_STORAGE_KEY="$ACCOUNT_KEY"

TABLE_NAME="BlogPosts"

echo "Creating table '$TABLE_NAME' in storage account '$ACCOUNT_NAME'..."
az storage table create --name "$TABLE_NAME" --account-name "$AZURE_STORAGE_ACCOUNT" --account-key "$AZURE_STORAGE_KEY" >/dev/null

echo "Listing tables to verify..."
az storage table list --account-name "$AZURE_STORAGE_ACCOUNT" --account-key "$AZURE_STORAGE_KEY" -o table

# Optional: insert a sample entity (adjust fields per your schema)
echo "Inserting a sample entity into $TABLE_NAME..."
az storage entity insert \
  --table-name "$TABLE_NAME" \
  --entity "PartitionKey=2026" "RowKey=my-post-slug" "title=My Post Title" "slug=my-post-slug" "date=$(date -Iseconds)" "blobPath=posts/2026/05/my-post-slug.json" "status=published" \
  --account-name "$AZURE_STORAGE_ACCOUNT" \
  --account-key "$AZURE_STORAGE_KEY"

echo "Querying sample entity..."
az storage entity query --table-name "$TABLE_NAME" --filter "PartitionKey eq '2026' and RowKey eq 'my-post-slug'" --account-name "$AZURE_STORAGE_ACCOUNT" --account-key "$AZURE_STORAGE_KEY" -o json

echo "Done."

# Optional: assign RBAC role to a principal (managed identity or service principal)
# Usage: ./azure-table-provisioning.sh <account> <rg> <principalId> [sas|nosas]
PRINCIPAL_ID="${3:-}"
SAS_FLAG="${4:-}"
if [ -n "$PRINCIPAL_ID" ]; then
  echo "Assigning 'Storage Table Data Contributor' to principal $PRINCIPAL_ID on the storage account..."
  SA_ID=$(az storage account show -n "$ACCOUNT_NAME" -g "$RG" --query id -o tsv)
  az role assignment create --assignee "$PRINCIPAL_ID" --role "Storage Table Data Contributor" --scope "$SA_ID"
fi

if [ "$SAS_FLAG" = "sas" ]; then
  echo "Generating account SAS token for Table service (30 days)..."
  SAS_EXPIRY=$(python - <<'PY'
from datetime import datetime, timedelta
print((datetime.utcnow()+timedelta(days=30)).strftime('%Y-%m-%dT%H:%MZ'))
PY
)
  SAS_TOKEN=$(az storage account generate-sas --account-name "$ACCOUNT_NAME" --services t --resource-types sco --permissions rwdlacu --expiry "$SAS_EXPIRY" --https-only true --output tsv --account-key "$ACCOUNT_KEY")
  echo "SAS token (truncated): ${SAS_TOKEN:0:80}..."
  echo "Table endpoint: https://$ACCOUNT_NAME.table.core.windows.net?$SAS_TOKEN"
fi
