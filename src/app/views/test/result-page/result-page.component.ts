import {Component, OnInit} from '@angular/core';
import {TestService} from "../../../shared/service/test.service";
import {AuthService} from "../../../core/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ResultValueType} from "../../../../types/result-value.type";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'app-result-page',
  templateUrl: './result-page.component.html',
  styleUrls: ['./result-page.component.scss']
})
export class ResultPageComponent implements OnInit {

  user: string | undefined = ''
  resultDetails!: ResultValueType
  currentQuestionIndex: number = 1
  queryParams: string = ''


  constructor(private testService: TestService,
              private authService: AuthService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {}

  ngOnInit(): void {
    const userInfo: UserInfoType | null = this.authService.getUserInfo()
    if (userInfo) {
      this.user = userInfo.fullName
      this.activatedRoute.queryParams.subscribe(params => {
        if (params['id']) {
          this.queryParams = params['id']
          this.testService.getResultDetails(params['id'], userInfo.userId)
            .subscribe((result: ResultValueType | DefaultResponseType) => {
              this.resultDetails = result as ResultValueType

              console.log(this.resultDetails)
            })
        }
      })
    }
  }

  backResultQuiz() {
    this.router.navigate(['result'], {queryParams : {id: this.queryParams}})
  }
}
