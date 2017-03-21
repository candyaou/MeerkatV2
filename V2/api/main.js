var express = require('express');
var app = express();
var router = express.Router();

var mongoose = require('mongoose');
var analyzer = require('../controller/controller');
var model = require('../model/model');

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

function connectToDB() {
	// connect to DB
	mongoose.connect('mongodb://meerkat:meerkat@ds149278.mlab.com:49278/meerkat')
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
		// we're connected!
		console.log({message: 'Connect to DB successfully'});
	});
}
connectToDB();

/**
 * Get member's personId from DB
 * @param  {string}  groupId
 * @param  {string}  memberId
 */
function getPersonId(groupId, memberId){
    return new Promise(function(resolve, reject) {
        model.find({groupId: groupId}, {members: {$elemMatch: {memberId: memberId}}}, function(err, group) {
            if (err) {
                reject({error: 'Failed to connect DB'});
                res.send(err);
            } else {
                console.log(group[0].members);
                personId = group[0].members[0].personId;
                console.log(personId);
                resolve(personId);
            }
        });
    });
}

/** 
 * Get information of each member
 * @param  {string}  groupId
 * @param  {object}  response                   - response data from Face Identification
 * 
 * @return  {object}  memberInfo
 * @return  {string}  memberInfo.faceId
 * @return  {string}  memberInfo.firstname
 * @return  {string}  memberInfo.lastname
 */
function getMemberInfo(groupId, response) {
    return new Promise(function(resolve, reject) {
        var memberInfo = {};
        memberInfo.faceId = response.faceId;
        model.find({groupId: groupId}, {members: {$elemMatch: {personId: response.candidates[0].personId}}}, function(err, group) {
            if (err) {
                reject(err);
            } else {
                console.log('@group: ' + group[0].members[0]);
                memberInfo.firstname = group[0].members[0].firstname;
                memberInfo.lastname = group[0].members[0].lastname;
                resolve(memberInfo);
            }
        });
    });
}

/*
/**
 * Get face's position in an image
 * @param
 */
function getFacePosition() {
    
}

router.route('/connect')

    // connect to DB
    .get(function(req, res) {
        connectToDB();
    });

router.route('/createCollection')
    // createa collection
    .post(function(req, res) {
			emptyThing = new model([])
			emptyThing.save()
			res.json({message: 'Created model successfully'})
    });

// on route that end in /group
router.route('/groups')

    /** 
     * Create a group
     * @body {string}  groupId              
     * @body {string}  groupName
     * @body {string}  groupDetail
     */
    .post(function(req, res) {

        if (req.body.groupId == undefined || req.body.groupName == undefined)
            res.json({error: 'Id and Name must be provided!'});
        
        var creator;
        var group = {groupId: req.body.groupId, groupName: req.body.groupName};
        
        if (req.body.groupDetail === undefined) {
            //console.log(group)
            creator = analyzer().group.create(req.body.groupId, req.body.groupName);
        }
        else {
            creator = analyzer().group.create(req.body.groupId, req.body.groupName, req.body.groupDetail);
            group.groupDetail = req.body.groupDetail;
            console.log(group);
        }
        
        creator.then(function(response, error) {
            console.log("after Promise success");
            if (error) {
                res.send(error);
            } else {
                var userModel = new model();
                userModel.groupId = req.body.groupId;
                userModel.groupName = req.body.groupName;
                if (req.body.groupDetail != undefined)
                    userModel.groupDetail = req.body.groupDetail;
                
                userModel.save(function(err) {
                    if (err) {
                        res.send(err);
						res.json({code: -2, status: "Failed to create a person group."})
					} else {
						res.json({code: 0, status: req.body.groupName + " was created successfully."})
					}
                });
            }
        }).catch(function(error) {
			if(error.code == "PersonGroupExists") {
				res.json({code: -3, status: req.body.groupName + " cannot be created due to existing in the system."})
			}
		})
    })

    /**
     * Get all existing groups
     */
    .get(function(req, res) {
        model.find(function(err, group) {
            if (err) {
                res.send(err);
				res.json({code: -2, status: "Failed to fetch groups."})
            } else {
				res.json({code: 0, status: "", group: group})
            }
        })
    });

