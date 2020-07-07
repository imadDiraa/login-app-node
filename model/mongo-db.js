const mongoClient = require('mongodb').MongoClient

const url = 'mongodb+srv://login-app:MumXS3uduIWj61m9@cluster0.uph79.mongodb.net';

let dbclient

exports.getDbClient = function() {
    return dbclient
}

exports.init = async () => {
    var client
    if (!dbclient) {
        try {
            client = await mongoClient.connect(url, { useUnifiedTopology: true })
        } catch (err) {
            return Promise.reject(err)
        }
        dbclient = client
    }
    return client
}
