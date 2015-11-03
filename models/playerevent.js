module.exports = {
    identity: 'playerevent',
    connection: 'default',
    attributes: {
        
        eventcategory: {
            type: 'string',
            enum: ['goal', 'owngoal', 'yellowcard', "redcard"],
            required: true,
        },
        name: {
            type: 'string',
            required: true,
        },
        eventTime: {
            type: 'string',
            required: true,
        },
        footballmatch: {
            model: 'footballmatch',
        },
    }
}