// on route that end in /group/:group_id
router.route('/groups/:group_id')
    
    /**
     * Get group's object
     */
    .get(function(req, res) {
        model.find({groupId: req.params.group_id}, function(err, group) {
            if (err) {
                res.send(err);
            } else {
				// Check whether that particular group exists or not
				if(group[0] == null)
					res.json([]) // If not return [] <-- Blank JSON
				else
                	res.json(group);
            }
        });
    })

    /**
     * Update groupId
     * @body  {string}  groupId
     * @body  {string}  groupName
     * @body  {string}  groupDetail
     */
    .put(function(req, res) {
        var body = {};
        var updateCreator;
        if (req.body.groupName == undefined) {
            res.send({error: 'groupName is required!'});
        } else if (req.body.groupDetail != undefined){
            updateCreator = analyzer().group.update(req.params.group_id, req.body.groupName, req.body.groupDetail);
        } else {
            updateCreator = analyzer().group.update(req.params.group_id, req.body.groupName);
        }

        updateCreator.then(function(response, error) {
            if (error) {
                res.send(error);
            } else {
                model.find({groupId: req.params.group_id}, function(err, group) {
                    if (err) {
                        res.send(err);
                    } else {
                        group.groupName = req.body.groupName;

                        if (req.body.groupDetail != undefined) {
                            group.groupDetail = req.body.groupDetail;
                        }

                        group.save(function(err) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.json({message: req.params.group_id + " was updated successfully"});
                            }
                        })
                    }
                })
            }
        })
    })

    /**
     * Delete group
     */
    .delete(function(req, res) {
        if (req.params.group_id == undefined)
			res.json({error: 'Id must be provided!'});
        var deleteCreator = analyzer().group.delete(req.params.group_id);
        deleteCreator.then(function(response, error) {
            if (error) {
                res.send(error);
            } else {
                model.remove({groupId: req.params.group_id}, function(err, bear) {
                    if (err) {
                        res.send(err);
						res.json({code: -2, status: "The group cannot be deleted due to some errors."})
                    } else {
                        console.log(response);
                        res.json({message: req.params.group_id + " was deleted successfully"});
                    }
                })
            }
        }).catch(function(error) {
			res.json({code: -3, status: "The group cannot be deleted due to some errors."})
		})
    });

// on route that end in /group/:group_id/members
router.route('/groups/:group_id/members')

    /**
     * Create new member into group
     * @body  {string}  memberId
     * @body  {string}  firstname
     * @body  {string}  lastname
     * @body  {string}  memberDetail             - Optional
     */
    .post(function(req, res) {
        if (req.body.memberId == undefined || req.body.firstname == undefined || req.body.lastname == undefined)
            res.json({error: 'Id and Name must be provided'});
        
        var memberCreator;
        var member = {memberId: req.body.memberId, firstname: req.body.firstname, lastname: req.body.lastname};
        member.memberDetail = req.body.memberDetail || '';

        console.log(member);
			memberCreator = analyzer().person.create(req.params.group_id, req.body.firstname + ' ' + req.body.lastname, member.memberDetail)
			memberCreator.then(function(memRes, error) {
			if (error) {
				res.send(error);
			} else {
				if(error) {
					res.send(error);						
				} else {
						console.log(res)
						member.personId = memRes.personId              
						console.log(member)
						model.update({groupId: req.params.group_id}, {$push: {members: member}},  function(err) {
							if (err) {
								res.send(err);
								res.json({code: -2, status: err})
							} else {
								res.json({code: 0, status: req.body.memberId + ' was created successfully'})
							}
						})
					}
				}
			})
    })

    /**
     * Get all members in group
     */
    .get(function(req, res) {
        model.find({groupId: req.params.group_id}, function(err, group) {
            if (err) {
                res.send(err);
				res.json({code: -2, status: "Failed to fetch groups."})
            } else {
				res.json({code: 0, status: "", group: group})
            }
        })
    });

