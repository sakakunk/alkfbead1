module.exports = {
    identity: 'footballmatch',
    connection: 'default',
    attributes: {
        /*azon: {
            type: 'string',
            required: true,
            unique: true,
        },*/
        starttime: {
            type: 'datetime',
            defaultsTo: function () { return new Date(); },
            required: true,
        },
        status: {
            type: 'string',
            enum: ['scheduled', 'live', 'finished'],
            defaultsTo : 'scheduled',
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
            collection: 'playerevent',
            via: 'footballmatch'
        }
        
    }
};