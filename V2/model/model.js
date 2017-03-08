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
            memeberDetail: String,
            personId: String,
            personImages: [
                {
                    personImagePath: String,
                    persistedFaceId: String
                }
            ],
            presenceLog: [
                {
                    date: Date,
                    startTime: String,
                    endTime: String,
                    log: [Boolean],
                    logImagePath: [String]
                }
            ]
        }
    ]
})

var meerkatCollection = mongoose.model('TestMeerkat', meerkatSchema);
module.exports = meerkatCollection;