// on route that end in /group/:group_id/members/:member_id
router.route('/groups/:group_id/members/:member_id')

    /**
     * Get member's object
     */
    .get(function(req, res) {	
        var query = model.find({
            $and: [
                {groupId: req.params.group_id}, 
                {members: {$elemMatch: {memberId: req.params.member_id}}}
            ]}).select('members');
	
        query.exec(function(err, member) {
			var returnMember = {};
            if (err) {
                res.send(err)
				returnMember.code = -2
				returnMember.status = "Failed to fetch specific member."
            } else {
				if(member[0] != undefined) {
					for(var i=0; i<member[0].members.length; i++) {
						if(member[0].members[i].memberId == req.params.member_id) {
							returnMember.member = member[0].members[i]
							returnMember.code = 0
							returnMember.status = ""
							break
						}
					}
				}
				if(returnMember.member == undefined) {
					returnMember.code = -1
					returnMember.status = "The specific member does not exist."
				}
			}
			res.json(returnMember)
        })
    })

    /**
     * Delete member
     */
    .delete(function(req, res) {
        getPersonId(req.params.group_id, req.params.member_id).then(function(response, error) {
            if (error) {
                res.send({error: 'Failed to get personId of member id ' + req.params.member_id})
           		res.json({code: -2, status: "Failed to get personId of member id " + req.params.member_id})
            } else {
                return analyzer().person.delete(req.params.group_id, response);
            }
        }).then(function(response, error) {
            if (error) {
                res.send({error: 'Failed to delete member id ' + req.params.member_id})
           		res.json({code: -2, status: "Failed to delete member id " + req.params.member_id})
			} else {
				
            }
        }).catch(function(error) {
			res.json({code: -3, status: "Failed to delete the member due to not existing."})
		})
    })

	/**
     * Update member's name
     * @body {string}  firstname
     * @body {string}  lastname
     * @body {string}  memberDetail
     */
    .put(function(req, res) {
        if (req.params.member_id == undefined) {
            res.send({error: 'Member Id must be provided'});
		}
		if (req.body.firstname == undefined) {
            res.send({error: 'First name must be provided'});
        }
        if (req.body.lastname == undefined) {
            res.send({error: 'Last name must be provided'});
        } 
        if (req.body.memberDetail == undefined) {
            res.send({error: 'memberDetail must be provided'});
        } 
		var personId;
		var memberDetail;
        var query = model.find({
            $and: [
                {groupId: req.params.group_id}, 
                {members: {$elemMatch: {memberId: req.params.member_id}}}
            ]}).select('members');
	
        query.exec(function(err, member) {
            if (err) {
                res.send(err)
				res.json({code: -2, status: "Failed to fetch personId."})
            } else {
				if(member[0] != undefined) {
					for(var i=0; i<member[0].members.length; i++) {
						if(member[0].members[i].memberId == req.params.member_id) {
							personId = member[0].members[i].personId
							break
						}
					}
				}
			}
        }).then(function(response, error) {
			if(personId == undefined) {
				res.json({code: -1, status: "The specified member id does not exist."})
				return;
			}
		}).then(function(response,error) {
			memberUpdater = analyzer().person.update(req.params.group_id, personId, req.body.firstname + ' ' + req.body.lastname, req.body.memberDetail)
			memberUpdater.then(function(response, error) {
				if (error) {
					res.send(error);
				} else {
					model.update({groupId: req.params.group_id, "members.memberId": req.params.member_id},
										   {$set: {"members.$.firstname": req.body.firstname, "members.$.lastname": req.body.lastname, "members.$.memberDetail": req.body.memberDetail}},
					function(err) {
						if (err) {
							res.send(err);
							res.json({code: -2, status: "Failed to update the name of member id " + req.params.member_id})
						} else {
							res.json({code: 0, status: ""+ req.params.member_id + "'s name was updated successfully"})
						}
					})
				}
			}).catch(function(error) {
				if(error.code == "PersonNotFound") {
					res.json({code: -3, status: "Failed to update the person due to not existing."})
				}
				//console.log(error)
			})
		})
    });

