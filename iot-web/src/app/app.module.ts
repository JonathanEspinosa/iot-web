import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { GroupComponent } from './home/group/group.component';
import { RolComponent } from './home/rol/rol.component';
import { UserComponent } from './home/user/user.component';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CreateEditConfigurationComponent } from './home/group/create-edit-configuration/create-edit-configuration.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';

import { IMqttServiceOptions, MqttModule } from "ngx-mqtt";
import { environment as env } from '../environments/environment';
import { EventMqttService } from './services/event.mqtt.service';
import { CreateEditUserComponent } from './home/user/create-edit-user/create-edit-user.component';
import { RootService } from './services/root.service';
import { CreateEditRolComponent } from './home/rol/create-edit-rol/create-edit-rol.component';
import { TableModule } from 'primeng/table';
import { NumberDirective } from './directive/number.directive';
import { ConfigureUserComponent } from './home/user/configure-user/configure-user.component';
import { ConsumptionMeterComponent } from './home/group/consumption-meter/consumption-meter.component';
import { CalendarModule } from 'primeng/calendar';
import { GraphicComponent } from './home/group/consumption-meter/graphic/graphic.component';
import { NgChartsModule } from 'ng2-charts';

const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: env.mqtt.server,
  port: env.mqtt.port,
  path: '/mqtt'
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GroupComponent,
    RolComponent,
    UserComponent,
    CreateEditConfigurationComponent,
    CreateEditUserComponent,
    CreateEditRolComponent,
    ConfigureUserComponent,
    NumberDirective,
    ConsumptionMeterComponent,
    GraphicComponent
  ],
  imports: [
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    BrowserModule,
    HttpClientModule,
    RadioButtonModule,
    NgChartsModule,
    DropdownModule,
    CalendarModule,
    InputSwitchModule,
    AppRoutingModule,
    TooltipModule.forRoot(),
    BrowserAnimationsModule,
    FormsModule,
    TableModule,
  ],
  providers: [RootService, BsModalService, EventMqttService],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]

})
export class AppModule { }
