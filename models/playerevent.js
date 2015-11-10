module.exports = {
    identity: 'playerevent',
    connection: 'default',
    attributes: {
        
        eventcategory: {
            type: 'string',
            enum: ['goal', 'owngoal', 'yellowcard', "redcard", 'subin', 'subout'],
            required: true,
        },
        /*azon: {
           type: 'string',
            unique: true,
            required: true
        },*/
        name: {
            type: 'string',
            required: true,
        },
        eventTime: {
            type: 'string',
            required: true,
        },
        team: {
          type: 'string',
          enum: ['home', 'away'],
          required: true
        },
        footballmatch: {
            model: 'footballmatch',
        },
    }
}