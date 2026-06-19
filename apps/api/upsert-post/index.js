import { ensureBlobContainer, ensureTable, getBlobContainerClient, getTableClient } from '../shared/storageClient.js';

const TABLE_NAME = process.env.TABLE_NAME || 'BlogPosts';
const BLOB_CONTAINER = process.env.BLOB_CONTAINER || 'posts';
const REGISTRY_BLOB_NAME = process.env.REGISTRY_BLOB_NAME || 'posts-registry.json';

function normalizeSlug(slug) {
  return String(slug || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function mapPostToEntity(post) {
  const tags = Array.isArray(post.tags) ? post.tags.join(',') : String(post.tags || '').trim();
  return {
    partitionKey: 'blog',
    rowKey: normalizeSlug(post.slug || post.title || 'untitled'),
    title: post.title || '',
    excerpt: post.excerpt || '',
    status: post.status || 'draft',
    publishedDate: post.publishedDate || new Date().toISOString(),
    tags,
    contentPath: post.content && post.content.path ? post.content.path : '',
    featuredImagePath: post.featuredImage && post.featuredImage.path ? post.featuredImage.path : '',
    featuredImageAlt: post.featuredImage && post.featuredImage.alt ? post.featuredImage.alt : '',
    summary: post.summary || '',
    slug: normalizeSlug(post.slug || post.title || 'untitled'),
    id: post.id || `post-${Date.now()}`
  };
}

export default async function (context, req) {
  try {
    const body = req.body || (req.rawBody ? JSON.parse(req.rawBody.toString()) : null);
    if (!body || !body.slug || !body.title) {
      return {
        status: 400,
        body: { error: 'Request body must include slug and title.' }
      };
    }

    const post = {
      id: body.id || `post-${Date.now()}`,
      slug: normalizeSlug(body.slug),
      title: body.title,
      summary: body.summary || '',
      status: body.status || 'draft',
      publishedDate: body.publishedDate || new Date().toISOString(),
      tags: body.tags || [],
      content: body.content || { path: '' },
      featuredImage: body.featuredImage || { path: '', alt: '' },
      excerpt: body.excerpt || ''
    };

    const blobClient = await ensureBlobContainer(BLOB_CONTAINER);
    const pagePath = post.content.path || `posts/${post.slug}.json`;
    const blob = blobClient.getBlockBlobClient(pagePath);
    await blob.upload(JSON.stringify(post, null, 2), Buffer.byteLength(JSON.stringify(post, null, 2)), {
      blobHTTPHeaders: { blobContentType: 'application/json' }
    });

    const tableClient = await ensureTable(TABLE_NAME);
    const entity = mapPostToEntity(post);
    await tableClient.upsertEntity(entity, 'Merge');

    const registryBlobClient = blobClient.getBlockBlobClient(REGISTRY_BLOB_NAME);
    let registry = [];
    try {
      const download = await registryBlobClient.downloadToBuffer();
      registry = JSON.parse(download.toString());
      if (!Array.isArray(registry)) registry = [];
    } catch (error) {
      if (error.statusCode !== 404) throw error;
    }

    const existingIndex = registry.findIndex((item) => String(item.slug).trim() === post.slug);
    const summaryItem = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      status: post.status,
      publishedDate: post.publishedDate,
      tags: Array.isArray(post.tags) ? post.tags : String(post.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      content: { path: pagePath },
      featuredImage: { path: post.featuredImage.path || '', alt: post.featuredImage.alt || '' }
    };

    if (existingIndex >= 0) {
      registry[existingIndex] = summaryItem;
    } else {
      registry.push(summaryItem);
    }

    await registryBlobClient.upload(JSON.stringify(registry, null, 2), Buffer.byteLength(JSON.stringify(registry, null, 2)), {
      blobHTTPHeaders: { blobContentType: 'application/json' }
    });

    return {
      status: 200,
      body: { post: summaryItem, publishedPath: pagePath }
    };
  } catch (error) {
    context.log.error('upsert-post failed', error);
    return {
      status: 500,
      body: { error: error.message || 'An unexpected error occurred.' }
    };
  }
}
