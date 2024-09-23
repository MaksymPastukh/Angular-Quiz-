import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {LoginResponseType} from "../../../types/login-response.type";
import {Observable, Subject, tap} from "rxjs";
import {UserInfoType} from "../../../types/user-info.type";
import {LogoutResponseType} from "../../../types/logout-response.type";
import {SignupResponseType} from "../../../types/signup-response.type";
import {RefreshResponseType} from "../../../types/refresh-response.type";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Переменные для хранения названия ключей
  public accessTokenKey: string = "accessToken"
  private refreshTokenKey: string = "refreshToken"
  private userInfoKey: string = "userInfo"

  // Для того что бы использовать состояние в других компонентах. Сохраняем состояние в Subject
  public isLogged$: Subject<boolean> = new Subject<boolean>()
  // Переменная для хранения актуального состояния авторизации пользователя в моменте
  private isLogged: boolean = false

  constructor(private http: HttpClient) {
    // Проверяем авторизован пользователь или нет при открытии страницы
    // !! - Переводим строку в boolean значение и устанавливаем значение в переменную для хранения актуального состояния
    this.isLogged = !!localStorage.getItem(this.accessTokenKey)
  }

  login(email: string, password: string): Observable<LoginResponseType> {
    // Отправляем данные на бекэнд
    return this.http.post<LoginResponseType>(environment.apiHost + 'login', {
      email,
      password
    })
      .pipe(
        tap((data: LoginResponseType) => {
          if (data.fullName && data.userId && data.accessToken && data.refreshToken) {
            this.setUserInfo({
              fullName: data.fullName,
              userId: data.userId,
            })
            this.setTokens(data.accessToken, data.refreshToken)
          }
        })
      )
  }

  signup(name: string, lastName: string, email: string, password: string): Observable<SignupResponseType> {
    // Отправляем данные на бекэнд
    return this.http.post<SignupResponseType>(environment.apiHost + 'signup', {
      name,
      lastName,
      email,
      password
    })
  }

  refresh(): Observable<RefreshResponseType> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey)

    return this.http.post<RefreshResponseType>(environment.apiHost + 'refresh', {
      refreshToken
    })
  }

  logout(): Observable<LogoutResponseType> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey)
    return this.http.post<LogoutResponseType>(environment.apiHost + 'logout', {
      refreshToken
    })
  }

  // Функция для возврата состояния с сервиса
  public getLoggedIn(): boolean {
    return this.isLogged
  }

  // Метод записи токенов в локальное хранилище
  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken)
    localStorage.setItem(this.refreshTokenKey, refreshToken)
    // Когда мы устанавливаем токены во время логина мы меняем состояние
    this.isLogged = true
    // Сохраняем состояние в Subject
    this.isLogged$.next(true)
  }

  // Метод удаления токенов с локального хранилища
  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey)
    localStorage.removeItem(this.refreshTokenKey)
    // Когда мы удаляем токены во время выхода с аккаунта мы меняем состояние
    this.isLogged = false
    // Сохраняем состояние в Subject
    this.isLogged$.next(false)
  }

// Метод для получения токенов с локального хранилища в объекте
  getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey),
    }
  }


  // Метод записи информации о пользователе в локальное хранилище
  public setUserInfo(info: UserInfoType): void {
    localStorage.setItem(this.userInfoKey, JSON.stringify(info))
  }

  // Метод удаления информации о пользователе в локальное хранилище
  public removeUserInfo(): void {
    localStorage.removeItem(this.userInfoKey)
  }

  // Метод получения информации о пользователе с локального хранилища
  public getUserInfo(): UserInfoType | null {
    let userInfo: string | null = localStorage.getItem(this.userInfoKey)

    if (userInfo) {
      return JSON.parse(userInfo)
    }
    return null
  }

}
