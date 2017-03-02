var express = require('express')
var app = express()
var router = express.Router()

var mongoose = require('mongoose')
var analyzer = require('../controller/controller')
var model = require('../model/model')

// connect to DB
mongoose.connect('mongodb://meerkat:meerkat@ds149278.mlab.com:49278/meerkat')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log({message: 'Connect to DB successfully'})
});


router.route('/connect')

    // connect to DB
    .get(function(req, res) {
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://meerkat:meerkat@ds149278.mlab.com:49278/meerkat')
        var db = mongoose.connection
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function() {
            // we're connected!
            res.json({message: 'Connect to DB successfully'})
        });
    })

router.route('/createCollection')

    // createa collection
    .post(function(req, res) {
        userCollection = mongoose.model(req.body.name, meerkatSchema)
            res.json({message: 'Created model successfully'})
    })

// on route that end in /group
// accessed at POST http://localhost:8080/.../groups)
router.route('/groups') //POST GET

    /** 
     * Create a group
     * @body {string}  groupId              
     * @body {string}  groupName
     * @body {string}  groupDetail
     */
    .post(function(req, res) {

        if (req.body.groupId == undefined || req.body.groupName == undefined)
            res.json({error: 'Id and Name must be provided!'})
        
        var creator;
        var group = {groupId: req.body.groupId, groupName: req.body.groupName}
        
        if (req.body.groupDetail === undefined) {
            //console.log(group)
            creator = analyzer().group.create(req.body.groupId, req.body.groupName)
        }
        else {
            creator = analyzer().group.create(req.body.groupId, req.body.groupName, req.body.groupDetail)
            group.groupDetail = req.body.groupDetail
            console.log(group)
        }
        
        creator.then(function(response, error) {
            console.log("after Promise success")
            if (error) {
                res.send(error)
            } else {
                var userModel = new model()
                userModel.groupId = req.body.groupId
                userModel.groupName = req.body.groupName
                if (req.body.groupDetail != undefined)
                    userModel.groupDetail = req.body.groupDetail
                
                userModel.save(function(err) {
                    if (err)
                        res.send(err)
                    res.json({message: req.body.groupName + ' was created successfully'})
                })
            }
        })
    })

    /**
     * Get all existing groups
     */
    .get(function(req, res) {
        model.find(function(err, group) {
            if (err) {
                res.send(err)
            } else {
                res.json(group)
            }
        })
    })

// on route that end in /group/:group_id
router.route('/groups/:group_id') // GET *PUT* DELETE
    
    /**
     * Get group's object
     */
    .get(function(req, res) {
        model.find({groupId: req.params.group_id}, function(err, group) {
            if (err) {
                res.send(err)
            } else {
                res.json(group)
            }
        })
    })

    /**
     * Update groupId
     * @body  {string}  groupId
     * @body  {string}  groupName
     * @body  {string}  groupDetail
     */
    .put(function(req, res) {
        var body = {};
        if (req.body.groupId != undefined) {
            body.groupId = req.body.groupId
        }
        if (req.body.groupName != undefined) {
            body.groupName = req.body.groupName
        }
        if (req.body.groupDetail != undefined) {
            body.groupDetail = req.body.groupDetail
        }
        
        var updateCreator = analyzer().group.update(body)
        updateCreator.then(function(response, error) {
            if (error) {
                res.send(error)
            } else {
                model.find({groupId: req.params.group_id}, function(err, group) {
                    if (err) {
                        res.send(err)
                    } else {
                        if (req.body.groupId != undefined) {
                            group.groupId = req.body.groupId
                        }
                        if (req.body.groupName != undefined) {
                            group.groupName = req.body.groupName
                        }
                        if (req.body.groupDetail != undefined) {
                            group.groupDetail = req.body.groupDetail
                        }

                        group.save(function(err) {
                            if (err) {
                                res.send(err)
                            }
                        })

                        res.json({message: req.params.group_id + " was updated successfully"})
                    }
                })
            }
        })
    })

    /**
     * Delete group
     */
    .delete(function(req, res) {
        var deleteCreator = analyzer().group.delete(req.body.groupId)
        deleteCreator.then(function(response, error) {
            if (error) {
                res.send(error)
            } else {
                model.remove({groupId: req.params.group_id}, function(err, bear) {
                    if (err) {
                        res.send(err);
                    } else {
                        console.log(response)
                        res.json({message: req.body.groupId + " was deleted successfully"})
                    }
                })
            }
        })
    })

