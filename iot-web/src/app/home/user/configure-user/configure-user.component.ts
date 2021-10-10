import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { RootService } from '../../../services/root.service';
import { User } from '../../../model/user.model';
import { IotUtil } from 'src/app/util/iot.util';
import { RolSelect } from 'src/app/model/rolSelect.model';
import { ArrayFunctionsUtil } from 'src/app/util/ArrayFunctionsUtil';

@Component({
  selector: 'app-configure-user',
  templateUrl: './configure-user.component.html',
})
export class ConfigureUserComponent implements OnInit {

  public onClose: Subject<any> = new Subject();
  userRow: User = new User();
  rolList: RolSelect[] = [];
  rolSelectList: RolSelect[] = [];
  arrayUtil: ArrayFunctionsUtil = new ArrayFunctionsUtil();
  constructor(
    private _bsModalRef: BsModalRef,
    private rootService: RootService,
    public iotUtil: IotUtil,
  ) { }

  ngOnInit(): void {
    this.rootService.listAllRolActive().subscribe(res => {
      res.sort(this.arrayUtil.sortBy('name'));
      this.rolSelectList = this.userRow.rolList.filter(rol => rol.status === true);
      const res1: RolSelect[] = [];
      const res2: RolSelect[] = [];
      res.filter((x: any) => {
        if (this.rolSelectList.find(y => y.rolcode === x.rolcode)) {
          res1.push(x);
        } else {
          res2.push(x);
        }
      });
      this.rolList = res1.concat(res2);
    });
  }

  onCheckAll(checkAll: boolean) {
    this.rolList.forEach(item => {
      if (checkAll) {
        this.onRowSelect(item);
      } else {
        this.onRowUnselect(item);
      }
    });
  }

  onRowSelect(row: any) {
    const index = this.userRow.rolList
      .findIndex(value => value.rolcode === (row.data ? row.data.rolcode : row.rolcode));
    if (index !== -1) {
      this.userRow.rolList[index].status = true;
    } else {
      const device = { ...(row.data ? row.data : row) };
      device.status = true;
      this.userRow.rolList.push(device);
    }
  }

  onRowUnselect(row: any) {
    const index = this.userRow.rolList
      .findIndex(value => value.rolcode === (row.data ? row.data.rolcode : row.rolcode));
    this.userRow.rolList[index].status = false;
  }

  saveConfiguration(userRow: User): Promise<any> {
    return new Promise((resolve) => {
      const newUser: User = new User();
      newUser.usercode = userRow.usercode;
      newUser.rolList = userRow.rolList;
      this.rootService.configureUser(newUser).subscribe(res => {
        if (Number(res.error) > 0) {
          alert(res.message);
          resolve(false);
        } else {
          alert("Usuario configurado exitosamente!");
          resolve(true);
        }
      })
    });
  }

  public onConfirm(userRow: User): void {
    this.saveConfiguration(userRow).then((res) => {
      if (res) {
        this.onClose.next(true);
        this._bsModalRef.hide();
      }
    });
  }

  public onCancel(): void {
    this.onClose.next(false);
    this._bsModalRef.hide();
  }

}
