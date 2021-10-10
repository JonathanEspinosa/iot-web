import { Wifi } from "./wifi.model";

export class Sonoff {
    Time: string | undefined;
    Uptime: string | undefined;
    UptimeSec: string | undefined;
    Heap: string | undefined;
    SleepMode: string | undefined;
    Sleep: string | undefined;
    LoadAvg: string | undefined;
    MqttCount: string | undefined;
    POWER: string | undefined;
    Wifi: Wifi | undefined;
}