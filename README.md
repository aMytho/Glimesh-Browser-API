# Glimesh Browser API

This is a library for working with the Glimesh.tv API. It is currently in alpha so some bugs may occur.


## Installation

```bash
npm install glimesh-browser-api
```

## Use

A basic client is shown below. Many more options are in the project.

```js
import {GlimeshConnection} from "glimesh-browser-api"

// Create a connection with a client ID or an access token
let connection = new GlimeshConnection({
    clientId: "",
    accessToken: ""
});

// Opens the connection. If true it will connect with an access token
connection.connectToGlimesh(false);

// Add a few events...
connection.getEvents().on("ChatReady", function(data) {
    console.log("Ready!")
});

// When a chat message occurs...
connection.getEvents().on("ChatData", (data) => {
    console.log("Chat data");
    console.log(data)
});

// Listens for chat messages...
connection.subToEvent("Chat", [{
    channelId: 6
}]);

// We support mutations!
connection.createMutation("UpdateStreamInfo", [{channelId: 6}, {title: "Wow, updating title via api!"}]);
```

## Request Custom Data

By default, each query/mutation/subscription requests some data. If it doesn't contain the info you want you can add your own graphql request to it.

This is as simple as adding the string as an additional param. The below mutation will follow the streamer (user) with ID 1. It will return the username of the streamer that receives the follow.

```js
connection.createMutation("Follow", [{streamerId: 1}, {enableNotifications: false}], "streamer {user}");
```

## Event Listeners

This library is built on [Event Emitter 3](https://www.npmjs.com/package/eventemitter3). You can access the emitter by using the `getEvents()` method. This allows you emit custom events and add listeners.

```js
connection.getEvents().emit("customData", "mmm very custom");
```
> Emitting a custom event with custom data


The libary has type defs for all of the built in mutations, subscriptions, and queries. Note that only non paginated queries are supported. They will be added in a future version.

## Websocket

This library uses the built in browser websocket connection. You can access it with the `getConnection()` method.