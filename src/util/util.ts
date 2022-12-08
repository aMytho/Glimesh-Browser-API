import { ParamName, PickParam } from "../customTypes/custom";

/**
 * Checks that a valid param exists in an a param array
 * @param params The params to check
 * @param itemToCheck The item that must be valid
 */
export function hasValidParam(itemToCheck: ParamName, params: any, index: number = 0) {
    try {
        if (params[index][itemToCheck] == undefined) {
            console.error(`Param ${itemToCheck} is required and was not valid.`);
            return false;
        }
        return true;
    } catch(e) {
        console.log(e);
        return false;
    }
}

/**
 * Checks that multiple valid params exist
 * @param itemsToCheck The items that must be valid
 * @param params The params to check
 * @param indexes The location of the param items
 */
export function hasValidParams(itemsToCheck: ParamName[], params: any[], indexes: number[]) {
    for (const [index, item] of itemsToCheck.entries()) {
        let valid = hasValidParam(item, params, indexes[index], );
        if (!valid) return false;
    }
    return true
}

/**
 * Returns one param form a list of possible params
 * @param choices The params to choose
 * @param params The params passed from the user
 */
export function pickParam(choices: ParamName[], params: any, index: number = 0): PickParam | null {
    // Loop through all choices.
    for (const choice of choices) {
        try {
            // See if the param exists
            if (params[index][choice] != undefined) {
                //If it is a string it needs additional quotes for formatting
                if (isString(choice)) {
                    return {
                        param: choice,
                        val: `"${params[index][choice]}"`
                    }
                } else {
                    return {
                        param: choice,
                        val: params[index][choice]
                    }
                }
            }
        } catch(e) {}
    }

    console.warn(`No param was found. This will prevent the query from running. Required: ${choices.toString()}, your params: `, params)
    //If no param is found return null 
    return null;
}

/**
 * Combines a group of params if they exist.
 * @param choices The choices to look for
 * @param params The params to search through
 * @returns The param string
 */
export function combineParams(choices: ParamName[], params: any): string {
    let paramString: string = "";
    for (const choice of choices) {
        for (let [index, value] of params.entries()) {
            if (params[index][choice] != undefined) {
                if (isString(choice)) {
                    paramString += `${choice}: "${params[index][choice]}",`
                } else {
                    paramString += `${choice}: ${params[index][choice]},` 
                }
            }
        }
    }
    return paramString;
}

/**
 * Checks if a param needs string formatting in a graphql query
 * @param param The param to check
 * @returns 
 */
function isString(param: ParamName) {
    return [
        "username",
        "streamerUsername",
        "message",
        "name",
        "categorySlug"
    ].includes(param);
}