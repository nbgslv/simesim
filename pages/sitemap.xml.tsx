import * as fs from 'fs';
import { NextApiResponse } from 'next';
import prisma from '../lib/prisma';

const Sitemap = () => null;

export const getServerSideProps = async ({ res }: { res: NextApiResponse }) => {
  const staticPaths = fs
    .readdirSync('pages')
    .filter(
      (staticPage) =>
        ![
          'api',
          'admin',
          'index.tsx',
          '_app.tsx',
          '_error.tsx',
          '_document.tsx',
          '404.tsx',
          'sitemap.xml.tsx',
        ].includes(staticPage)
    )
    .map(
      (staticPagePath) =>
        `${process.env.NEXTAUTH_URL}/${staticPagePath.replace('.tsx', '')}`
    );

  const posts = await prisma.post.findMany({
    where: {
      show: true,
    },
    select: {
      slug: true,
    },
  });
  const dynamicPaths = posts.map(
    (post) => `${process.env.NEXTAUTH_URL}/blog/${post.slug}`
  );

  const allPaths = [...staticPaths, ...dynamicPaths];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
http://www.sitemaps.org/schemas/sitemap/0.9 ">
  <url>
    <loc>${process.env.NEXTAUTH_URL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
      ${allPaths
        .map(
          (url) => `
            <url>
              <loc>${url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>0.8</priority>
            </url>
          `
        )
        .join('')}
    </urlset>
`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
