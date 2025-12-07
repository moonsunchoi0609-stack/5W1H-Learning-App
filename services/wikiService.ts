import { Article } from '../types';

export const fetchWikipediaArticles = async (searchQuery: string): Promise<Article[]> => {
  try {
    // 1. Search for titles
    const searchUrl = `https://ko.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*&srlimit=10`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
      return [];
    }

    // 2. Fetch details (extracts) for the found titles
    const titles = searchData.query.search.map((item: any) => item.title).join('|');
    const detailsUrl = `https://ko.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(titles)}&format=json&origin=*`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();
    
    const pages = detailsData.query.pages;
    const formattedArticles = Object.values(pages).map((page: any, index: number) => ({
      id: page.pageid ? String(page.pageid) : `wiki_${index}`,
      category: '지식 백과',
      title: page.title,
      content: page.extract || '내용을 불러올 수 없습니다.',
      source: '위키백과',
      readTime: '읽기',
      keywords: [searchQuery, '백과사전']
    })).filter((article: Article) => article.content && article.content.length > 50);

    return formattedArticles;
  } catch (error) {
    console.error("Wikipedia Search failed:", error);
    throw error;
  }
};