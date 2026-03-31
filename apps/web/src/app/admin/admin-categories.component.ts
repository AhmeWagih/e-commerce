import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CategoryService, type Category } from '../services/category.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
})
export class AdminCategoriesComponent implements OnInit {
  private categoriesApi = inject(CategoryService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  name = '';
  description = '';
  deletingId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.categoriesApi
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.categories.set(res.data.categories),
        error: () => this.error.set('Could not load categories.'),
      });
  }

  create() {
    const name = this.name.trim();
    if (!name) {
      this.error.set('Name is required.');
      return;
    }
    this.error.set(null);
    this.categoriesApi.create({ name, description: this.description.trim() || undefined }).subscribe({
      next: () => {
        this.name = '';
        this.description = '';
        this.load();
      },
      error: () => this.error.set('Could not create category.'),
    });
  }

  remove(id: string) {
    this.deletingId.set(id);
    this.categoriesApi
      .delete(id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('Delete failed (category may be in use).'),
      });
  }
}
