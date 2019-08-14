
import { connect } from 'mqtt'
import onError from './onError'
import { formatOutput } from './formatOutput'
import { randGenerator } from './randomGenerator'


const createMQTTMiddleware = (url, origin) => {


    const createMQTTConnection = () => {

        let state = {
            isConnected: false,
            connectionType: 'FAILED'
        }

        const options = {
            reconnectPeriod: 10000
        }

        let events = {
            connect: {
                event: 'connect',
                function: () => null
            }
        }

        const createMQTTStub = () => {
            const methods = {
                connect: (e) => e,
                publish: (e) => e,
                subscribe: (e) => e
            }

            return {
                ...methods
            }
        }

        let MQTTStub = createMQTTStub()

        const connect = (callback) => {
            try {
                console.log('TRY RUN')
                const client = connect(url, options)
                client.subscribe('#')
                state.isConnected = true
                state.connetionType = 'CONNECTED'
            }
            catch {
                console.log('CATCH RUN')
                console.warn('connect catch error here somewhere')
                onError(client)
                state.connetionType = 'STUB'
            }
            console.log('AFTER PROMISE')
            // events.connect.function()
            state.isConnected = true

            callback()

        }

        const publish = (action, origin, sessionID) => {
            console.log('on publish', formatOutput(action, origin, sessionID))
            MQTTStub.publish('analytics', formatOutput(action, origin, sessionID))
        }

        return {
            state,
            connect,
            publish
        }

    }

    return store => {

        
        const mqttConnection = createMQTTConnection()



        // const client = connect(url, options)
        // onError(client)
        // client.subscribe('#')

        const sessionID = randGenerator()

        // client.on('message', ((action, message) => {
        //     let parsedMessage = JSON.parse(new TextDecoder("utf-8").decode(message))
        //     console.log('mqtt logger', formatOutput(parsedMessage, origin, sessionID))
        // }))

        return next => action => {

            if(action.type == '@@CURIOS_INIT') {

                const connState = mqttConnection.state

                if(!connState.isConnected){
                    mqttConnection.connect(() => {
                        console.log('doesnt do anything')
                    })

                }

            }
            console.log('does anything', formatOutput(action, origin, sessionID))
            mqttConnection.publish(action, origin, sessionID)
            return next(action)
        }
    }
}


//     return store => {

//         const options = {
//             reconnectPeriod: 10000
//         }

//         const client = connect(url, options)
//         onError(client)
//         client.subscribe('#')

//         const sessionID = randGenerator()

//         client.on('message', ((action, message) => {
//             let parsedMessage = JSON.parse(new TextDecoder("utf-8").decode(message))
//             console.log('mqtt logger', formatOutput(parsedMessage, origin, sessionID))
//         }))

//         return next => action => {
//             console.log('before dispatch', formatOutput(action, origin, sessionID))
//             client.publish('analytics', formatOutput(action, origin, sessionID))
//             return next(action)
//         }
//     }
// }

//WIP REDUX DISPATCHER
// const dispatchMQTTAction = (url, origin) => ({ dispatch }) => {

//     const options = {
//         reconnectPeriod: 10000
//     }

//     const client = connect(url, options)
//     onError(client)
//     client.subscribe('#')

//     const addOrigin = (content) => {
//         origin = (typeof origin !== 'undefined') ? origin : 'not set'; //TODO add regex once format is finalised
//         let withOrigin = content
//         withOrigin.origin = origin
//         withOrigin = JSON.stringify(withOrigin)
//         return withOrigin
//     }

//     client.on('message', ((action, message) => {
//         let parsedMessage = JSON.parse(new TextDecoder("utf-8").decode(message))
//         console.log('mqtt dispatcher', addOrigin(parsedMessage))
//         dispatch(message)
//     }
//     ))

//     return next => (action) => {
//         console.log('next action', addOrigin(action))
//         client.publish('analytics', addOrigin(action))
//         return next(action)
//     };
// }

export { createMQTTMiddleware }
