const onError = (client) => {
    client.stream.on('error', (err) => {
        console.log("stream error", err);
    });
    client.on('error', (err) => {
        console.log("error", err);
    });
    client.on('offline', () => {
        console.log("server is offline");
    });
    client.on('disconnect', () => {
        console.log('server was gracefully shut down')
    })
    client.on('close', () => {
        console.log("server closed");
        // TODO: look into ws.onclose or smth to hide websocket error
        //https://github.com/websockets/ws/issues/1256
    });
}

export default onError