// on route that end in /group/:group_id/members
router.route('/groups/:group_id/members') //GET POST

    /**
     * Create new member into group
     * @body  {string}  memberId
     * @body  {string}  firstname
     * @body  {string}  lastname
     * @body  {string}  memberDetail             - Optional
     */
    .post(function(req, res) {
        if (req.body.memberId == undefined || req.body.firstname == undefined || req.body.lastname == undefined)
            res.json({error: 'Id and Name must be provided'})
        
        var memberCreator;
        var member = {memberId: req.body.memberId, firstname: req.body.firstname, lastname: req.body.lastname}
        member.memberDetail = req.body.memberDetail || ''

        console.log(member)
        memberCreator = analyzer().person.create(req.params.group_id, req.body.firstname + ' ' + req.body.lastname, member.memberDetail)
        memberCreator.then(function(response, error) {
            if (error) {
                res.send(error)
            } else {
                member.personId = response.personId
                
                console.log(member)
                model.update({groupId: req.params.group_id}, {$push: {members: member}},  function(err) {
                    if (err) {
                        res.send(err)
                    } else {
                        res.json({message: req.body.memberId + ' was created successfully'})
                    }
                })
            }
        })
    })

    /**
     * Get all members in group
     */
    .get(function(req, res) {
        model.find({groupId: req.params.group_id}, function(err, group) {
            if (err) {
                res.send(err)
            } else {
                res.json(group[0].members)
            }
        })
    })
    

// on the route that end in /group/:group_id/members/:member_id
router.route('/groups/:group_id/members/:member_id')

    /**
     * Get member's object
     */
    .get(function(req, res) {
        model.find({$and: [{groupId: req.params.group_id}, {member: {$elemMatch: {memberId: req.params.member_id}}}]}, function(err, member) {
            if (err) {
                res.send(err)
            } else {
                res.json(member)
            }
        })
    })

    /**
     * Update member's information
     */
    .put(function(req, res) {
        
    })

router.route('/groups/:group_id/members/:member_id/personId')

    /**
     * Get personId of member
     */
    .get(function(req, res) {
        model.find({$and: [{groupId: req.params.group_id}, {member: {$elemMatch: {memberId: req.params.member_id}}}]}, function(err, member) {
            if (err)
                res.send(err)
            res.json(member.member.personId)
        })
    })

router.route('/groups/:group_id/members/:member_id/personId/:personId/personImages')

    /**
     * Add faces to member's personImages
     */
    .post(function(req, res) {
        model.find({$and: [{groupId: req.params.group_id}, {member: {$elemMatch: {memberId: req.params.member_id}}}, {member: {$elemMatch: {personId: req.params.person_id}}}]}, function(err, person) {
            if (err)
                res.send(err)
            
        })
    })

router.route('/groups/:group_id/members/:member_id/personImages')

    /**
     * Create personImages
     * @body  {object}  options
     * @body  {string}  options.path               - Path to image to be used.
     * @body  {stream}  options.stream             - Stream for image to be used.
     * @body  {string}  options.personDetail       - Optional. Attach user data to person's face. The maximum length is 1024.
     * @body  {object}  options.targetFace         - Optional. The rectangle of the face in the image.
     */
    .post(function(req, res) {
        var personId;
        var obj = {};
        var temp = {};
        function callDB(){
            return new Promise(function(resolve, reject) {
                model.find({groupId: req.params.group_id}, {members: {$elemMatch: {memberId: req.params.member_id}}}, function(err, group) {
                    if (err) {
                        reject({error: 'Failed to connect DB'})
                        res.send(err)
                    } else {
                        console.log(group[0].members)
                        personId = group[0].members[0].personId
                        console.log(personId)
                        resolve(personId)
                    }
                })
            })
        }
        
        callDB().then(function(response, error) {
            console.log(response)
            if (req.body.url !== undefined) {
                temp.personImagePath = req.body.url
                obj.url = req.body.url
            }
            else if (req.body.path !== undefined) {
                temp.personImagePath = req.body.path
                obj.path = req.body.path
            }
            else if (req.body.stream !== undefined)  {
                temp.personImagePath = req.body.stream
                obj.stream = req.body.stream
            }
        }).then(function(response, error) {
            console.log('@ body')
            return analyzer().person.addFace(req.params.group_id, personId, obj)
        }).then(function(response, error) {
            console.log('After analyze()')
            if (error) {
                res.send(error)
            } else {
                console.log(response)
                temp.persistedFaceId = response.persistedFaceId
                console.log('@temp: ' + temp.persistedFaceId)
                model.update({groupId: req.params.group_id, "members.memberId": req.params.member_id}, {$push: {"members.$.personImages": temp}}, function(err) {
                    if (err) {
                        res.send(err)
                    } else {
                        res.json({message: "Person image of " + req.params.member_id + " was added successfully"})
                    }
                })
            }
        })
    })

