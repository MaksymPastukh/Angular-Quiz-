import {Component, OnInit} from '@angular/core';
import {TestService} from "../../../shared/service/test.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {UserInfoType} from "../../../../types/user-info.type";
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {PassTestResponseType} from "../../../../types/pass-test-response.type";

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  result: string = ''
  queryParams: string = ''

  constructor(private testService: TestService,
              private activateRoute: ActivatedRoute,
              private authService: AuthService,
              private router: Router
  ) {
  }

  ngOnInit()
    :
    void {

    const userInfo
      :
      UserInfoType | null = this.authService.getUserInfo()
    if (userInfo) {
      this.activateRoute.queryParams.subscribe((params) => {
        if (params['id']) {
          this.queryParams = params['id']
          this.testService.getResult(params['id'], userInfo.userId)
            .subscribe((result: PassTestResponseType | DefaultResponseType) => {
              if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                  throw new Error((result as DefaultResponseType).message)
                }
                this.result = (result as PassTestResponseType).score + "/" + (result as PassTestResponseType).total
              }
            })
        }
      })
    }
  }

  detailsPage() {
    this.router.navigate(['/result-page'], {queryParams: {id: this.queryParams}})
  }
}
