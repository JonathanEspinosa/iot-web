let csCtrl: any | undefined;
export class ArrayFunctionsUtil {

    constructor() {
        csCtrl = this;
    }
    /**
     * Metodo que ordena un Array de Objetos, enviando como parametros los nombres de las propiedades
     * ejemplo sortBy('nombreCompleto'), sortBy('nombreCompleto',{name: 'codigoAreaTrabajo',primer: parseInt,reverse: false})
     * sortBy('nombreZona',{name: 'codigoAreaTrabajo',primer: parseInt,reverse: false},'nombreCompleto')
     * si es una propiedad numerica se envia un objeto con la propiedad 'primer' parseInt.
     * los parametros los toma de arguments
     * @returns {Function}
     */
    sortBy(...args: any | undefined) {
        const fields: any[] = [];
        let field;
        let name;
        let cmp;

        // pre proceso ordenando las opciones
        args.forEach((element: any) => {
            field = element;
            // si la opcion es una variable string guardo para ordenar por nombre
            if (typeof field === 'string') {
                name = field;
                cmp = csCtrl.defaultCmp();
            } else {// caso contrario guardo para buscar por numero
                name = field.name;
                cmp = csCtrl.getCmpFunc(field.primer, field.reverse);
            }
            // opciones para el ordenamiento
            fields.push({
                name: name,
                cmp: cmp
            });
        });

        return function (A: any, B: any) {
            let result;
            fields.forEach(element => {
                field = element;
                name = field.name;
                cmp = field.cmp;

                result = (cmp === 0 || cmp === 1 || cmp === -1) ? csCtrl.defaultCmp(A[name], B[name]) : cmp(A[name], B[name]);
                if (result !== 0) {
                    return;
                }
            });
            return result;
        };
    }

    /**
     * Metodo para ordenar alfabeticamente
     * @param a
     * @param b
     * @returns {number}
     */
    defaultCmp(a: any, b: any) {
        if (a === b) {
            return 0;
        }
        return a.toString().localeCompare(b.toString());
    }

    /**
     * Metodo para ordenar por codigo, numeros.
     * @param primer
     * @param reverse
     * @returns {*}
     */
    getCmpFunc(primer: any, reverse: any) {
        let cmp = csCtrl.defaultCmp();
        if (primer) {
            cmp = function (a: any, b: any) {
                return csCtrl.defaultCmp(primer(a), primer(b));
            };
        }
        if (reverse) {
            return function (a: any, b: any) {
                return -1 * cmp(a, b);
            };
        }
        return cmp;
    }
}
