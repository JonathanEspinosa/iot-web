import { Injectable } from "@angular/core";

/**
 * @author jespinosa
 */
@Injectable({
    providedIn: 'root'
})
export class IotUtil {

    statesLower = [
        { value: true, label: 'Activo' },
        { value: false, label: 'Inactivo' }
    ];

    /* Method for sleep */
    async delay(ms: number) {
        await new Promise(resolve => setTimeout(() => resolve(1), ms)).then(() => console.log("sleep" + ms));
    }

    /* Method for get incremental numeric data key column to array */
    getIncrementalDataKey(array: any[]): any[] {
        let rowIndex = 1;
        array.forEach(element => {
            element.rowIndex = Number(rowIndex);
            rowIndex++;
        });
        return array.sort((a, b) => {
            if (a.last_nom < b.last_nom) {
                return -1;
            }
            if (a.last_nom > b.last_nom) {
                return 1;
            }
            return 0;
        }
        );

    }

}
