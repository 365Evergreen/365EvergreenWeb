import { BlobServiceClient } from '@azure/storage-blob';
import { TableClient } from '@azure/data-tables';
import { DefaultAzureCredential } from '@azure/identity';

function getConnectionString() {
  return (
    process.env.AZURE_STORAGE_CONNECTION_STRING ||
    process.env.AzureWebJobsStorage
  );
}

function getCredential() {
  return new DefaultAzureCredential({
    managedIdentityClientId: process.env.AZURE_CLIENT_ID // safe even if undefined
  });
}

// ✅ Blob
export function getBlobContainerClient(containerName) {
  const connectionString = getConnectionString();

  if (connectionString) {
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);

    return blobServiceClient.getContainerClient(containerName);
  }

  const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;

  if (!account) {
    throw new Error(
      'Missing storage account name for managed identity.'
    );
  }

  return new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    getCredential()
  ).getContainerClient(containerName);
}

// ✅ Table
export function getTableClient(tableName) {
  const connectionString = getConnectionString();

  if (connectionString) {
    return TableClient.fromConnectionString(
      connectionString,
      tableName
    );
  }

  const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;

  if (!account) {
    throw new Error(
      'Missing storage account name for managed identity.'
    );
  }

  return new TableClient(
    `https://${account}.table.core.windows.net`,
    tableName,
    getCredential()
  );
}

// ✅ Ensure helpers unchanged
export async function ensureBlobContainer(containerName) {
  const client = getBlobContainerClient(containerName);
  await client.createIfNotExists();
  return client;
}

export async function ensureTable(tableName) {
  const client = getTableClient(tableName);

  try {
    await client.createTable();
  } catch (error) {
    if (error.statusCode !== 409) {
      throw error;
    }
  }

  return client;
}