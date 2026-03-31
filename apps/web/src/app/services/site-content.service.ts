import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SiteBanner {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  order?: number;
  active?: boolean;
}

export interface SiteHomepage {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  heroBadge?: string;
  collectionsHeading?: string;
  collectionsSubheading?: string;
}

export interface SiteContent {
  banners: SiteBanner[];
  homepage: SiteHomepage;
}

@Injectable({
  providedIn: 'root',
})
export class SiteContentService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/site-content`;

  getPublic(): Observable<{ status: string; data: { siteContent: SiteContent } }> {
    return this.http.get<{ status: string; data: { siteContent: SiteContent } }>(this.url);
  }
}
