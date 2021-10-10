import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Rol } from 'src/app/model/rol.model';
import { RootService } from 'src/app/services/root.service';
import { ArrayFunctionsUtil } from 'src/app/util/ArrayFunctionsUtil';
import { IotUtil } from 'src/app/util/iot.util';
import { CreateEditRolComponent } from './create-edit-rol/create-edit-rol.component';

@Component({
  selector: 'app-rol',
  templateUrl: './rol.component.html',
})
export class RolComponent implements OnInit {

  rolHead = ['No', 'Nombre', 'Descripción', 'Estado', 'Configuración'];
  rolList: Rol[] = [];
  arrayUtil: ArrayFunctionsUtil = new ArrayFunctionsUtil();
  constructor(
    private router: Router,
    private modalService: BsModalService,
    private service: RootService,
    private iotUtil: IotUtil,
  ) { }

  ngOnInit(): void {
    this.chargeRol();
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  chargeRol() {
    this.rolList = [];
    this.service.listAllRol()
      .subscribe((res) => {
        this.rolList = this.iotUtil.getIncrementalDataKey(res.sort(this.arrayUtil.sortBy('name')));
      });
  }

  createRol() {
    const modal = this.modalService.show(CreateEditRolComponent, {
      keyboard: false,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-lg',
      initialState: { isEdit: false }
    });
    if ((modal.content)) {
      (modal.content).onClose.subscribe((res: any) => {
        if (res) {
          this.chargeRol();
        }
      });
    }
  }

  editRol(rolRow: Rol) {
    const sendObj = new Rol();
    sendObj.rolcode = rolRow.rolcode;
    sendObj.name = rolRow.name;
    sendObj.description = rolRow.description;
    sendObj.status = rolRow.status;
    sendObj.deviceList = rolRow.deviceList;
    const modal = this.modalService.show(CreateEditRolComponent, {
      keyboard: false,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-lg',
      initialState: { isEdit: true, rolRow: sendObj }
    });
    if ((modal.content)) {
      (modal.content).onClose.subscribe((res: any) => {
        if (res) {
          this.chargeRol();
        }
      });
    }
  }

}
