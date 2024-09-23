import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {QuizListType} from "../../../types/quiz-list.type";
import {AuthService} from "../../core/auth/auth.service";
import {TestResultType} from "../../../types/test-result.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {QuizType} from "../../../types/quiz.type";
import {UserResultType} from "../../../types/user-result.type";
import {PassTestResponseType} from "../../../types/pass-test-response.type";
import {ResultValueType} from "../../../types/result-value.type";

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private http: HttpClient, private authService: AuthService) {
  }


  getTests(): Observable<QuizListType[]> {
    return this.http.get<QuizListType[]>(environment.apiHost + 'tests')
  }

  getUserResults(userId: number): Observable<TestResultType[] | DefaultResponseType> {
    return this.http.get<TestResultType[] | DefaultResponseType>(environment.apiHost + "tests/results?userId=" + userId)
  }

  getQuiz(id: number | string): Observable<QuizType | DefaultResponseType> {
    return this.http.get<QuizType | DefaultResponseType>(environment.apiHost + "tests/" + id)
  }

  passQuiz(id: number | string, userId: string | number, userResult: UserResultType[]): Observable<PassTestResponseType | DefaultResponseType> {
    return this.http.post<PassTestResponseType | DefaultResponseType>(environment.apiHost + "tests/" + id + "/pass", {
      userId: userId,
      results: userResult
    })
  }

  getResult(id: number | string, userId: string | number): Observable<PassTestResponseType | DefaultResponseType> {
    return this.http.get<PassTestResponseType | DefaultResponseType>(environment.apiHost + "tests/" + id + "/result?userId=" + userId)
  }

  getResultDetails(id: number | string, userId: string | number): Observable<ResultValueType | DefaultResponseType> {
    return this.http.get<ResultValueType | DefaultResponseType>(environment.apiHost + "tests/" + id + "/result/details?userId=" + userId)
  }

}
