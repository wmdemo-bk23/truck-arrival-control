import { Component, Input, OnInit } from '@angular/core';
import { GeneralService } from '@helpers/general-service';
import { END_POINTS } from '@helpers/general-service/utils';
import { NbDialogRef } from '@nebular/theme';
import { AuthService } from 'src/app/auth/auth.service';

const { account, control } = END_POINTS;
@Component({
  selector: 'app-lift-modal',
  templateUrl: './lift-modal.component.html',
})
export class LiftModalComponent implements OnInit {
  @Input() lift: any;
  @Input() lifts: any;
  operators: any[] = [];

  constructor(
    private dialogRef: NbDialogRef<LiftModalComponent>,
    private generalService: GeneralService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getOperators();
  }

  private getOperators() {
    const params = {
      page: 1,
      pageSize: 50,
      isOperator: true,
      isActive: true,
      campus: this.authService.user.campus,
    };
    const collection2 = this.lifts.filter((lift1: any) => lift1 !== this.lift);
    const tOperators = [].concat.apply(
      [],
      collection2.map((lift2: any) => lift2.operators)
    );
    this.generalService
      .paramList$(`${account}/users`, params)
      .subscribe((res) => {
        this.operators = res.results.map((t: any) => {
          const liftOperator = this.lift.operators.find(
            (tt: any) => tt.operator.uid === t.uid
          );
          const disable = tOperators.find(
            (tt: any) => tt.operator.uid === t.uid
          )
            ? true
            : false;
          const isChecked = liftOperator ? true : false;
          return { ...t, isChecked, liftOperator, disable };
        });
      });
  }

  public changeOperator(d: any) {
    if (d.isChecked) {
      const obj = { lift: this.lift?._id, operator: d.uid };
      this.generalService
        .addData$(`${control}/lift-operator/create`, obj)
        .subscribe();
    } else {
      this.generalService
        .deleteUrl$(`${control}/lift-operator/${d.liftOperator._id}/delete`)
        .subscribe();
    }
  }

  public closeModal() {
    this.dialogRef.close();
  }
}
