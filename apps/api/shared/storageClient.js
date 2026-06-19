import { BlobServiceClient } from '@azure/storage-blob';
import { TableClient } from '@azure/data-tables';

function getConnectionString() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AzureWebJobsStorage || process.env.AzureWebJobsStorage;
  if (!connectionString) {
    throw new Error('Missing storage connection string. Set AZURE_STORAGE_CONNECTION_STRING or AzureWebJobsStorage.');
  }
  return connectionString;
}

export function getBlobContainerClient(containerName) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(getConnectionString());
  return blobServiceClient.getContainerClient(containerName);
}

export function getTableClient(tableName) {
  return new TableClient(getConnectionString(), tableName);
}

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
