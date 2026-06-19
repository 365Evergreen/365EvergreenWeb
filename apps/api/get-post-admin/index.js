import { getTableClient } from '../shared/storageClient.js';

const TABLE_NAME = process.env.TABLE_NAME || 'BlogPosts';

export default async function (context, req) {
  try {
    const slug = req.query.slug || (req.body && req.body.slug);
    if (!slug) {
      return {
        status: 400,
        body: { error: 'Query string must include slug.' }
      };
    }

    const tableClient = getTableClient(TABLE_NAME);
    const normalizedSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const entity = await tableClient.getEntity('blog', normalizedSlug);

    const result = {
      id: entity.id || entity.rowKey,
      slug: entity.slug || entity.rowKey,
      title: entity.title || '',
      excerpt: entity.excerpt || '',
      status: entity.status || '',
      publishedDate: entity.publishedDate || '',
      tags: typeof entity.tags === 'string' ? entity.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : entity.tags || [],
      content: { path: entity.contentPath || '' },
      featuredImage: { path: entity.featuredImagePath || '', alt: entity.featuredImageAlt || '' },
      summary: entity.summary || ''
    };

    return {
      status: 200,
      body: { post: result }
    };
  } catch (error) {
    context.log.error('get-post-admin failed', error);
    if (error.statusCode === 404) {
      return { status: 404, body: { error: 'Post not found.' } };
    }
    return {
      status: 500,
      body: { error: error.message || 'An unexpected error occurred.' }
    };
  }
}