// on route that in /groups/:group_id/members/:member_id/personId
router.route('/groups/:group_id/members/:member_id/personId')
	/**
	 * Get personId of member
     */
    .get(function(req, res) {
        var query = model.find({
            $and: [
                {groupId: req.params.group_id}, 
                {members: {$elemMatch: {memberId: req.params.member_id}}}
            ]}).select('members');
	
        query.exec(function(err, member) {
			var returnMemberPersonId = {};
            if (err) {
                res.send(err)
				returnMemberPersonId.code = -2
				returnMemberPersonId.status = "Failed to fetch personId of specific member."
            } else {
				if(member[0] != undefined) {
					for(var i=0; i<member[0].members.length; i++) {
						if(member[0].members[i].memberId == req.params.member_id) {
							returnMemberPersonId.personId = member[0].members[i].personId
							returnMemberPersonId.code = 0
							returnMemberPersonId.status = ""
							break
						}
					}
					if(returnMemberPersonId == undefined) {
						returnMemberPersonId.code = -1
						returnMemberPersonId.status = "The specific member does not exist."
					}
				}
			}
			res.json(returnMemberPersonId)
        })
    })

// on route that in /groups/:group_id/members/:member_id/personImages
router.route('/groups/:group_id/members/:member_id/personImages')

    /**
     * Create personImages of member
     * @body  {object}  options
     * @body  {string}  options.url
     * @body  {string}  options.path               - Path to image to be used.
     * @body  {stream}  options.stream             - Stream for image to be used.
     * @body  {string}  options.personDetail       - Optional. Attach user data to person's face. The maximum length is 1024.
     *                          targetFace         - Optional. The rectangle of the face in the image.     
     * @body  {string}  options.targetFaceleft
     * @body  {string}  options.targetFacetop
     * @body  {string}  options.targetFacewidth
     * @body  {string}  options.targetFaceheight                                         
     */
    .post(function(req, res) {
        var personId;
        var obj = {};
        var temp = {};
        function callDB(){
            return new Promise(function(resolve, reject) {
                model.find({groupId: req.params.group_id}, {members: {$elemMatch: {memberId: req.params.member_id}}}, function(err, group) {
                    if (err) {
                        reject({error: 'Failed to connect DB'});
                        res.send(err);
                    } else {
                        console.log(group[0].members);
                        personId = group[0].members[0].personId;
                        console.log(personId);
                        resolve(personId);
                    }
                })
            })
        }
        
        // Get personId of member
        getPersonId(req.params.group_id, req.params.member_id).then(function(response, error) {
            personId = response;
            console.log(response);

            if (req.body.url !== undefined) {
                temp.personImagePath = req.body.url;
                obj.url = req.body.url;
            }
            else if (req.body.path !== undefined) {
                temp.personImagePath = req.body.path;
                obj.path = req.body.path;
            }
            else if (req.body.stream !== undefined) {
                temp.personImagePath = req.body.stream;
                obj.stream = req.body.stream;
            }

            if(req.body.targetFaceleft !== undefined){
                obj.userData = req.body.userData || '';
                obj.targetFace = {};
                obj.targetFace.left = req.body.targetFaceleft || '';
                obj.targetFace.top = req.body.targetFacetop || '';
                obj.targetFace.width = req.body.targetFacewidth || '';
                obj.targetFace.height = req.body.targetFaceheight || '';
            }
            
        }).then(function(response, error) {
            console.log('@ body')

            // add face of member to Face API
            return analyzer().person.addFace(req.params.group_id, personId, obj);
        }).then(function(response, error) {
            console.log('After analyze().person.addFace()');
            if (error) {
                res.send(error);
            } else {
                console.log('@response: ' + response);
                temp.persistedFaceId = response.persistedFaceId;
                console.log('@temp: ' + temp.persistedFaceId);
                model.update(
							{groupId: req.params.group_id, "members.memberId": req.params.member_id},
							{$push: {"members.$.personImages": temp}
					}, function(err) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json({message: "Person image of " + req.params.member_id + " was added successfully"});
                    }
                })
            }
        })
    });