router.route('/groups/:group_id/members/:person_id')

    /**
     * Get member information
     */
    .get(function(req, res) {
        model.find({$and: [{groupId: req.params.group_id}, {members: {$elemMatch: {personId: req.params.person_id}}}]}, function(err, member) {
            if (err)
                res.send(err)
            res.json({
                firstname: member.member.firstname,
                lastname: member.member.lastname
            })
        })
    })

    .put(function(req, res) {
    })


router.route('/analyze/:group_id')

    /**
     * Detect faces
     * @param  {object}  options                        - Options object
     * @param  {string}  options.url                    - URL to image to be used
     * @param  {string}  options.path                   - Path to image to be used
     * @param  {stream}  options.stream                 - Stream for image to be used
     * @param  {boolean} options.returnFaceId           - Include face ID in response?
     * @param  {boolean} options.analyzesFaceLandmarks  - Analyze face landmarks?
     * @param  {boolean} options.analyzesAge            - Analyze age?
     * @param  {boolean} options.analyzesGender         - Analyze gender?
     * @param  {boolean} options.analyzesHeadPose       - Analyze headpose?
     * @param  {boolean} options.analyzesSmile          - Analyze smile?
     * @param  {boolean} options.analyzesFacialHair     - Analyze facial hair?
     */
    .post(function(req, res) {
        
        // Gather req.body as options to send to controller().detect()
        function gatherBody() {
            return new Promise(function(resolve, reject) {
                var options = {};
                if (req.body.url != undefined) {
                    console.log(req.body.url)
                    options.url = req.body.url
                }
                else if (req.body.path != undefined) {
                    console.log(req.body.path)
                    options.path = req.body.path
                }
                else if (req.body.stream != undefined)  {
                    console.log(req.body.stream)
                    options.stream = req.body.stream
                }

                if (req.body.returnFaceId !== undefined) {
                    console.log(req.body.returnFaceId)
                    options.returnFaceId = Boolean(req.body.returnFaceId)
                }
                if (req.body.analyzesFaceLandmarks !== undefined) {
                    console.log(req.body.analyzesFaceLandmarks)
                    options.analyzesFaceLandmarks = Boolean(req.body.analyzesFaceLandmarks)
                }
                if (req.body.analyzesAge !== undefined) {
                    console.log(req.body.analyzesAge)
                    options.analyzesAge = Boolean(req.body.analyzesAge)
                }
                if (req.body.analyzesGender !== undefined) {
                    console.log(req.body.analyzesGender)
                    options.analyzesGender = Boolean(req.body.analyzesGender)
                }
                if (req.body.analyzesHeadPose !== undefined) {
                    console.log(req.body.analyzesHeadPose)
                    options.analyzesHeadPose = Boolean(req.body.analyzesHeadPose)
                }
                if (req.body.analyzesSmile != undefined) {
                    console.log(req.body.analyzesSmile)
                    options.analyzesSmile = Boolean(req.body.analyzesSmile)
                }
                if (req.body.analyzesFacialHair != undefined) {
                    console.log(req.body.analyzesFacialHair)
                    options.analyzesFacialHair = Boolean(req.body.analyzesFacialHair)
                }
                
                //console.log(options)
                resolve(options)
                reject({error: 'Failed to gather request body!'})
            })            
        }

        // Update presenceLog of members who are identidied
        function updatePresenceLog(respons) {
            return new Promise(function(resolve, reject) {
                for (var i = 0; i<response.length; i++) {
                    model.update({groupId: req.params.group_id, "members.personId": response[i].candidates[0].personId}, {$push: {"members.$.presenceLog": true}}, function(err){
                        if (err) {
                            reject(err)
                        }
                    })
                }
            })
        }

        /** 
         * Get information of each member
         * 
         * @return  {object}  memberInfo
         * @return  {string}  memberInfo.faceId
         * @return  {string}  memberInfo.firstname
         * @return  {string}  memberInfo.lastname
         */
        function getInfo(response) {
            console.log(response);
            return new Promise(function(resolve, reject) {
                var memberInfo = {}
                memberInfo.faceId = response.faceId
                model.find({groupId: req.params.group_id}, {members: {$elemMatch: {personId: response.candidates[0].personId}}}, function(err, group) {
                    if (err) {
                        reject(err)
                    } else {
                        //result[i].firstname = group.members[0].firstname
                        //result[i].lastname = group.members[0].lastname
                        console.log('@group: ' + group[0].members[0])
                        memberInfo.firstname = group[0].members[0].firstname
                        memberInfo.lastname = group[0].members[0].lastname
                        resolve(memberInfo)
                    }
                })
            })
        }

        var detectAnalyzer;
        var facesAttributes;
        gatherBody().then(function(response, error) {
            console.log(response)
            return analyzer().detect(response)
        }).then(function(response, error) {
            if(error) {
                res.send(error)
            }

            // @response {object}
            console.log('@ detect: ' + response)
            facesAttributes = response
            return analyzer().getFaceIds(response)
        }).then(function(response, error) {
            if (error) {
                res.send(error)
            }

            // @response {string[]}  faceIds
            console.log('@getFaceIdsss: ' + response)

            /**
             * Identify faces
             */
            return analyzer().identify(response, req.params.group_id)
        }).then(function(response, error) {
            if (error) {
                res.send(error)
            }

            // @response {object}  from identify()
            console.log('@identifyyy: ' + response)
            
            updatePresenceLog(response);            
            
            var membersInfo = []
            for (var i = 0; i<response.length; i++) {
                console.log(response[i])
                membersInfo.push(getInfo(response[i]))
            }

            return Promise.all(membersInfo)
        }).then(function(response, error) {
            // Get the position of face
            // ans Store it to database
            if (error) {
                res.send(error)
            }

            console.log('@membersInfo: ' + response)

            /**
             * Add faceRectangle for each member
             * response = membersInfo
             * 
             * @return  {object}  response.faceRectangle
             */
            for (var i = 0; i<response.length; i++) {
                for (var j = 0; j<facesAttributes.length; j++) {
                    console.log(response[i])
                    if (response[i].faceId == facesAttributes[j].faceId) {
                        response[i].faceRectangle = facesAttributes[j].faceRectangle
                        response[i].gender = facesAttributes[j].faceAttributes.gender
                        break
                    }
                }
            }

            res.json({message: req.params.group_id + " was analyzed successfully", data: response})
        })
    }) //PUT

