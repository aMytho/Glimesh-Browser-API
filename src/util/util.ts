import { ParamName, QueryParams } from "../customTypes/custom";


/**
 * Checks that a valid param exists in an a param object
 * @param params The params to check
 * @param itemToCheck The item that must be valid
 */
export function hasValidParam(params: QueryParams, itemToCheck: ParamName) {
    if (params[itemToCheck] == undefined) {
        console.log(`Param ${itemToCheck} is required and was not valid.`);
        return false;
    }
    return true;
}