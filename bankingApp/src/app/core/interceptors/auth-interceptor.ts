import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authToken = localStorage.getItem('token');
    if (!authToken) return next(req);
    const authReq = req.clone({ headers: req.headers.set('Authorization', `Bearer ${authToken}`) });
    return next(authReq);
};
