
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
            linkup: {
                event: 'linkup',
                function: () => null
            }
        }

        const createMQTTStub = () => {
            const methods = {
                linkup: (e) => e,
                publish: (e) => e,
                subscribe: (e) => e
            }

            return {
                ...methods
            }
        }

        let MQTTStub = createMQTTStub()

        const linkup = (callback) => {
            try {
                console.log('TRY RUN')
                MQTTStub = connect(url, options)
                MQTTStub.subscribe('#')
                state.isConnected = true
                state.connetionType = 'CONNECTED'
            }
            catch {
                console.log('CATCH RUN')
                onError(MQTTStub)
                state.connetionType = 'STUB'
            }
            console.log('AFTER PROMISE')
            events.linkup.function()
            state.isConnected = true

            callback()

        }

        const publish = (action, origin, sessionID) => {
            console.log('on publish', formatOutput(action, origin, sessionID))
            MQTTStub.publish('analytics', formatOutput(action, origin, sessionID))
        }

        return {
            state,
            linkup,
            publish
        }

    }

    return store => {

        
        const mqttConnection = createMQTTConnection()

        const sessionID = randGenerator()

        // client.on('message', ((action, message) => {
        //     let parsedMessage = JSON.parse(new TextDecoder("utf-8").decode(message))
        //     console.log('mqtt logger', formatOutput(parsedMessage, origin, sessionID))
        // }))

        return next => action => {

            if(action.type == '@@CURIOS_INIT') {

                const connState = mqttConnection.state

                if(!connState.isConnected){
                    mqttConnection.linkup(() => {
                        console.log('doesnt do anything')
                    })

                }

            }
            console.log('does something', formatOutput(action, origin, sessionID))
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
