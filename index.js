
import { createMQTTConnection } from './createMQTTConnection'

export const randGenerator = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const createAnalyticsMiddleware = params => store => {

    const {
        app
    } = params

    if (!app) throw Error('App must have a name declared')

    let sessionId = null

    const mqttConnection = createMQTTConnection(params)

    return next => action => {

        if (action.type === '@@CURIOS_SESSION_RESET') {
            sessionId = randGenerator() 
        }

        if (action.type === '@@CURIOS_INIT') {
            const connState = mqttConnection.getState()

            if (!connState.isConnected) {
                next(action)
                try {
                    mqttConnection.connect(() => store.dispatch({
                        type: '@@CURIOS_ANALYTICS_CONNECT',
                        payload: {
                            ...connState
                        }
                    }))
                }catch(err){
                    store.dispatch({
                        type: '@@CURIOS_ANALYTICS_CONNECT',
                        isError: true,
                        error :{
                            message: err
                        },
                        payload: {
                            ...connState
                        }
                    })
                }
            }
        }

        if (!sessionId){
            sessionId = randGenerator()
        }

        mqttConnection.publish(
            JSON.stringify({
                origin: app ? app : 'NOT SET',
                action,
                sessionId
            })
        )
        
        return next(action)
    }
}

export { createAnalyticsMiddleware }
