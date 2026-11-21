import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SchemaGraph } from '@/components/Schema';
import PageWrapper from '@/components/Template/PageWrapper';
import PostContent from '@/components/Writing/PostContent';
import PostPager from '@/components/Writing/PostPager';
import ReadingProgress from '@/components/Writing/ReadingProgress';
import { readPostImageSizes, leadImageSource } from '@/lib/imageSize';
import { createPageMetadata } from '@/lib/metadata';
import { getPostBySlug, getPostSlugs } from '@/lib/posts';
import { breadcrumbNode, blogPostingNode, webPageNode } from '@/lib/schema';
import { CARD_SIZE, postCardPath } from '@/lib/share-cards.mjs';
import { canonicalPostUrl, formatDate, SITE_URL } from '@/lib/utils';
import { getAdjacentPosts } from '@/lib/writing';
import { smartQuotes } from '@/lib/typography';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: 'Writing not found' };

  const pageMetadata = createPageMetadata({
    title: post.title,
    description: post.description,
    path: `/writing/${post.slug}/`,
  });
  const cardUrl = `${SITE_URL}${postCardPath(post.slug)}`;

  return {
    ...pageMetadata,
    openGraph: {
      ...pageMetadata.openGraph,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      images: [
        {
          url: cardUrl,
          width: CARD_SIZE.width,
          height: CARD_SIZE.height,
          alt: post.title,
        },
      ],
    },
    twitter: {
      ...pageMetadata.twitter,
      images: [cardUrl],
    },
  };
}

export default async function WritingPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const pageUrl = canonicalPostUrl(post.slug);
  const imageSizes = readPostImageSizes(post.content);
  const leadImage = leadImageSource(post.content);
  const { newer, older } = getAdjacentPosts(post.slug);

  return (
    <PageWrapper>
      <SchemaGraph
        nodes={[
          webPageNode({
            url: pageUrl,
            name: post.title,
            description: post.description,
            hasBreadcrumb: true,
          }),
          blogPostingNode(post, {
            url: `${SITE_URL}${postCardPath(post.slug)}`,
            width: CARD_SIZE.width,
            height: CARD_SIZE.height,
            alt: post.title,
          }),
          breadcrumbNode(pageUrl, [
            { name: 'Home', url: `${SITE_URL}/` },
            { name: 'Writing', url: `${SITE_URL}/writing/` },
            { name: post.title, url: pageUrl },
          ]),
        ]}
      />
      <article className="post-page">
        <ReadingProgress />
        <nav className="project-detail-back" aria-label="Breadcrumb">
          <Link href="/writing/">← All writing</Link>
        </nav>
        <header className="post-header">
          <time className="post-date" dateTime={post.date}>
            {formatDate(post.date)}
          </time>
          <h1 className="post-title">{smartQuotes(post.title)}</h1>
          <p className="post-description">{post.description}</p>
        </header>
        <div className="prose">
          <PostContent
            content={post.content}
            imageSizes={imageSizes}
            leadImage={leadImage}
          />
        </div>
        <PostPager newer={newer} older={older} />
      </article>
    </PageWrapper>
  );
}
