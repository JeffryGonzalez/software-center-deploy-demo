import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocsService {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  load(slug: string): Observable<SafeHtml> {
    return this.http
      .get(`docs/${slug}.html`, { responseType: 'text' })
      .pipe(map((html) => this.sanitizer.bypassSecurityTrustHtml(html)));
  }
}
