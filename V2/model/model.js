var mongoose = require('mongoose');

var meerkatSchema = mongoose.Schema({
    groupId: String,
    groupName: String,
    groupDetail: String,
    members: [
        {
            memberId: { 
				type: String, 
				unique: true
			},
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
          			timestamp: String,
                    result: Boolean
                }
            ]
        }
    ],
    log: [
        {
            sessionId: { 
				type: String, 
				unique: true
			},
            timestamp: [String],
            imagePath: [String]
        }
    ]
})

var meerkatCollection = mongoose.model('TestMeerkat', meerkatSchema);
module.exports = meerkatCollection
module.exports.meerkatSchema = meerkatSchema