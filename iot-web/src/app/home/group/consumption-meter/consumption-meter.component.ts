import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, Subscriber, Subscription, interval } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { type } from '../../../model/type.model';
import { Group } from '../../../model/group.model';
import { Device } from '../../../model/device.model';
import { GroupTable } from '../../../model/groupTable.model';
import { IotUtil } from 'src/app/util/iot.util';
import { RootService } from '../../../services/root.service';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Calendar } from 'primeng/calendar';
import { GraphicComponent } from './graphic/graphic.component';
import { EnergyConsuption } from 'src/app/model/energyConsuption.model';

@Component({
  selector: 'app-consumption-meter',
  templateUrl: './consumption-meter.component.html',
})
export class ConsumptionMeterComponent implements OnInit {
  @ViewChild("calendar") calendar: Calendar | undefined;
  @ViewChild(GraphicComponent) graphicComponent?: GraphicComponent;

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


  onSelect() {
    if (this.calendar && this.rangeDates && this.rangeDates[1]) { // If second date is selected
      this.calendar.hideOverlay();
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
        .subscribe((res: EnergyConsuption[]) => {
          this.updateGraphic(res);
          this.energy = Number(res.reduce((acc, r) => acc + Number(r.energyday), 0)?.toFixed(2));
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

  updateGraphic(registers: any[]) {
    if (this.graphicComponent) {
      this.setDimension(this.graphicComponent, registers);
      this.graphicComponent.lineChartData.datasets[0].label = this.groupRow.name;
      this.graphicComponent.lineChartData.datasets[0].data
        = registers.reduce((acc: any[], r) => acc.concat(r.energyday?.toFixed(2)), []);
      this.graphicComponent.lineChartData.labels
        = registers.reduce((acc: any[], r) => acc.concat(r.date), []);
      this.graphicComponent.chart?.update();
    }
  }

  setDimension(graphicComponent: GraphicComponent, registers: EnergyConsuption[]) {
    graphicComponent.rowArray = [];
    graphicComponent.colArray = [];
    let registerNumber = 0;
    let isLastAdd = false;
    registers.forEach((r, index) => {
      r.energyday = Number(r.energyday?.toFixed(2));
      graphicComponent.colArray.push(r);
      if (registerNumber + 1 === 6) {
        graphicComponent.rowArray.push(graphicComponent.colArray);
        registerNumber = 0;
        graphicComponent.colArray = [];
        if (index + 1 === registers.length) {
          isLastAdd = true;
        }
      } else {
        registerNumber++;
      }
      if (index + 1 === registers.length && !isLastAdd) {
        graphicComponent.rowArray.push(graphicComponent.colArray);
      }
    });
  }
}
