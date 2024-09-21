import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {HttpErrorResponse} from "@angular/common/http";
import {LoginResponseType} from "../../../../types/login-response.type";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$'), Validators.required])
  })

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  login() {
    if (this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (data: LoginResponseType) => {
            // Проверяем на то что мы получили данные пользователя
            if (data.error || !data.accessToken || !data.refreshToken || !data.fullName || !data.userId) {
              this._snackBar.open('Ошибка при авторизации')
              // Выбрасываем ошибку чтобы код дальше не выполнялся
              throw new Error(data.message ? data.message : 'Error with data on login')
            }

            // Если данные есть и ошибки нету, то перенаправляем человека на след страницу
            this.router.navigate(['/choice'])

          },
          error: (error: HttpErrorResponse) => {
            this._snackBar.open(`Ошибка при авторизации : ${error.error.message}`)
            this.router.navigate(['/'])
            throw new Error(error.error.message)
          }
        })
    }
  }

}
