import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div class="text-center space-y-4">
        <h1 class="text-3xl font-semibold">Welcome to the store</h1>
        <p class="text-slate-400">You are logged in. Build your home page here.</p>
      </div>
    </div>
  `,
})
export class HomeComponent {}

