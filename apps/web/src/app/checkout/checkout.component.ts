import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import type { HydratedCart } from '../cart/cart.types';

type StepKey = 1 | 2 | 3;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private notifications = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private validatePromoUrl = `${environment.apiBaseUrl}/promos/validate`;

  step = signal<StepKey>(1);
  isLoading = signal(false);
  placingOrder = signal(false);
  orderError = signal<string | null>(null);

  cart = signal<HydratedCart | null>(null);
  totals$ = this.cartService.totals$;

  promoInput = signal('');
  promoDiscount = signal(0);
  promoAppliedCode = signal<string | null>(null);
  promoError = signal<string | null>(null);
  promoLoading = signal(false);

  shippingForm = this.fb.group({
    address: ['', [Validators.required, Validators.minLength(6)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    zipCode: ['', [Validators.required, Validators.minLength(3)]],
  });

  paymentForm = this.fb.group({
    method: ['cod', [Validators.required]],
    cardNumber: [''],
    cardName: [''],
    expiry: [''],
    cvv: [''],
  });

  isCredit = computed(() => this.paymentForm.controls.method.value === 'credit');

  ngOnInit(): void {
    this.isLoading.set(true);
    this.cartService
      .loadCart()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((c) => this.cart.set(c));
  }

  selectPayment(method: 'credit' | 'cod') {
    this.paymentForm.controls.method.setValue(method);
    this.paymentForm.controls.cardNumber.clearValidators();
    this.paymentForm.controls.cardName.clearValidators();
    this.paymentForm.controls.expiry.clearValidators();
    this.paymentForm.controls.cvv.clearValidators();
    if (method !== 'credit') {
      this.paymentForm.patchValue({ cardNumber: '', cardName: '', expiry: '', cvv: '' }, { emitEvent: false });
    }
    this.paymentForm.controls.cardNumber.updateValueAndValidity();
    this.paymentForm.controls.cardName.updateValueAndValidity();
    this.paymentForm.controls.expiry.updateValueAndValidity();
    this.paymentForm.controls.cvv.updateValueAndValidity();
  }

  next() {
    const s = this.step();
    if (s === 1) {
      this.shippingForm.markAllAsTouched();
      if (this.shippingForm.invalid) return;
      this.step.set(2);
      return;
    }
    if (s === 2) {
      this.paymentForm.markAllAsTouched();
      if (this.paymentForm.invalid) return;
      void this.placeOrder();
      return;
    }
  }

  back() {
    const s = this.step();
    if (s === 2) this.step.set(1);
  }

  async applyPromo(): Promise<void> {
    const code = this.promoInput().trim().toUpperCase();
    const subtotal = this.cart()?.totalPrice ?? 0;

    this.promoError.set(null);

    if (!code) {
      this.promoError.set('Please enter a promo code.');
      return;
    }
    if (subtotal <= 0) {
      this.promoError.set('Add items to cart before applying a promo code.');
      return;
    }

    this.promoLoading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<unknown>(this.validatePromoUrl, {
          code,
          subtotal,
        })
      );

      let discount = 0;
      let appliedCode = code;
      if (res && typeof res === 'object') {
        const body = res as Record<string, unknown>;
        const data = body['data'];
        if (data && typeof data === 'object') {
          const d = data as Record<string, unknown>;
          const rawDiscount = d['discount'];
          if (typeof rawDiscount === 'number' && Number.isFinite(rawDiscount)) {
            discount = rawDiscount;
          }
          const returnedCode = d['code'];
          if (typeof returnedCode === 'string' && returnedCode.trim().length > 0) {
            appliedCode = returnedCode.trim().toUpperCase();
          }
        }
      }

      this.promoDiscount.set(Math.min(Math.max(discount, 0), subtotal));
      this.promoAppliedCode.set(appliedCode);
      this.promoInput.set(appliedCode);
      this.notifications.success(`Promo ${appliedCode} applied.`);
    } catch (err: unknown) {
      let msg = 'Could not validate promo code.';
      if (err instanceof HttpErrorResponse) {
        const e = err.error;
        if (e && typeof e === 'object' && 'message' in e) {
          msg = String((e as { message?: string }).message ?? msg);
        } else if (typeof err.error === 'string' && err.error.length) {
          msg = err.error;
        }
      }
      this.promoError.set(msg);
    } finally {
      this.promoLoading.set(false);
    }
  }

  clearPromo(): void {
    this.promoDiscount.set(0);
    this.promoAppliedCode.set(null);
    this.promoError.set(null);
    this.promoInput.set('');
  }

  async placeOrder(): Promise<void> {
    const cart = this.cart();
    if (!cart || cart.items.length === 0) {
      void this.router.navigateByUrl('/cart');
      return;
    }

    this.shippingForm.markAllAsTouched();
    this.paymentForm.markAllAsTouched();
    if (this.shippingForm.invalid || this.paymentForm.invalid) return;

    const subtotal = cart.totalPrice ?? 0;
    const shipping = cart.items.length > 0 ? 50 : 0;
  const promoDiscount = Math.min(Math.max(this.promoDiscount(), 0), subtotal);
  const total = Math.max(0, subtotal - promoDiscount + shipping);
  const promoCode = this.promoAppliedCode();

    const paymentMethod = this.paymentForm.controls.method.value === 'credit' ? 'credit' : 'cod';

    this.placingOrder.set(true);
    this.orderError.set(null);

    try {
      const result = await firstValueFrom(
        this.orderService.createOrder({
          items: cart.items.map((it) => ({
            productId: it.product,
            quantity: it.quantity,
            unitPrice: it.priceAfterDiscount,
          })),
          totalAmount: total,
          shippingAddress: {
            address: this.shippingForm.controls.address.value!,
            city: this.shippingForm.controls.city.value!,
            zipCode: this.shippingForm.controls.zipCode.value!,
          },
          paymentMethod,
          shippingFee: shipping,
          ...(promoCode ? { promoCode } : {}),
        })
      );

      const sessionUrl = result.sessionUrl?.trim();
      if (sessionUrl) {
        if (isPlatformBrowser(this.platformId)) {
          window.location.href = sessionUrl;
        }
        return;
      }

      if (paymentMethod === 'credit') {
        const msg = 'No payment session URL was returned.';
        this.orderError.set(msg);
        this.notifications.error(msg);
        return;
      }

      this.cartService.clearLocalCart();
      this.notifications.success('Order placed successfully.');
      await this.router.navigateByUrl('/orders');
    } catch (err: unknown) {
      let msg = 'Could not place order.';
      if (err instanceof HttpErrorResponse) {
        const e = err.error;
        if (e && typeof e === 'object' && 'message' in e) {
          msg = String((e as { message?: string }).message ?? msg);
        } else if (typeof err.error === 'string' && err.error.length) {
          msg = err.error;
        }
      }
      this.orderError.set(msg);
      this.notifications.error(msg);
    } finally {
      this.placingOrder.set(false);
    }
  }
}
