import { HttpInterceptorFn } from '@angular/common/http';

const ACCESS_TOKEN_KEY = 'accessToken';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window === 'undefined') {
    return next(req);
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};