import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RolSelect } from 'src/app/model/rolSelect.model';
import { ArrayFunctionsUtil } from 'src/app/util/ArrayFunctionsUtil';
import { IotUtil } from 'src/app/util/iot.util';
import { User } from '../../model/user.model';
import { RootService } from '../../services/root.service';
import { ConfigureUserComponent } from './configure-user/configure-user.component';
import { CreateEditUserComponent } from './create-edit-user/create-edit-user.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent implements OnInit {

  userHead = ['No', 'Nick', 'Nombre', 'Correo', 'Teléfono', 'Estado', 'Acción', 'Configuración'];
  userList: User[] = [];
  arrayUtil: ArrayFunctionsUtil = new ArrayFunctionsUtil();
  constructor(
    private router: Router,
    private modalService: BsModalService,
    private rootService: RootService,
    private iotUtil: IotUtil,
  ) { }

  ngOnInit(): void {
    this.chargeUsers();
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  chargeUsers() {
    this.userList = [];
    this.rootService.listAllUsers()
      .subscribe((res) => {
        this.userList = this.iotUtil.getIncrementalDataKey(res.sort(this.arrayUtil.sortBy('username')));
      });
  }

  createUser() {
    const modal = this.modalService.show(CreateEditUserComponent, {
      keyboard: false,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-md',
      initialState: { isEdit: false }
    });
    if ((modal.content)) {
      (modal.content).onClose.subscribe((res: any) => {
        if (res) {
          this.chargeUsers();
        }
      });
    }
  }

  editUser(userRow: User) {
    const sendObj = new User();
    sendObj.usercode = userRow.usercode;
    sendObj.username = userRow.username;
    sendObj.password = userRow.password;
    sendObj.name = userRow.name;
    sendObj.email = userRow.email;
    sendObj.phone = userRow.phone;
    sendObj.status = userRow.status;
    const modal = this.modalService.show(CreateEditUserComponent, {
      keyboard: false,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-md',
      initialState: { isEdit: true, userRow: sendObj }
    });
    if ((modal.content)) {
      (modal.content).onClose.subscribe((res: any) => {
        if (res) {
          this.chargeUsers();
        }
      });
    }
  }

  configureUser(userRow: User) {
    const sendObj = new User();
    sendObj.usercode = userRow.usercode;
    sendObj.username = userRow.username;
    sendObj.status = userRow.status;
    this.rootService.listRolByUser(sendObj.usercode).subscribe((res: RolSelect[]) => {
      sendObj.rolList = res;
      const modal = this.modalService.show(ConfigureUserComponent, {
        keyboard: false,
        backdrop: 'static',
        class: 'modal-dialog-centered modal-lg',
        initialState: { userRow: sendObj }
      });
      if ((modal.content)) {
        (modal.content).onClose.subscribe((res: any) => {
          if (res) {
            this.chargeUsers();
          }
        });
      }
    });
  }
}
