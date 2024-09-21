import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {LogoutResponseType} from "../../../../types/logout-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  //Header имеет два варианта когда мы можем проверять авторизацию
  // Первый вариант - это когда мы заходим на страницу (Когда создается этот компонент)
  // Вторая ситуация - этого когда изменяется это состояние уже когда существует компонент

  public userInfo: UserInfoType | null = null

  constructor(private authService: AuthService, private _snackBar: MatSnackBar, private router: Router) {
    // Первый вариант
    if (this.authService.getLoggedIn()) {
      // если пользователь авторизованный ты мы получаем инфо
      this.userInfo = this.authService.getUserInfo()
    }
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: (value: LogoutResponseType) => {
          if (value && !value.error) {
            this.authService.removeTokens()
            this.authService.removeUserInfo()
            this._snackBar.open(`Вы вышли из системы`)
            this.router.navigate(['/'])
          } else  {
            this._snackBar.open(`Ошибка при выходе из аккаунта`)
          }
        },
        error: (error: HttpErrorResponse) => {
          this._snackBar.open(`Ошибка при выходе из аккаунта`)
        }
      })
  }

  ngOnInit(): void {
    // Второй вариант уже при использовании Subject
    this.authService.isLogged$
      .subscribe((isLoggedIn) => {
        this.userInfo = isLoggedIn ? this.authService.getUserInfo() : null
      })
  }

}
