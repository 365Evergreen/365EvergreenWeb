import { BlobServiceClient } from '@azure/storage-blob';
import { TableClient } from '@azure/data-tables';
import { DefaultAzureCredential } from '@azure/identity';

function getConnectionString() {
  return process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AzureWebJobsStorage || process.env.AZURE_STORAGE_CONNECTION_STRING;
}

function getBlobServiceUri() {
  return (
    process.env.AzureWebJobsStorage__blobServiceUri ||
    process.env.AZURE_STORAGE_BLOB_SERVICE_URI ||
    process.env.BLOB_SERVICE_URI ||
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
}

function getTableServiceUri() {
  return (
    process.env.AzureWebJobsStorage__tableServiceUri ||
    process.env.AZURE_STORAGE_TABLE_SERVICE_URI ||
    process.env.TABLE_SERVICE_URI ||
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
}

function getCredential() {
  return new DefaultAzureCredential();
}

export function getBlobContainerClient(containerName) {
  const connectionString = getConnectionString();
  if (connectionString) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    return blobServiceClient.getContainerClient(containerName);
  }

  const blobServiceUri = getBlobServiceUri();
  if (!blobServiceUri) {
    throw new Error('Missing blob service connection info. Set AZURE_STORAGE_CONNECTION_STRING or AzureWebJobsStorage__blobServiceUri.');
  }

  const blobServiceClient = new BlobServiceClient(blobServiceUri, getCredential());
  return blobServiceClient.getContainerClient(containerName);
}

export function getTableClient(tableName) {
  const connectionString = getConnectionString();
  if (connectionString) {
    return new TableClient(connectionString, tableName);
  }

  const tableServiceUri = getTableServiceUri();
  if (!tableServiceUri) {
    throw new Error('Missing table service connection info. Set AZURE_STORAGE_CONNECTION_STRING or AzureWebJobsStorage__tableServiceUri.');
  }

  return new TableClient(tableServiceUri, tableName, getCredential());
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
