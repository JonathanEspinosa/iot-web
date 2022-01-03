import { Component, OnInit } from '@angular/core';
import { IotUtil } from '../../util/iot.util';
import { GroupTable } from '../../model/groupTable.model';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CreateEditConfigurationComponent } from './create-edit-configuration/create-edit-configuration.component';
import { ArrayFunctionsUtil } from 'src/app/util/ArrayFunctionsUtil';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Router } from '@angular/router';
import { RootService } from '../../services/root.service';
import { Subscription } from 'rxjs';
import { ConsumptionMeterComponent } from './consumption-meter/consumption-meter.component';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
})
export class GroupComponent implements OnInit {

  groupHead = ['No', 'Nombre', 'Tipo', 'Estado', 'Acción', 'Configuración'];
  groupList: GroupTable[] = [];
  fathercode: number | undefined;
  groupName: string | undefined;
  checked = true;
  arrayUtil: ArrayFunctionsUtil = new ArrayFunctionsUtil();

  powDevice: GroupTable | undefined;

  /* MQTT PARAMETROS */
  subscribeList: Subscription[] = [];
  topicObs1: string = "stat/";
  topicObs2: string = "/RESULT";
  topicAcc1: string = "cmnd/";
  topicAcc2_1: string = "/POWER1";
  topicAcc2_2: string = "/POWER2";

  constructor(
    private modalService: BsModalService,
    private _mqttService: MqttService,
    private router: Router,
    private service: RootService,
    private iotUtil: IotUtil,
  ) { }

