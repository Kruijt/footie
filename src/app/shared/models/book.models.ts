export interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description: string;
    imageLinks?: {
      thumbnail?: string;
    };
  };
}

export interface DownloadBookRequest {
  audiobook?: string | null;
  ebook?: string | null;
  title: string;
}

export interface DownloadBookResponse {
  torrentStarted: boolean;
  epubSent: boolean;
}

export interface GetBookDownloadsRequest {
  query: string;
  ebook: boolean;
  audiobook: boolean;
}

export interface GetBookDownloadsResponse {
  ebooks: { size: string; title: string; link: string }[];
  audiobooks: { title: string; link: string }[];
}
