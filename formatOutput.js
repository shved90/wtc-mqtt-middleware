export const formatOutput = (content, origin, sessionID) => {
    origin = (typeof origin !== 'undefined') ?  origin : 'not set'; //TODO add regex once format is finalised
    let editedContent = content
    editedContent.origin = origin
    editedContent.sessionID = sessionID
    editedContent = JSON.stringify(editedContent)
    return editedContent
}
