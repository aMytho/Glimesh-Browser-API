import { ActiveSubscriptions, EventEmit } from "./customTypes/custom";
import { ApiResponse } from "./customTypes/protocol";


export class GlimeshParser {

    private subscriptions: ActiveSubscriptions[] = []

    constructor() { }

    /**
     * Handle data from the GLimesh API.
     * Determines what the data is and what to do with it.
     * Returns an event to emit or none if it can be ignored.
     * @param data The raw data from the API (not parsed)
     */
    public parseData(data: string): EventEmit {
        let parsedData: ApiResponse = JSON.parse(data);
        console.log(parsedData);

        // Determine the ref and respond acordingly
        switch (parsedData[1]) {
            case "open_resp":
                return {type: "Open", data: null}
            case "heartbeat_resp":
                return {type: "Heartbeat", data: null}
            case "channel_resp":
                this.subscriptions.push({type: "Channel", id: parsedData[4].response.subscriptionId})
                return {type: "ChannelReady", data: null}
            case "chat_resp":
                this.subscriptions.push({type: "Chat", id: parsedData[4].response.subscriptionId})
                return {type: "ChatReady", data: null}
            case "follow_resp":
                this.subscriptions.push({type: "Followers", id: parsedData[4].response.subscriptionId})
                return {type: "FollowReady", data: null}
            default: return this.handleData(parsedData)
        }
    }

    /**
     * Handle when a subscribed event occurs.
     * Returns the event to emit and the data relating to it
     * @param data API response
     */
    private handleData(data: ApiResponse): EventEmit {
        // Make sure its data from an event
        if (data[3] !== "subscription:data") {
            // We don't know what this is.
            return {type: "Unknown", data: data[4]}
        }

        // Check if the topic is in our subscribed IDs
        // If it is we determine the type and send the related data
        for (const subscription of this.subscriptions) {
            if (data[2].includes(subscription.id)) {
                console.log(true)
                switch(subscription.type) {
                    case "Channel": return {type: "ChannelData", data: data[4].result.data}
                    case "Chat": console.log(true, true);return {type: "ChatData", data: data[4].result.data}
                    case "Followers": return {type: "FollowData", data: data[4].result.data}
                }
            }
        }

        // If an unhandled event occurs we return the data related
        return {type: "Unknown", data: data[4]}
    }

    /**
     * Returns all of the active subscriptions
     */
    public getActiveSubscriptions(): ActiveSubscriptions[] {
        return this.subscriptions;
    }
}

//__absinthe__:doc:-576460752235594415:7487729DEF2D3335F930AC164CE4C7A4A2D908342E024CFE7813FA9C351DDB8D
//__absinthe__:doc:-576460752235594415:7487729DEF2D3335F930AC164CE4C7A4A2D908342E024CFE7813FA9C351DDB8D