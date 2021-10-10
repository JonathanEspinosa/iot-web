import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { type } from '../../../model/type.model';
import { Group } from '../../../model/group.model';
import { Device } from '../../../model/device.model';
import { GroupTable } from '../../../model/groupTable.model';
import { IotUtil } from 'src/app/util/iot.util';
import { RootService } from '../../../services/root.service';

@Component({
  selector: 'app-create-edit-configuration',
  templateUrl: './create-edit-configuration.component.html',
})
export class CreateEditConfigurationComponent implements OnInit {

  public onClose: Subject<any> = new Subject();
  typeList: type[] = [];
  selectedType: type | undefined;
  isEdit: boolean | undefined;
  typeDisable: boolean = false;
  groupRow: GroupTable = new GroupTable();
  constructor(
    private _bsModalRef: BsModalRef,
    private rootService: RootService,
    public iotUtil: IotUtil,
  ) { }

  ngOnInit(): void {
    this.rootService.getType().subscribe((res: any[]) => {
      this.typeList = this.groupRow?.fathercode
        ? res
        : res.filter(x => Number(x.typecode) === 2);

      if (this.groupRow?.typecode) {
        this.selectedType = this.typeList.find(t => Number(t.typecode) === Number(this.groupRow?.typecode));
        this.typeDisable = this.selectedType ? true : false;
      }

    })
    this.onClose = new Subject();
  }

  validateFields() {
    if (!this.selectedType) {
      alert('Tipo es un campo requerido ');
      return false;
    } else if (!this.groupRow?.name || this.groupRow?.name?.trim() === '') {
      alert('Nombre es un campo requerido ');
      return false;
    }
    return true;
  }

  saveUpdateDevice(groupRow: GroupTable): Promise<any> {
    return new Promise((resolve) => {
      const newDevice: Device = new Device();
      newDevice.devicecode = groupRow.devicecode;
      newDevice.groupcode = groupRow.fathercode;
      newDevice.typecode = this.selectedType?.typecode;
      newDevice.name = groupRow.name?.trim();
      newDevice.status = groupRow.status;
      if (newDevice.devicecode) {
        this.rootService.updateDevice(newDevice).subscribe(res => {
          if (Number(res.error) > 0) {
            alert(res.message);
            resolve(false);
          } else {
            alert("Dispositivo guardado exitosamente!");
            resolve(true);
          }
        })
      } else {
        this.rootService.createDevice(newDevice).subscribe(res => {
          if (Number(res.error) > 0) {
            alert(res.message);
            resolve(false);
          } else {
            alert("Dispositivo guardado exitosamente!");
            resolve(true);
          }
        })
      }
    });
  }

  saveUpdateGroup(groupRow: GroupTable): Promise<any> {
    return new Promise((resolve) => {
      const newGroup: Group = new Group();
      newGroup.groupcode = groupRow.groupcode;
      newGroup.fathercode = groupRow.fathercode;
      newGroup.name = groupRow.name?.trim();
      newGroup.status = groupRow.status;
      if (newGroup.groupcode) {
        this.rootService.updateGroup(newGroup).subscribe(res => {
          if (Number(res.error) > 0) {
            alert(res.message);
            resolve(false);
          } else {
            alert("Grupo guardado exitosamente!");
            resolve(true);
          }
        })
      } else {
        this.rootService.createGroup(newGroup).subscribe(res => {
          if (Number(res.error) > 0) {
            alert(res.message);
            resolve(false);
          } else {
            alert("Grupo guardado exitosamente!");
            resolve(true);
          }
        });
      }
    });
  }


  public onConfirm(groupRow: GroupTable): void {
    let promise: Promise<any> | undefined;
    if (this.validateFields()) {
      switch (this.selectedType?.typecode) {
        case 1:
          promise = this.saveUpdateDevice(groupRow);
          break;
        case 2:
          promise = this.saveUpdateGroup(groupRow);
          break;
        case 3:
          break;
      }
      promise?.then((res) => {
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