  ngOnInit(): void {
    this.chargeGroupTableByFather(undefined);
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  chargeGroupTableByFather(fathercode: number | undefined) {
    this.groupList = [];
    this.powDevice = undefined;
    this.service.groupFilterTableByFather(fathercode)
      .subscribe((res) => {
        let orderGroup: GroupTable[] = res.sort(this.arrayUtil.sortBy('name'));
        if (fathercode) {
          this.service.deviceFilterTableByGroupCode(fathercode)
            .subscribe((devices) => {
              if (devices.length > 0) {
                /* Se liberan los observadores de una antigua tabla de grupos */
                this._mqttService.observables = {};
                this.unSubscribeDevices();
                /* Se juntan los grupos con los dispositivos para crear la tabla de grupos actual */
                orderGroup = orderGroup.concat(devices.sort(this.arrayUtil.sortBy('name')));
                /* Se crean observadores para tener escucha de los dispositivos en vivo */
                orderGroup.filter(t => t.typecode === 1 || t.typecode === 4).forEach(d => {
                  d.topic = this.topicObs1 + d.name + this.topicObs2;
                  d.connect = false;
                  this.initObserveList(d.topic);
                });
                this.powDevice = orderGroup.find(p => p.typecode === 3);
              }
              this.groupList = this.iotUtil.getIncrementalDataKey(orderGroup.filter(g => g.typecode !== 3));
              this.refreshObserveList();
            });
        } else {
          this.groupList = this.iotUtil.getIncrementalDataKey(orderGroup);
        }
      });
  }

  refreshObserveList() {
    if (this.groupList) {
      this.groupList.filter(r => r.typecode === 1 || r.typecode === 4).forEach(groupRow => {
        const topic: string = this.topicAcc1
          .concat(groupRow.name ? groupRow.name : "")
          .concat(this.topicAcc2_1);
        this._mqttService.unsafePublish(topic, '', { qos: 1, retain: true });
        if (groupRow.typecode === 4) {
          const topic: string = this.topicAcc1
            .concat(groupRow.name ? groupRow.name : "")
            .concat(this.topicAcc2_2);
          this._mqttService.unsafePublish(topic, '', { qos: 1, retain: true });
        }
      });
    }
  }

  initObserveList(topic: string) {
    const mqttSubscribe = this._mqttService.observe(topic)
      .subscribe((message: IMqttMessage) => {
        try {
          const sonoff = JSON.parse(message.payload.toString());
          const row = this.groupList.find(r => r.topic === topic && (r.typecode === 1 || r.typecode === 4));
          if (sonoff?.Command && sonoff?.Command === 'Error') {
            alert('El dispositivo "' + row?.name + '" presenta inconvenientes, comuniquese con el administrador.');
          } else {
            if (row) {
              row.auxiliarConnect = true;
              row.connect = true;

              if (sonoff?.POWER || sonoff?.POWER1) {
                if (sonoff.POWER === 'ON' || sonoff.POWER1 === 'ON') {
                  row.onoff = true;
                } else {
                  row.onoff = false;
                }
              } else if (sonoff?.POWER2) {
                if (sonoff.POWER2 === 'ON') {
                  row.onoff2 = true;
                } else {
                  row.onoff2 = false;
                }
              }

            }
          }
        } catch (Ex) {
          alert('Existe un problema con el dispositivo "' + topic + '"  ERROR=' + Ex);
        }
      });
    this.subscribeList.push(mqttSubscribe);
  }

  unSubscribeDevices() {
    if (this.subscribeList.length > 0) {
      this.subscribeList.forEach(s => s.unsubscribe());
    }
    this.subscribeList = [];
  }



  sOnOff(groupRow: GroupTable, releNum: number) {
    const topic: string = this.topicAcc1
      .concat(groupRow.name ? groupRow.name : "")
      .concat(releNum === 1 ? this.topicAcc2_1 : this.topicAcc2_2);
    groupRow.auxiliarConnect = false;
    const onOff = releNum === 1 ? groupRow.onoff : groupRow.onoff2;
    this._mqttService.publish(topic, onOff ? 'ON' : 'OFF', { qos: 1, retain: false })
      .subscribe(() => {
        this.iotUtil.delay(500).then(() => {
          if (groupRow.auxiliarConnect === false) {
            groupRow.connect = false
          }
        });
      });
  }

  back() {
    if (this.fathercode) {
      this.service.groupFindTableByCode(this.fathercode)
        .subscribe((res: GroupTable) => {
          this.chargeGroupTableByFather(res.fathercode);
          if (res.fathercode) {
            this.service.groupFindTableByCode(res.fathercode)
              .subscribe((res: GroupTable) => {
                this.groupName = res.name;
                this.fathercode = res.groupcode;
              })
          } else {
            this.groupName = undefined;
            this.fathercode = res.fathercode;
          }
        })
    }
  }

  insertGroup(group: GroupTable) {
    this.groupName = group.name;
    this.fathercode = group.groupcode;
    this.chargeGroupTableByFather(group.groupcode);
  }

  createConf() {
    const groupRow: GroupTable = new GroupTable();
    groupRow.fathercode = this.fathercode;
    const modal = this.modalService.show(CreateEditConfigurationComponent, {
      keyboard: false,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-md',
      initialState: { isEdit: false, groupRow: groupRow, havePow: this.powDevice ? true : false }
    });
    if ((modal.content)) {
      (modal.content).onClose.subscribe((res: any) => {
        if (res) {
          this.chargeGroupTableByFather(this.fathercode);
        }
      });
    }
  }

  editConf(groupRow: GroupTable) {
    const sendObj = new GroupTable();
    sendObj.fathercode = this.fathercode;
    sendObj.groupcode = groupRow.groupcode;
    sendObj.devicecode = groupRow.devicecode;
    sendObj.name = groupRow.name;
    sendObj.typecode = groupRow.typecode;
    sendObj.status = groupRow.status;
    const modal = this.modalService.show(CreateEditConfigurationComponent, {
      keyboard: false,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-md',
      initialState: { isEdit: true, groupRow: sendObj }
    });
    if ((modal.content)) {
      (modal.content).onClose.subscribe((res: any) => {
        if (res) {
          this.chargeGroupTableByFather(this.fathercode);
        }
      });
    }
  }

  consumption() {
    const sendObj = new GroupTable();
    sendObj.fathercode = this.fathercode;
    sendObj.groupcode = this.powDevice?.groupcode;
    sendObj.devicecode = this.powDevice?.devicecode;
    sendObj.name = this.powDevice?.name;
    sendObj.typecode = this.powDevice?.typecode;
    sendObj.status = this.powDevice?.status;
    this.service.getRangeDateByGroup(sendObj.fathercode || 0).subscribe(res => {

      const minDate = res.minDate;
      const maxDate = res.maxDate;

      const modal = this.modalService.show(ConsumptionMeterComponent, {
        keyboard: false,
        backdrop: 'static',
        class: 'modal-dialog-centered modal-md',
        initialState: {
          groupRow: sendObj,
          existDates: minDate && maxDate,
          minDateValue: new Date(minDate),
          maxDateValue: new Date(maxDate)
        }
      });
      if ((modal.content)) {
        (modal.content).onClose.subscribe((res: any) => {
          if (res) {
            this.chargeGroupTableByFather(this.fathercode);
          }
        });
      }
    });
  }

}
