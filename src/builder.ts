import { ApiRequest, ApiResponse, Event, Ref, Topic } from "./customTypes/protocol";

/**
 * Assists in building Glimesh payloads
 */
export class Builder {
    private joinRef:string = "";

    constructor(joinRef: string) {
        this.joinRef = joinRef;
    }

    buildDefault() {}

    /**
     * Builds a subscription
     * @param ref The ref to receive in reply when the mutation is returned
     * @param graphql The graphql subscription
     * @param retVal The graphql data on the object you want returned
     */
    buildSubscription(ref: Ref, graphql: string, retVal: string = ""): string {
        let graphqlFormat = {
            query: `subscription {${graphql} {${retVal}} }`
        };

        let response: ApiRequest = [
            this.joinRef,
            ref,
            "__absinthe__:control",
            "doc",
            graphqlFormat
        ];

        return JSON.stringify(response);
    }

    /**
     * Builds a query
     * @param ref The ref to receive in reply when the query is returned
     * @param graphql The graphql query
     * @param retVal The graphql data on the object you want returned
     */
    buildQuery(ref: Ref, graphql: any, retVal: string = "") {
        let graphqlFormat = {
            query: `query {${graphql} {${retVal}}}`
        };

        let response: ApiRequest = [
            this.joinRef,
            ref,
            "__absinthe__:control",
            "doc",
            graphqlFormat
        ];

        return JSON.stringify(response);
    }


    /**
     * Builds a mutation
     * @param ref The ref to receive in reply when the mutation is returned
     * @param graphql The graphql mutation
     * @param retVal The graphql data on the object that you want returned
     */
    buildMutation(ref: Ref, graphql: any, retVal: string = ""): string {
        let graphqlFormat = {
            query: `mutation {${graphql} {${retVal}} }`
        }

        let response: ApiRequest = [
            this.joinRef,
            ref,
            "__absinthe__:control",
            "doc",
            graphqlFormat
        ];
        
        return JSON.stringify(response);
    }
}