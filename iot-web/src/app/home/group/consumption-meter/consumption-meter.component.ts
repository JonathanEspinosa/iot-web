import { Component, OnInit } from '@angular/core';
import { Observable, Subject, Subscriber, Subscription, interval } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { type } from '../../../model/type.model';
import { Group } from '../../../model/group.model';
import { Device } from '../../../model/device.model';
import { GroupTable } from '../../../model/groupTable.model';
import { IotUtil } from 'src/app/util/iot.util';
import { RootService } from '../../../services/root.service';
import { IMqttMessage, MqttService } from 'ngx-mqtt';

@Component({
  selector: 'app-consumption-meter',
  templateUrl: './consumption-meter.component.html',
})
export class ConsumptionMeterComponent implements OnInit {

  public onClose: Subject<any> = new Subject();
  energy: number = 0;
  power: number = 0;
  intensity: number = 0;
  voltage: number = 0;
  rangeDates: Date[] | undefined;
  groupRow: GroupTable = new GroupTable();
  subscribeList: Subscription[] = [];
  minDateValue: Date = new Date();
  maxDateValue: Date = new Date();
  existDates: boolean | undefined;
  constructor(
    private _bsModalRef: BsModalRef,
    private _mqttService: MqttService,
    private rootService: RootService,
    public iotUtil: IotUtil,
  ) { }

  ngOnInit(): void {
    this.onClose = new Subject();
    if (this.groupRow?.name) {
      this.initObserve("stat/" + this.groupRow?.name + "/STATUS8");
      this.initLoop("cmnd/" + this.groupRow?.name + "/Status");
    }

  }

  publish(topic: string) {
    this.groupRow.auxiliarConnect = false;
    this._mqttService.publish(topic, '8', { qos: 1, retain: false })
      .subscribe(() => {
        this.iotUtil.delay(500).then(() => {
          if (this.groupRow.auxiliarConnect === false) {
            this.groupRow.connect = false
          }
        });
      });
  }

  initLoop(topic: string) {
    this.publish(topic);
    const subscribe = interval(3000).subscribe(() => {
      this.publish(topic);
    });
    this.subscribeList.push(subscribe);
  }
  initObserve(topic: string) {
    const subscribe = this._mqttService.observe(topic)
      .subscribe((message: IMqttMessage) => {
        try {
          const pow = JSON.parse(message.payload.toString());
          if (pow?.StatusSNS) {
            this.groupRow.auxiliarConnect = true;
            this.groupRow.connect = true;
            this.power = pow.StatusSNS.ENERGY.Power;
            this.intensity = pow.StatusSNS.ENERGY.Current;
            this.voltage = pow.StatusSNS.ENERGY.Voltage;
          }
        } catch (Ex) {
          alert('Existe un problema con el dispositivo "' + topic + '"  ERROR=' + Ex);
        }
      });
    this.subscribeList.push(subscribe);
  }


  validateFields() {
    if (!this.rangeDates || !this.rangeDates[0] || !this.rangeDates[1]) {
      alert('Seleccione un rango de fecha');
      return false;
    }
    return true;
  }

  consult() {
    if (this.validateFields() && this.rangeDates) {
      //  this.rangeDates || !this.rangeDates[0] || !this.rangeDates[1]) {
      this.rootService.checkEnergyConsumption({
        "groupcode": this.groupRow.fathercode,
        "minDate": this.rangeDates[0].toISOString().replace("Z", ""),
        "maxDate": this.rangeDates[1].toISOString().replace("Z", "")
      })
        .subscribe(res => {
          this.energy = res.energy
        });
    }
  }

  saveUpdateDevice(groupRow: GroupTable): Promise<any> {
    return new Promise((resolve) => {
      this.rootService.updateDevice(groupRow).subscribe(res => {
        if (Number(res.error) > 0) {
          alert(res.message);
          resolve(false);
        } else {
          alert("Dispositivo guardado exitosamente!");
          resolve(true);
        }
      })
    });
  }

  public onConfirm(groupRow: GroupTable): void {
    if (!this.groupRow?.name || this.groupRow?.name?.trim() === '') {
      alert('Nombre es un campo requerido ');
    } else {
      this.saveUpdateDevice(groupRow).then((res) => {
        if (res) {
          this.unSubscribe();
          this.onClose.next(true);
          this._bsModalRef.hide();
        }
      });
    }
  }

  public onCancel(): void {
    this.unSubscribe();
    this.onClose.next(false);
    this._bsModalRef.hide();
  }


  unSubscribe() {
    if (this.subscribeList.length > 0) {
      this.subscribeList.forEach(s => s.unsubscribe());
    }
    this.subscribeList = [];
  }

}