// on route that end in /analyze/:group_id
router.route('/analyze/:group_id')

    /**
     * Detect faces
     * @param  {object}  options                        - Options object
     * @param  {string}  options.sessionId         - Session ID
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
		if(req.body.sessionId === undefined) {
			res.json({code: -4, status: "Session ID must be provided."})
			return
		}
   	     var imagePath;
		/** 
		 * Gather req.body as options to send to controller().detect()
		 * @param  {object}  requestBody
		 * 
		 * @return  {object}  options               - Options for Face detection
		 */
		function gatherRequestBodyForDetection(requestBody) {
			return new Promise(function(resolve, reject) {
				var options = {};
				if (requestBody.url) {
					// console.log(requestBody.url);
					options.url = requestBody.url;
					imagePath = requestBody.url;
				}
				else if (requestBody.path) {
					// console.log(requestBody.path);
					options.path = requestBody.path;
					imagePath = requestBody.path;
				}
				else if (requestBody.stream)  {
					// console.log(requestBody.stream);
					options.stream = requestBody.stream;
					imagePath = requestBody.stream;
				}

				if (requestBody.returnFaceId) {
					// console.log(requestBody.returnFaceId);
					options.returnFaceId = Boolean(requestBody.returnFaceId);
				}
				if (requestBody.analyzesFaceLandmarks) {
					// console.log(requestBody.analyzesFaceLandmarks);
					options.analyzesFaceLandmarks = Boolean(requestBody.analyzesFaceLandmarks);
				}
				if (requestBody.analyzesAge) {
					// console.log(requestBody.analyzesAge);
					options.analyzesAge = Boolean(requestBody.analyzesAge);
				}
				if (requestBody.analyzesGender) {
					// console.log(requestBody.analyzesGender);
					options.analyzesGender = Boolean(requestBody.analyzesGender);
				}
				if (requestBody.analyzesHeadPose) {
					// console.log(requestBody.analyzesHeadPose);
					options.analyzesHeadPose = Boolean(requestBody.analyzesHeadPose);
				}
				if (requestBody.analyzesSmile) {
					// console.log(requestBody.analyzesSmile);
					options.analyzesSmile = Boolean(requestBody.analyzesSmile);
				}
				if (requestBody.analyzesFacialHair) {
					// console.log(requestBody.analyzesFacialHair);
					options.analyzesFacialHair = Boolean(requestBody.analyzesFacialHair);
				}

				resolve(options);
				reject({error: 'Failed to gather request body!'});
			});
		}
	
        // Gather req.body as options to send to controller().detect()
        function gatherBody() {
   	     	var imagePath;
            return new Promise(function(resolve, reject) {
                var options = {};
                if (req.body.url != undefined) {
                    console.log(req.body.url);
                    options.url = req.body.url;
                }
                else if (req.body.path != undefined) {
                    console.log(req.body.path);
                    options.path = req.body.path;
                }
                else if (req.body.stream != undefined)  {
                    console.log(req.body.stream);
                    options.stream = req.body.stream;
                }

                if (req.body.returnFaceId !== undefined) {
                    console.log(req.body.returnFaceId);
                    options.returnFaceId = Boolean(req.body.returnFaceId);
                }
                if (req.body.analyzesFaceLandmarks !== undefined) {
                    console.log(req.body.analyzesFaceLandmarks);
                    options.analyzesFaceLandmarks = Boolean(req.body.analyzesFaceLandmarks);
                }
                if (req.body.analyzesAge !== undefined) {
                    console.log(req.body.analyzesAge);
                    options.analyzesAge = Boolean(req.body.analyzesAge);
                }
                if (req.body.analyzesGender !== undefined) {
                    console.log(req.body.analyzesGender);
                    options.analyzesGender = Boolean(req.body.analyzesGender);
                }
                if (req.body.analyzesHeadPose !== undefined) {
                    console.log(req.body.analyzesHeadPose);
                    options.analyzesHeadPose = Boolean(req.body.analyzesHeadPose);
                }
                if (req.body.analyzesSmile != undefined) {
                    console.log(req.body.analyzesSmile);
                    options.analyzesSmile = Boolean(req.body.analyzesSmile);
                }
                if (req.body.analyzesFacialHair != undefined) {
                    console.log(req.body.analyzesFacialHair);
                    options.analyzesFacialHair = Boolean(req.body.analyzesFacialHair);
                }

                resolve(options);
                reject({error: 'Failed to gather request body!'});
            })            
        }

        // Update presenceLog of members who are identidied
        function updatePresenceLog(group_id, imagePath, response, sid) {
            return new Promise(function(resolve, reject) {
                var personFound = []
				for (var i = 0; i<response.length; i++) {
					if(response[i].candidates[0] != undefined)
						personFound.push(response[i].candidates[0].personId)
                }
				
				var query = model.find({
					$and: [
						{groupId: group_id}
					]}).select('members');

				query.exec(function(err, response) {
					return response
				}).then(function(member, error) {
						var query2 = model.find({
							$and: [
								{groupId: group_id}
							]}).select('log');
						query2.exec(function(err, grp) {
							if(err) {
							} else {
								var found = false
								if(grp[0] != undefined) {
									for(var i=0; i<grp[0].log.length; i++) {
										if(grp[0].log[i].sessionId == sid) {
											found = true
											break
										}
									}
								}
								var updateThing = {}
								var findThing = {}
								if(found == false) {
									findThing = {groupId: group_id}
									updateThing = {$push: {log: {"sessionId": sid, "timestamp": getDateTime(), "imagePath": imagePath}}}
								} else {
									findThing = {groupId: group_id,  "log.sessionId": sid}
									updateThing = {$push: {"log.$.timestamp": getDateTime(), "log.$.imagePath": imagePath}}
								}
								model.update(findThing, updateThing,
									function(err) {

								})
							}
						}).then(function(response, error) {
								if(member[0] != undefined) {
									for(var i=0; i<member[0].members.length; i++) {
										found = false
										for(var j=0; j<member[0].members[i].presenceLog.length; j++) {
											found = true
										}
										model.update({groupId: group_id, "members.personId": member[0].members[i].personId}, {$push: {"members.$.presenceLog": {"sessionId": sid, "timestamp": getDateTime(), "result": (personFound.indexOf(member[0].members[i].personId) > -1)}}},
											function(err) {
												if (err) {
													reject(err);
												} else {
													resolve({message: 'Update presenceLog successfully'});
												}
										})
									}
								}
						})
				});
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
            return new Promise(function(resolve, reject) {
                var memberInfo = {};
                memberInfo.faceId = response.faceId;
                model.find({groupId: req.params.group_id}, {members: {$elemMatch: {personId: response.candidates[0].personId}}}, function(err, group) {
                    if (err) {
                        reject(err);
                    } else {
                        //result[i].firstname = group.members[0].firstname
                        //result[i].lastname = group.members[0].lastname
                        console.log('@group: ' + group[0].members[0]);
                        memberInfo.firstname = group[0].members[0].firstname;
                        memberInfo.lastname = group[0].members[0].lastname;
                        resolve(memberInfo);
                    }
                })
            })
        }

        var detectAnalyzer;
        var facesAttributes;
        gatherRequestBodyForDetection(req.body).then(function(response, error) {
            console.log(response);
            return analyzer().detect(response);
        }).then(function(response, error) {
            if(error) {
                res.send(error);
            }

            // @response {object}  Response object from Face Detection
            strDetect = JSON.stringify(response, null, 4);
            console.log('@ detect: ' + strDetect);
            facesAttributes = response;
            return analyzer().getFaceIds(response);
        }).then(function(response, error) {
            if (error) {
                res.send(error);
            }

            // @response {string[]}  faceIds
            // console.log('@getFaceIdsss: ' + response);

            /**
             * Identify faces
             */
            return analyzer().identify(response, req.params.group_id);
        }).then(function(response, error) {
            if (error) {
                res.send(error);
            }

            // @response {object}  Response object from Face Identification
            strIdentify = JSON.stringify(response, null, 4); // (Optional) beautiful indented output.
            console.log('@identify: ' + strIdentify);
            
            // Update presenceLog of member
            return updatePresenceLog(req.params.group_id, imagePath, response, req.body.sessionId);            
        }).then(function(response, error) {
            var membersInfo = [];
            for (var i = 0; i<response.length; i++) {
                console.log(response[i]);

                // Get member information
                membersInfo.push(getMemberInfo(req.params.group_id, response[i]));
            }

            return Promise.all(membersInfo)
        }).then(function(response, error) {
            // Get the position of face
            if (error) {
                res.send(error);
            }

            

            /**
             * Add faceRectangle for each member
             * response = membersInfo
             * 
             * @return  {object}  response.faceRectangle
             */
            for (var i = 0; i<response.length; i++) {
                for (var j = 0; j<facesAttributes.length; j++) {
                    console.log(response[i]);
                    if (response[i].faceId == facesAttributes[j].faceId) {
                        response[i].faceRectangle = facesAttributes[j].faceRectangle;
                        break;
                    }
                }
            }
            console.log('@membersInfo: ' + response);
            res.json({message: req.params.group_id + " was analyzed successfully", data: response});
        }).catch(function(error) {
			console.log(error)
		})
    });

