import { map, Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Book,
  DownloadBookRequest,
  DownloadBookResponse,
  GetBookDownloadsResponse,
} from '../../../../shared/models/book.models';
import { HttpsCallableResult } from '@firebase/functions';
import { FunctionsService } from '../core/functions.service';

@Injectable({
  providedIn: 'root',
})
export class BookService extends FunctionsService {
  constructor(private http: HttpClient) {
    super();
  }

  search(titleQuery: string, authorQuery: string, langRestrict: string): Observable<Book[]> {
    return this.http
      .get<{
        items: Book[];
      }>(`https://www.googleapis.com/books/v1/volumes`, {
        params: {
          q: `intitle:${titleQuery}+inauthor:${authorQuery}`,
          langRestrict,
          printType: 'books',
          projection: 'lite',
          maxResults: 40,
        },
      })
      .pipe(map((response) => response.items));
  }

  getBookDownloads(book: Book): Promise<HttpsCallableResult<GetBookDownloadsResponse>> {
    return this.callFunction('getBookDownloads', {
      query: `${book.volumeInfo.title} ${book.volumeInfo.authors?.[0]}`,
      ebook: true,
      audiobook: true,
    });
  }

  downloadBook(book: DownloadBookRequest): Promise<HttpsCallableResult<DownloadBookResponse>> {
    return this.callFunction('downloadBook', book);
  }
}
