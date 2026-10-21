import { SearchBookResult } from '../types';

export async function searchBooks(query: string): Promise<SearchBookResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // Try Open Library first
  try {
    const encoded = encodeURIComponent(cleanQuery);
    const url = `https://openlibrary.org/search.json?q=${encoded}&limit=15`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.docs) && data.docs.length > 0) {
        return data.docs.map((doc: any, index: number): SearchBookResult => {
          const coverId = doc.cover_i;
          const coverUrl = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : undefined;

          const author = Array.isArray(doc.author_name)
            ? doc.author_name.slice(0, 2).join(', ')
            : (doc.author_name || 'Unknown Author');

          const totalPages =
            doc.number_of_pages_median ||
            (Array.isArray(doc.number_of_pages) ? doc.number_of_pages[0] : null) ||
            300;

          return {
            id: `ol_${doc.key || index}_${Date.now()}`,
            title: doc.title || 'Untitled Book',
            author,
            coverUrl,
            totalPages: Math.max(10, Number(totalPages) || 300),
            publishedYear: doc.first_publish_year,
            source: 'openlibrary',
          };
        });
      }
    }
  } catch (err) {
    console.warn('[searchBooks] OpenLibrary query failed or timed out, trying Google Books fallback:', err);
  }

  // Fallback to Google Books API
  try {
    const encoded = encodeURIComponent(cleanQuery);
    const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=${encoded}&maxResults=15`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(googleUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const gData = await res.json();
      if (Array.isArray(gData.items) && gData.items.length > 0) {
        return gData.items.map((item: any): SearchBookResult => {
          const info = item.volumeInfo || {};
          let thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
          if (thumb && thumb.startsWith('http://')) {
            thumb = thumb.replace('http://', 'https://');
          }

          const author = Array.isArray(info.authors)
            ? info.authors.slice(0, 2).join(', ')
            : (info.authors || 'Unknown Author');

          const totalPages = info.pageCount || 300;

          return {
            id: `gb_${item.id}_${Date.now()}`,
            title: info.title || 'Untitled Book',
            author,
            coverUrl: thumb,
            totalPages: Math.max(10, Number(totalPages) || 300),
            publishedYear: info.publishedDate ? info.publishedDate.substring(0, 4) : undefined,
            source: 'googlebooks',
          };
        });
      }
    }
  } catch (err) {
    console.warn('[searchBooks] Google Books fallback also failed:', err);
  }

  return [];
}
