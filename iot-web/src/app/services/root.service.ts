import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Device } from '../model/device.model';
import { Group } from '../model/group.model';
import { Rol } from '../model/rol.model';
import { User } from '../model/user.model';
const baseUrl = 'http://localhost:8080/v1/iot';

@Injectable({
  providedIn: 'root'
})
export class RootService {

  constructor(private http: HttpClient) { }

  /** SERVICIOS DE GRUPO **/
  groupFindTableByCode(groupcode: number): Observable<any> {
    const path = `${baseUrl}/group/findTableByCode/${groupcode}`;
    return this.http.get(path);
  }
  groupFilterTableByFather(fatherCode: number | undefined): Observable<any> {
    const path = `${baseUrl}/group/filterTableByFather/${fatherCode ? fatherCode : 0}`;
    return this.http.get(path);
  }
  createGroup(obj: Group): Observable<any> {
    const path = `${baseUrl}/group/create`;
    return this.http.post(path, obj);
  }
  updateGroup(obj: Group): Observable<any> {
    const path = `${baseUrl}/group/update`;
    return this.http.post(path, obj);
  }

  /** SERVICIOS DE DISPOSITIVOS **/
  deviceFilterTableByGroupCode(groupCode: number | undefined): Observable<any> {
    const path = `${baseUrl}/device/filterTableByGroupCode/${groupCode ? groupCode : 0}`;
    return this.http.get(path);
  }
  createDevice(obj: Device): Observable<any> {
    const path = `${baseUrl}/device/create`;
    return this.http.post(path, obj);
  }
  updateDevice(obj: Device): Observable<any> {
    const path = `${baseUrl}/device/update`;
    return this.http.post(path, obj);
  }
  listAllDevice(): Observable<any> {
    const path = `${baseUrl}/device/listAllDevice`;
    return this.http.get(path);
  }

  /** SERVICIOS DE USUARIOS **/
  listAllUsers(): Observable<any> {
    const path = `${baseUrl}/user/listAll`;
    return this.http.get(path);
  }
  createUser(obj: User): Observable<any> {
    const path = `${baseUrl}/user/create`;
    return this.http.post(path, obj);
  }
  updateUser(obj: User): Observable<any> {
    const path = `${baseUrl}/user/update`;
    return this.http.post(path, obj);
  }

  /** SERVICIOS DE ROLES **/
  listAllRol(): Observable<any> {
    const path = `${baseUrl}/rol/listAll`;
    return this.http.get(path);
  }
  createRol(obj: Rol): Observable<any> {
    const path = `${baseUrl}/rol/create`;
    return this.http.post(path, obj);
  }
  updateRol(obj: Rol): Observable<any> {
    const path = `${baseUrl}/rol/update`;
    return this.http.post(path, obj);
  }
  listAllRolActive(): Observable<any> {
    const path = `${baseUrl}/rol/listAllActive`;
    return this.http.get(path);
  }

  /** SERVICIOS DE ROLES Y USUARIOS**/
  listRolByUser(usercode: number | undefined): Observable<any> {
    const path = `${baseUrl}/rolUser/listRolByUser/${usercode ? usercode : 0}`;
    return this.http.get(path);
  }
  configureUser(obj: User): Observable<any> {
    const path = `${baseUrl}/rolUser/configure`;
    return this.http.post(path, obj);
  }

  /** SERVICIOS DE TIPO **/
  getType(): Observable<any> {
    const path = `${baseUrl}/type/`;
    return this.http.get(path);
  }

  /** SERVICIOS DE CONSUMO ENERGETICO **/
  getRangeDateByGroup(groupcode: number): Observable<any> {
    const path = `${baseUrl}/energyconsuption/rangeDateByGroup/${groupcode ? groupcode : 0}`;
    return this.http.get(path);
  }
  checkEnergyConsumption(obj: any): Observable<any> {
    const path = `${baseUrl}/energyconsuption/checkEnergyConsumption`;
    return this.http.post(path, obj);
  }

}
