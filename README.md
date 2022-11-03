# Glimesh Browser API

This is a library for working with the Glimesh.tv API. It is currently in alpha so some bugs may occur.


## Installation

```bash
npm install glimesh-browser-api
```

## Use

A basic client is shown below. More options are in the project.

```js
import {GlimeshConnection} from "glimesh-browser-api"

let connection = new GlimeshConnection({
    clientId: ""
});

connection.connectToGlimesh(false);

connection.getEvents().on("ChatReady", function(data) {
    console.log("Ready!")
});

connection.getEvents().on("ChatData", (data) => {
    console.log("Chat data");
    console.log(data)
});

connection.subToEvent("Chat", [{
    channelId: 6
}]);
```