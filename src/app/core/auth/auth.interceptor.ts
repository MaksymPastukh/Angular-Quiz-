import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, Observable, switchMap, throwError} from "rxjs";
import {AuthService} from "./auth.service";
import {Injectable} from "@angular/core";
import {RefreshResponseType} from "../../../types/refresh-response.type";
import {Router} from "@angular/router";


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {
  }

// Каждый запрос который будет происходить в проекте пройдет через этот intercept
//И когда запрос начинает отправляться срабатывает функция intercept и в req: HttpRequest<any>,
// мы получаем запрос который сейчас происходит
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Получаем токены
    const tokens = this.authService.getTokens()
    // Проверяем есть ли токены
    if (tokens.accessToken) {
      // При образовываем наш запрос и добавляем его в заголовок запроса наш токен
      const authReq = req.clone({
        headers: req.headers.set("x-access-token", tokens.accessToken)
      })

      // Возвращаем измененный запрос
      return next.handle(authReq)
        // Для дополнительной обработки запроса используем методы Observable
        .pipe(
          // Используем нужные операторы для проверки статуса ответа с запроса
          catchError((error: HttpErrorResponse) => {
            // Если мы получили ошибку 401 не на страницу login и это не запрос на обновление refreshToken
            if (error.status === 401 && !authReq.url.includes('/login') && !authReq.url.includes('/refresh')) {
              // В catchError мы можем вернуть либо новый observable или ошибку (ошибку возвращаем если запрос не прошел и мы не будем обрабатывать 401)
              // При ошибке в 401 мы будем возвращать новый observable в котором будем делать дополнительные запросы
              // Это будет новый запрос на обновление токена + повторный запрос в intercept с новой парой токенов

              return this.handel401Error(authReq, next)
            }
            // В противном случаем возвращаем другую ошибку
            return throwError(() => error)
          })
        )
    }

    // Если мы токен не получили, то мы оставляем запрос такой какой он был изначально без установки заголовков
    return next.handle(req)
  }


  handel401Error(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.refresh()
      // В этом пайпе мы получаем результат нашего запроса refresh
      .pipe(
        // Этот оператор позволяет переключить значения на новый Observable
        // Изначально запускается первый Observable без switchMap
        // И в результате всей этой операции у нас вернется другой Observable в switchMap - и это будет наш запрос с новыми токенами
        switchMap((result: RefreshResponseType) => {
          if (result && !result.error && result.accessToken && result.refreshToken) {
            this.authService.setTokens(result.accessToken, result.refreshToken)

            const authReq = req.clone({
              headers: req.headers.set("x-access-token", result.accessToken)
            })

            return next.handle(authReq)
          } else  {
            return throwError(() => new Error('Repeat request error'))
          }
        }),
        catchError((err) => {
// Если мы захотим сделать обновление токенов, но в проце обновления или повторного запроса у нас произойдет ошибка
          // То мы пользователя разлогиним и перенаправим на главную страницу
          this.authService.removeTokens()
          this.authService.removeUserInfo()
          this.router.navigate(['/'])
          return throwError(() => err)
        })
      )
  }
}


