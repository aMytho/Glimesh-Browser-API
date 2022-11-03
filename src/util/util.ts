import { ParamName } from "../customTypes/custom";


/**
 * Checks that a valid param exists in an a param array
 * @param params The params to check
 * @param itemToCheck The item that must be valid
 */
export function hasValidParam(itemToCheck: ParamName, params: any, index: number = 0) {
    console.log(itemToCheck, params, index)
    if (params[index][itemToCheck] == undefined) {
        console.error(`Param ${itemToCheck} is required and was not valid.`);
        return false;
    }
    return true;
}