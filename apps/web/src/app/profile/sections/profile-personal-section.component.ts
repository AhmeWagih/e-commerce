import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AccountUser } from '../profile.types';

@Component({
  selector: 'app-profile-personal-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-personal-section.component.html',
})
export class ProfilePersonalSectionComponent {
  @Input({ required: true }) user!: AccountUser;
  @Input() loading = false;
  @Input() roleLabel = 'Customer';
}