router.route('/analyze/:group_id/detect')

    /**
     * Detect faces
     * @param  {object}  options                        - Options object
     * @param  {string}  options.url                    - URL to image to be used
     * @param  {string}  options.path                   - Path to image to be used
     * @param  {stream}  options.stream                 - Stream for image to be used
     * @param  {boolean} options.returnFaceId           - Include face ID in response?
     * @param  {boolean} options.analyzesFaceLandmarks  - Analyze face landmarks?
     * @param  {boolean} options.analyzesAge            - Analyze age?
     * @param  {boolean} options.analyzesGender         - Analyze gender?
     * @param  {boolean} options.analyzesHeadPose       - Analyze headpose?
     * @param  {boolean} options.analyzesSmile          - Analyze smile?
     * @param  {boolean} options.analyzesFacialHair     - Analyze facial hair?
     */
    .post(function(req, res) {
        
    })


// on the route that end in /analyze/:group_id/train
router.route('/train/:group_id') //POST GET

    /**
     * Training group
     */
    .post(function(req, res) {
        var trainCreator;
        trainCreator = analyzer().group.startTraining(req.params.group_id)
        trainCreator.then(function(response, error) {
            if (error) {
                res.send(error)
            } else {
                res.json(response)
            }
        })
    })

    /**
     * Get training status
     */
    .get(function(req, res) {
        var statusCreator;
        statusCreator = analyzer().group.trainingStatus(req.params.group_id)
        statusCreator.then(function(response, error) {
            if (error) {
                res.send(error)
            } else {
                res.json(response)
            }
        })
    })

module.exports = router;
