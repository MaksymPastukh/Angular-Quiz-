import {Component, OnInit} from '@angular/core';
import {TestService} from "../../../shared/service/test.service";
import {QuizListType} from "../../../../types/quiz-list.type";
import {AuthService} from "../../../core/auth/auth.service";
import {TestResultType} from "../../../../types/test-result.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-choice',
  templateUrl: './choice.component.html',
  styleUrls: ['./choice.component.scss']
})
export class ChoiceComponent implements OnInit {

  public quizzes: QuizListType[] = []

  constructor(private testService: TestService, private authService: AuthService, private _snackBar: MatSnackBar, private router:Router) {
  }

  ngOnInit(): void {
    this.testService.getTests()
      .subscribe({
        next: (result: QuizListType[]) => {
          this.quizzes = result

          const userInfo = this.authService.getUserInfo()
          if (userInfo) {
            this.testService.getUserResults(userInfo.userId)
              .subscribe((data: TestResultType[] | DefaultResponseType) => {
                if (data) {
                  if ((data as DefaultResponseType).error !== undefined) {
                    //  Если есть ошибка то мы можем использовать _snakbar, перекидывать на главную или вообще разлогиневать
                    this._snackBar.open(`Ошибка в запросе`)
                    throw new Error((data as DefaultResponseType).message)
                  }
                  const testResult: TestResultType[] = data as TestResultType[]

                  if (testResult) {
                    this.quizzes = this.quizzes.map(quiz => {
                      const foundItem: TestResultType | undefined = testResult.find(item => item.testId === quiz.id)
                      if (foundItem) {
                        quiz.result = foundItem.score + "/" + foundItem.total
                      }

                      return quiz
                    })
                  }
                }
              })
          }
        },
        error: (err) => {
          return new Error(err)
        }
      })

    // Может быть такое что второй запрос получит ответ быстрее чем первый, мы должны об этом помнить
    // В дальнейшем разберем такой вариант реализации
  }

  chooseQuiz(id: number) : void {
    this.router.navigate(['/test', id])

  }

}
