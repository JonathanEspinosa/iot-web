import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { RootService } from '../../../services/root.service';
import { User } from '../../../model/user.model';
import { IotUtil } from 'src/app/util/iot.util';

@Component({
  selector: 'app-create-edit-user',
  templateUrl: './create-edit-user.component.html',
})
export class CreateEditUserComponent implements OnInit {

  public onClose: Subject<any> = new Subject();
  isEdit: boolean | undefined;
  userRow: User = new User();
  constructor(
    private _bsModalRef: BsModalRef,
    private rootService: RootService,
    public iotUtil: IotUtil,
  ) {
  }

  ngOnInit(): void {
  }

  validateFields() {
    if (!this.userRow?.username || this.userRow?.username?.trim() === '') {
      alert('Nick es un campo requerido ');
      return false;
    } else if (!this.userRow?.password || this.userRow?.password?.trim() === '') {
      alert('Contraseña es un campo requerido ');
      return false;
    } else if (!this.userRow?.name || this.userRow?.name?.trim() === '') {
      alert('Nombre es un campo requerido ');
      return false;
    } else if (!this.userRow?.email || this.userRow?.email?.trim() === '') {
      alert('Correo es un campo requerido ');
      return false;
    } else if (!this.userRow?.phone || this.userRow?.phone?.trim() === '') {
      alert('Teléfono es un campo requerido ');
      return false;
    }
    return true;
  }

  saveUpdateUser(userRow: User): Promise<any> {
    return new Promise((resolve) => {
      const newUser: User = new User();
      newUser.usercode = userRow.usercode;
      newUser.username = userRow.username;
      newUser.password = userRow.password?.trim();
      newUser.name = userRow.name?.trim();
      newUser.email = userRow.email?.trim();
      newUser.phone = userRow.phone?.trim();
      newUser.status = userRow.status;
      if (newUser.usercode) {
        this.rootService.updateUser(newUser).subscribe(res => {
          if (Number(res.error) > 0) {
            alert(res.message);
            resolve(false);
          } else {
            alert("Usuario guardado exitosamente!");
            resolve(true);
          }
        })
      } else {
        this.rootService.createUser(newUser).subscribe(res => {
          if (Number(res.error) > 0) {
            alert(res.message);
            resolve(false);
          } else {
            alert("Usuario guardado exitosamente!");
            resolve(true);
          }
        })
      }
    });
  }

  public onConfirm(userRow: User): void {
    if (this.validateFields()) {
      this.saveUpdateUser(userRow).then((res) => {
        if (res) {
          this.onClose.next(true);
          this._bsModalRef.hide();
        }
      });
    }
  }

  public onCancel(): void {
    this.onClose.next(false);
    this._bsModalRef.hide();
  }

}
