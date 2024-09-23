import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {TestService} from "../../../shared/service/test.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {QuizQuestionType, QuizType} from "../../../../types/quiz.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActionTestType} from "../../../../types/action-test.type";
import {UserResultType} from "../../../../types/user-result.type";
import {AuthService} from "../../../core/auth/auth.service";
import {PassTestResponseType} from "../../../../types/pass-test-response.type";
import {UserInfoType} from "../../../../types/user-info.type";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  quiz!: QuizType
  timerSeconds: number = 59
  private interval: number = 0
  currentQuestionIndex: number = 1
  chosenAnswerId: number | null = null
  userResult: UserResultType[] = []
  actionTestType = ActionTestType


  constructor(private activateRoute: ActivatedRoute,
              private authService: AuthService,
              private testService: TestService,
              private _snackBar: MatSnackBar,
              private router: Router) {
  }

  ngOnInit(): void {
    this.activateRoute.params.subscribe((params: Params) => {
      if (params['id']) {
        this.testService.getQuiz(params['id'])
          .subscribe({
            next: (result: QuizType | DefaultResponseType) => {
              if ((result as DefaultResponseType).error !== undefined) {
                this._snackBar.open('Что-то пошло не так, обновите страницу')
                this.router.navigate(['/test'])
                throw new Error((result as DefaultResponseType).message)
              }

              this.quiz = result as QuizType

              this.startQuiz()
            },
            error: (error) => {
              this._snackBar.open('Произошла ошибка, обновите страницу')
              this.router.navigate(['/test'])
              throw new Error(error.error.message)
            }
          })
      }
    })
  }

  get activeQuiz() {
    return this.quiz.questions[this.currentQuestionIndex - 1]
  }

  startQuiz() {
    // View Quiz

    this.interval = window.setInterval(() => {
      this.timerSeconds--
      if (this.timerSeconds === 0) {
        clearInterval(this.interval)
        this.complete()
      }
    }, 1000)
  }

  complete(): void {
    const userInfo: UserInfoType | null = this.authService.getUserInfo()
    if (userInfo) {

      this.testService.passQuiz(this.quiz.id, userInfo.userId, this.userResult)
        .subscribe((result: DefaultResponseType | PassTestResponseType) => {
          if (result) {
            if ((result as DefaultResponseType).error !== undefined) {
              throw new Error((result as DefaultResponseType).message)
            }

            this.router.navigate(['/result'], {queryParams: {id: this.quiz.id}})
          }
        })
    }
  }

  move(action: ActionTestType): void {

    // Проверяем есть ли уже в массиве обект для такого questionId
    const existingResult: UserResultType | undefined = this.userResult.find((item: UserResultType): boolean => {
      return item.questionId === this.activeQuiz.id
    })

    if (this.chosenAnswerId) {
      if (existingResult) {
        existingResult.chosenAnswerId = this.chosenAnswerId
      } else {
        this.userResult.push({
          questionId: this.activeQuiz.id,
          chosenAnswerId: this.chosenAnswerId
        })
      }
    }

    // sessionStorage.setItem(
    //   this.KEY_RESULT_QUIZ,
    //   JSON.stringify(this.userResult)
    // )

    // Пагинация
    if (action === ActionTestType.next || action === ActionTestType.pass) {
      if (this.currentQuestionIndex === this.quiz.questions.length) {
        clearInterval(this.interval)
        this.complete()
        return
      }
      this.currentQuestionIndex++
    } else {
      this.currentQuestionIndex--
    }


    const currentResult: UserResultType | undefined = this.userResult.find(item => {
      return item.questionId === this.activeQuiz.id
    })

    if (currentResult) {
      this.chosenAnswerId = currentResult.chosenAnswerId
    }


  }
}
