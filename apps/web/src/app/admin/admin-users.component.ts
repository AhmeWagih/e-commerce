import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminService, type AdminUser } from '../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  private admin = inject(AdminService);

  users = signal<AdminUser[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  statusFilter = signal<string>('');
  includeDeleted = signal(false);
  actionId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.admin
      .listUsers({
        accountStatus: this.statusFilter() || undefined,
        includeDeleted: this.includeDeleted(),
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.users.set(res.data.users),
        error: () => this.error.set('Could not load users.'),
      });
  }

  setStatus(userId: string, accountStatus: string) {
    this.actionId.set(userId);
    this.admin
      .updateAccountStatus(userId, accountStatus)
      .pipe(finalize(() => this.actionId.set(null)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('Update failed.'),
      });
  }

  deactivate(userId: string) {
    this.actionId.set(userId);
    this.admin
      .softDeleteUser(userId)
      .pipe(finalize(() => this.actionId.set(null)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('Deactivate failed.'),
      });
  }

  restore(userId: string) {
    this.actionId.set(userId);
    this.admin
      .restoreUser(userId)
      .pipe(finalize(() => this.actionId.set(null)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('Restore failed.'),
      });
  }
}
