import { RolSelect } from "./rolSelect.model";

export class User {
    rowIndex: number | undefined;
    usercode: number | undefined;
    username: string | undefined;
    password: string | undefined;
    name: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    status: boolean | undefined;
    rolList: RolSelect[] = [];

}