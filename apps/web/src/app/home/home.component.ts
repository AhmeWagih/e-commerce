import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteContentService, type SiteContent } from '../services/site-content.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private site = inject(SiteContentService);
  content = signal<SiteContent | null>(null);

  constructor() {
    this.site.getPublic().subscribe({
      next: (res) => this.content.set(res.data.siteContent),
      error: () => this.content.set(null),
    });
  }

  activeBanners() {
    const c = this.content();
    if (!c?.banners?.length) return [];
    return [...c.banners]
      .filter((b) => b.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}
