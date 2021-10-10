import { DeviceSelect } from "./deviceSelect.model";

export class Rol {
    rowIndex: number | undefined;
    rolcode: number | undefined;
    name: string | undefined;
    description: string | undefined;
    status: boolean | undefined;
    deviceList: DeviceSelect[] = [];
}
