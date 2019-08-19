import mqtt from 'mqtt'

export const createMQTTConnection = (params) => {

    const {
        mqttBroker,
    } = params

    if(!mqttBroker) throw Error ('MQTT Broker url must be declared')

    let state = {
        isConnected: false,
        connectionType: 'FAILED'
    }

    const options = {
        reconnectPeriod: 10000
    }

    const getState = () => {
        return state
    }

    const createMQTTStub = () => {
        const methods = {
            publish: (channel, message) => {return},
            subscribe: (e) => e
        }

        return {
            ...methods
        }
    }

    let MQTTClient = createMQTTStub()

    const publish = (message) => {
        MQTTClient.publish('analytics', message)
    }

    const connect = (callback) => {
        try {
            MQTTClient = mqtt.connect(`ws://${mqttBroker}`, options)

            MQTTClient.on('connect', () => {
                state.isConnected = true
                state.connectionType = 'BROKER'
                callback()
            })

            MQTTClient.on('error', (err) => {
                state.isConnected = false
                state.connectionType = 'FAILED'
                console.error('Error connecting to analytics broker ',err)
                throw Error(err)
            })
        }
        catch(err) {
            console.error('Error connecting to analytics broker ', err)
            console.warn('Unable to connect to MQTT broker, returning non functional stub')
            state.connectionType = 'STUB'
            callback()
        }
    }

    return {
        getState,
        connect,
        publish
    }

}