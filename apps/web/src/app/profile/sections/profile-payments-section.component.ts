import { Component, Input } from '@angular/core';
import { AccountUser } from '../profile.types';

@Component({
  selector: 'app-profile-payments-section',
  standalone: true,
  templateUrl: './profile-payments-section.component.html',
})
export class ProfilePaymentsSectionComponent {
  @Input({ required: true }) user!: AccountUser;
}
