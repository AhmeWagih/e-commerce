import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminService } from '../services/admin.service';
import { SiteContentService, type SiteBanner, type SiteContent } from '../services/site-content.service';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-content.component.html',
})
export class AdminContentComponent implements OnInit {
  private site = inject(SiteContentService);
  private admin = inject(AdminService);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  homepage = {
    heroBadge: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImageUrl: '',
    collectionsHeading: '',
    collectionsSubheading: '',
  };

  banners = signal<SiteBanner[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.site
      .getPublic()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.applyContent(res.data.siteContent),
        error: () => this.error.set('Could not load site content.'),
      });
  }

  applyContent(c: SiteContent) {
    const h = c.homepage || {};
    this.homepage = {
      heroBadge: h.heroBadge || '',
      heroTitle: h.heroTitle || '',
      heroSubtitle: h.heroSubtitle || '',
      heroImageUrl: h.heroImageUrl || '',
      collectionsHeading: h.collectionsHeading || '',
      collectionsSubheading: h.collectionsSubheading || '',
    };
    this.banners.set(Array.isArray(c.banners) ? [...c.banners] : []);
  }

  addBanner() {
    this.banners.update((b) => [
      ...b,
      { title: '', subtitle: '', imageUrl: '', linkUrl: '', order: b.length, active: true },
    ]);
  }

  removeBanner(index: number) {
    this.banners.update((b) => b.filter((_, i) => i !== index));
  }

  save() {
    this.saving.set(true);
    this.error.set(null);
    this.message.set(null);
    this.admin
      .updateSiteContent({
        homepage: { ...this.homepage },
        banners: this.banners(),
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (res) => {
          this.message.set('Saved.');
          this.applyContent(res.data.siteContent as SiteContent);
        },
        error: () => this.error.set('Save failed.'),
      });
  }
}