// on the route that end in /analyze/:group_id/train
router.route('/train/:group_id')

    /**
     * Training group
     */
    .post(function(req, res) {
        var trainCreator;
        trainCreator = analyzer().group.startTraining(req.params.group_id);
        trainCreator.then(function(response, error) {
            if (error) {
                res.send(error);
            } else {
                res.json(response);
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
        }).catch(function(error) {
			console.log(error)
		})
    });

router.route('/summarize/:group_id/session/:session_id')
	.get(function(req, res) {
			console.log(req.params.group_id)
			console.log(req.params.session_id)
			var responseData = {}
			var query = model.find({
				$and: [
					{groupId: req.params.group_id}, 
					{log: {$elemMatch: {sessionId: req.params.session_id}}}
				]}).select('log');

			query.exec(function(err, log) {
				if (err) {
					res.send(err);
				} else {
					if(log[0] != undefined) {
						var tempLog = []
						for(var i=0; i<log[0].log.length; i++) {
							if(log[0].log[i].sessionId == req.params.session_id) {
								tempLog = log[0].log[i]
							}
						}
						responseData.session = req.params.session_id
						responseData.timestamp = tempLog.timestamp
                        responseData.imagePath = tempLog.imagePath
						model.find({groupId: req.params.group_id}).select('members').exec(function(err, members) {
							var membersLog = []
							var memberMap = new Object();
							for(var i=0; i<members[0].members.length; i++) {
								for(var j=0; j<members[0].members[i].presenceLog.length; j++) {
									if(members[0].members[i].presenceLog[j].sessionId == req.params.session_id) {
										if(memberMap[members[0].members[i].memberId] == undefined) {
											memberMap[members[0].members[i].memberId] = {memberId: members[0].members[i].memberId, firstname: members[0].members[i].firstname, lastname: members[0].members[i].lastname}
											memberMap[members[0].members[i].memberId].result = []
										}
										memberMap[members[0].members[i].memberId].result.push(members[0].members[i].presenceLog[j].result)
									}
								}
							}
							for(key in memberMap){
								membersLog.push(memberMap[key])
							}
							responseData.members = membersLog
							res.json(responseData)
						})
					}
				}
			})
    });

module.exports = router;
