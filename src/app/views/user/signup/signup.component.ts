import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {LoginResponseType} from "../../../../types/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {SignupResponseType} from "../../../../types/signup-response.type";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent implements OnInit {

  public signupForm = new FormGroup({
    name: new FormControl('', [Validators.pattern('^[А-ЯA-Z][а-яa-z]+\\s*$'), Validators.required]),
    lastName: new FormControl('', [Validators.pattern('^[А-ЯA-Z][а-яa-z]+\\s*$'), Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$'), Validators.required]),
    agree: new FormControl(false, [Validators.required])
  })

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  signup() {
    if (this.signupForm.valid &&
      this.signupForm.value.name &&
      this.signupForm.value.lastName &&
      this.signupForm.value.email &&
      this.signupForm.value.password) {
      this.authService.signup(
        this.signupForm.value.name,
        this.signupForm.value.lastName,
        this.signupForm.value.email,
        this.signupForm.value.password)
        .subscribe({
          next: (data: SignupResponseType) => {
            // Проверяем на то что мы получили данные пользователя
            if (data.error || !data.user) {
              this._snackBar.open('Ошибка при регистрации')
              // Выбрасываем ошибку чтобы код дальше не выполнялся
              throw new Error(data.message ? data.message : 'Error with data on signup')
            }

            // Сразу же после регистрации мы авторизуем пользователя
            if (this.signupForm.value.email && this.signupForm.value.password) {
              this.authService.login(this.signupForm.value.email, this.signupForm.value.password)
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

          },
          error: (error: HttpErrorResponse) => {
            this._snackBar.open(`Ошибка при регистрации`)
            throw new Error(error.error.message)
          }
        })
    }
  }

}
