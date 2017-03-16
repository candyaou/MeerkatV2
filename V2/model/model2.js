var mongoose = require('mongoose');

var meerkatSchema = mongoose.Schema({
    groupId: String,
    groupName: String,
    groupDetail: String,
    members: [
        {
            memberId: String,
            firstname: String,
            lastname: String,
            memberDetail: String,
            personId: String,
            personImages: [
                {
                    personImagePath: String,
                    persistedFaceId: String
                }
            ],
            presenceLog: [
                {
                    sessionId: String,
                    result: [Boolean]
                }
            ]
        }
    ],
    log: [
        {
            sessionId: String,
            timestamp: [String],
            imagePath: [String]
        }
    ]
})

var meerkatCollection = mongoose.model('TestMeerkat', meerkatSchema);
module.exports = meerkatCollection
module.exports.meerkatSchema = meerkatSchema