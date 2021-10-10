import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { RootService } from '../../../services/root.service';
import { IotUtil } from 'src/app/util/iot.util';
import { Rol } from 'src/app/model/rol.model';
import { DeviceSelect } from 'src/app/model/deviceSelect.model';
import { ArrayFunctionsUtil } from 'src/app/util/ArrayFunctionsUtil';

@Component({
  selector: 'app-create-edit-rol',
  templateUrl: './create-edit-rol.component.html',
})
export class CreateEditRolComponent implements OnInit {

  public onClose: Subject<any> = new Subject();
  isEdit: boolean | undefined;
  rolRow: Rol = new Rol();
  deviceList: DeviceSelect[] = [];
  deviceSelectList: DeviceSelect[] = [];
  arrayUtil: ArrayFunctionsUtil = new ArrayFunctionsUtil();

  constructor(
    private _bsModalRef: BsModalRef,
    private rootService: RootService,
    public iotUtil: IotUtil,
  ) { }

  ngOnInit(): void {
    this.rootService.listAllDevice().subscribe(res => {
      res.sort(this.arrayUtil.sortBy('groupname'));
      this.deviceSelectList = this.rolRow.deviceList.filter(device => device.status === true);
      const res1: DeviceSelect[] = [];
      const res2: DeviceSelect[] = [];
      res.filter((x: any) => {
        if (this.deviceSelectList.find(y => y.devicecode === x.devicecode)) {
          res1.push(x);
        } else {
          res2.push(x);
        }
      });
      this.deviceList = res1.concat(res2);
    });
  }

  onCheckAll(checkAll: boolean) {
    this.deviceList.forEach(item => {
      if (checkAll) {
        this.onRowSelect(item);
      } else {
        this.onRowUnselect(item);
      }
    });
  }

  onRowSelect(row: any) {
    const index = this.rolRow.deviceList
      .findIndex(value => value.devicecode === (row.data ? row.data.devicecode : row.devicecode));
    if (index !== -1) {
      this.rolRow.deviceList[index].status = true;
    } else {
      const device = { ...(row.data ? row.data : row) };
      device.status = true;
      this.rolRow.deviceList.push(device);
    }
  }

  onRowUnselect(row: any) {
    const index = this.rolRow.deviceList
      .findIndex(value => value.devicecode === (row.data ? row.data.devicecode : row.devicecode));
    this.rolRow.deviceList[index].status = false;
  }

  validateFields() {
    if (!this.rolRow?.name || this.rolRow?.name?.trim() === '') {
      alert('Nombre es un campo requerido');
      return false;
    } else if (!this.rolRow?.description || this.rolRow?.description?.trim() === '') {
      alert('Descripción es un campo requerido');
      return false;
    } else if (!this.rolRow?.deviceList?.find(d => d.status)) {
      alert('Seleccione al menos un dispositivo de la lista');
      return false;
    }
    return true;
  }

  saveUpdateRol(rolRow: Rol): Promise<any> {
    return new Promise((resolve) => {
      const newRol: Rol = new Rol();
      newRol.rolcode = rolRow.rolcode;
      newRol.name = rolRow.name?.trim();
      newRol.description = rolRow.description?.trim();
      newRol.status = rolRow.status;
      newRol.deviceList = rolRow.deviceList;
      if (newRol.rolcode) {
        this.rootService.updateRol(newRol).subscribe(res => {
          if (Number(res.error) > 0) {
            alert(res.message);
            resolve(false);
          } else {
            alert("Rol guardado exitosamente!");
            resolve(true);
          }
        })
      } else {
        this.rootService.createRol(newRol).subscribe(res => {
          if (Number(res.error) > 0) {
            alert(res.message);
            resolve(false);
          } else {
            alert("Rol guardado exitosamente!");
            resolve(true);
          }
        })
      }
    });
  }

  public onConfirm(rolRow: Rol): void {
    if (this.validateFields()) {
      this.saveUpdateRol(rolRow).then((res) => {
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
