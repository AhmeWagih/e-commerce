import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AccountUser } from '../profile.types';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile-personal-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-personal-section.component.html',
})
export class ProfilePersonalSectionComponent {
  @Input({ required: true }) user!: AccountUser;
  @Input() loading = false;
  @Input() roleLabel = 'Customer';

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private notifications = inject(NotificationService);

  editMode = signal(false);
  updateBusy = signal(false);
  formData = signal<{ name: string; phone: string; address: string }>({
    name: '',
    phone: '',
    address: '',
  });

  toggleEdit(): void {
    this.editMode.update((x) => !x);
    if (this.editMode()) {
      this.formData.set({
        name: this.user.name || '',
        phone: this.user.phone || '',
        address: this.user.address || '',
      });
    }
  }

  save(): void {
    this.updateBusy.set(true);
    const payload = this.formData();

    this.api
      .updateMe({
        name: payload.name || undefined,
        phone: payload.phone || undefined,
        address: payload.address || undefined,
      })
      .pipe(finalize(() => this.updateBusy.set(false)))
      .subscribe({
        next: (response) => {
          const updatedUser = response?.data?.user ?? response?.data ?? response;
          if (updatedUser) {
            this.user.name = updatedUser.name || this.user.name;
            this.user.phone = updatedUser.phone || this.user.phone;
            this.user.address = updatedUser.address || '';
            this.auth.updateCurrentUser(updatedUser);
          }
          this.editMode.set(false);
          this.notifications.success('Profile updated successfully.');
        },
        error: () => {
          this.notifications.error('Failed to update profile. Please try again.');
        },
      });
  }

  cancel(): void {
    this.editMode.set(false);
    this.formData.set({
      name: this.user.name || '',
      phone: this.user.phone || '',
      address: this.user.address || '',
    });
  }
}
