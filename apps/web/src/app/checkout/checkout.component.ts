import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
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
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  step = signal<StepKey>(1);
  isLoading = signal(false);
  placingOrder = signal(false);

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
    if (method === 'credit') {
      this.paymentForm.controls.cardNumber.addValidators([Validators.required, Validators.minLength(12)]);
      this.paymentForm.controls.cardName.addValidators([Validators.required, Validators.minLength(2)]);
      this.paymentForm.controls.expiry.addValidators([Validators.required]);
      this.paymentForm.controls.cvv.addValidators([Validators.required, Validators.minLength(3)]);
    } else {
      this.paymentForm.controls.cardNumber.clearValidators();
      this.paymentForm.controls.cardName.clearValidators();
      this.paymentForm.controls.expiry.clearValidators();
      this.paymentForm.controls.cvv.clearValidators();
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
      this.step.set(3);
      return;
    }
  }

  back() {
    const s = this.step();
    if (s === 2) this.step.set(1);
    if (s === 3) this.step.set(2);
  }

  applyPromo() {
    const cart = this.cart();
    const code = this.promoInput().trim();
    if (!cart?.items.length || !code) return;
    const subtotal = cart.totalPrice ?? 0;
    this.promoError.set(null);
    this.promoLoading.set(true);
    this.orderService.validatePromo(code, subtotal).subscribe({
      next: (res) => {
        this.promoLoading.set(false);
        this.promoDiscount.set(res.data.discount);
        this.promoAppliedCode.set(res.data.code);
      },
      error: (err) => {
        this.promoLoading.set(false);
        this.promoDiscount.set(0);
        this.promoAppliedCode.set(null);
        this.promoError.set(err.error?.message || 'Invalid promo code.');
      },
    });
  }

  clearPromo() {
    this.promoDiscount.set(0);
    this.promoAppliedCode.set(null);
    this.promoError.set(null);
    this.promoInput.set('');
  }

  placeOrder() {
    const cart = this.cart();
    if (!cart || cart.items.length === 0) {
      this.router.navigateByUrl('/cart');
      return;
    }

    this.shippingForm.markAllAsTouched();
    this.paymentForm.markAllAsTouched();
    if (this.shippingForm.invalid || this.paymentForm.invalid) return;

    const subtotal = cart.totalPrice ?? 0;
    const shipping = cart.items.length > 0 ? 50 : 0;
    const discount = this.promoDiscount();
    const total = Math.max(0, subtotal - discount + shipping);

    this.placingOrder.set(true);
    this.orderService
      .createOrder({
        items: cart.items.map((it) => ({
          productId: it.product,
          quantity: it.quantity,
          unitPrice: it.priceAfterDiscount,
        })),
        totalAmount: total,
        shippingFee: shipping,
        promoCode: this.promoAppliedCode() || undefined,
        shippingAddress: {
          address: this.shippingForm.controls.address.value!,
          city: this.shippingForm.controls.city.value!,
          zipCode: this.shippingForm.controls.zipCode.value!,
        },
        paymentMethod: this.paymentForm.controls.method.value === 'credit' ? 'credit' : 'cod',
      })
      .pipe(finalize(() => this.placingOrder.set(false)))
      .subscribe({
        next: () => {
          this.cartService.clearLocalCart();
          this.router.navigateByUrl('/profile');
        },
      });
  }
}

