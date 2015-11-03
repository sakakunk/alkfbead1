module.exports = {
    identity: 'footballmatch',
    connection: 'default',
    attributes: {
        
        status: {
            type: 'string',
            enum: ['scheduled', 'live', 'finished'],
            required: true,
        },
        team1: {
            type: 'string',
            required: true,
        },
        team2: {
            type: 'string',
            required: true,
        },
        result:{
            type: 'string',
            required: true,
            defaultsTo: '-'
        },
            
        user: {
            model: 'user',
        },
        
        playerevents:{
            collection: 'playerevents',
            via: 'footballmatch'
        }
        
    }
}