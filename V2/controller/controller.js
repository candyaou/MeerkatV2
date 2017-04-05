var oxford = require("project-oxford"),
    _client = new oxford.Client("f24df96103c0430a8101f1f5b1e01853");

var analyzer = function(){
    
    /**
     * Set subscription key
     *
     * @param  {string}  key            - Subscription key of Face API to use
     */
    function setSubscriptionKey(key) {
        _client = new oxford.Client(key);
    }

    /**
     * Detect faces in an image
     *
     * @param  {object}  options                        - Options object
     * @param  {string}  options.url                    - URL to image to be used
     * @param  {string}  options.path                   - Path to image to be used
     * @param  {stream}  options.stream                 - Stream for image to be used
     * @param  {boolean} options.returnFaceId           - Include face ID in response?
     * @param  {boolean} options.analyzesAge            - Analyze age?
     * @param  {boolean} options.analyzesGender         - Analyze gender?
     * @param  {boolean} options.analyzesHeadPose       - Analyze headpose?
     * @param  {boolean} options.analyzesSmile          - Analyze smile?
     * @param  {boolean} options.analyzesFacialHair     - Analyze facial hair?
     */
    function detect(options) {
        return new Promise(function(resolve, reject) {
            var faceAttributes = {};

            if (options.url) {
                faceAttributes["url"] = options.url;
            }
            else if (options.path) {
                faceAttributes["path"] = options.path;
            }
            else if (options.stream) {
                faceAttributes["stream"] = options.stream;
            }

            if (options.returnFaceId) {
                faceAttributes["returnFaceId"] = options.returnFaceId;
            }
            if (options.analyzesAge) {
                faceAttributes["analyzesAge"] = options.analyzesAge;
            }
            if (options.analyzesGender) {
                faceAttributes["analyzesGender"] = options.analyzesGender;
            }
            if (options.analyzesHeadPose) {
                faceAttributes["analyzesHeadPose"] = options.analyzesHeadPose;
            }
            if (options.analyzesSmile) {
                faceAttributes["analyzesSmile"] = options.analyzesSmile;
            }
            if (options.analyzesFacialHair) {
                faceAttributes["analyzesFacialHair"] = options.analyzesFacialHair;
            }

            resolve(_client.face.detect(faceAttributes));
            reject({error: "Failed for Detection!"});
        });
    }

    /**
     * Get an array of faceIds
     *
     * @param  {object}  responseFromDetect       - An object was returned by detect function
     * 
     * @return  {string[]}  faceIds               - String array for faceIds 
     */
    function getFaceIds(responseFromDetect) {
        // console.log(responseFromDetect)
        return new Promise(function(resolve, reject) {
            var faceIds = [];
            for (var i = 0; i < responseFromDetect.length; i++) {
                faceIds.push(responseFromDetect[i]["faceId"]);
            }

            console.log('@getFaceIds: ' + faceIds);
            resolve(faceIds);
            reject({error: "Failed to get face ids!"});
        });
    }

    /**
     * Identifies persons from group of person by one or more faces
     *
     * @param  {string[]}   faceIds                           - Array of faceIds to use
     * @param  {string}     groupId                         - Id of person group from which faces will be identified
     * @param  {Number}     maxNumOfCandidatesReturned      - Optional max number of candidates per face (default=1, max=5)
     * 
     * @return  {object}    object
     * @return  {string}    object.faceId
     * @return  {object[]}  object.candidates
     * @return  {string}    object.candidates.personId
     * @return  {number}    object.candidates.confidence
     */
    function identify(faceIds, groupId, maxNumOfCandidatesReturned) {
        return new Promise(function(resolve, reject) {
            maxNumOfCandidatesReturned = maxNumOfCandidatesReturned || 1;
            
            resolve(_client.face.identify(faceIds, groupId, maxNumOfCandidatesReturned));
            reject({error: "Failed for Identification!"});
        });
    }

    /**
     * Verifies two faces whether they are from the same person
     *
     * @param  {string[]}   faceIds         - Array of two faceIds to use
     */
    function verify(faceIds) {
        return new Promise(function(resolve, reject) {
            resolve(_client.face.verify(faceIds));
            reject({error: "Failed for Verification!"});
        });
    }

    /**
     * Group of person
     */
    var group = {

        /**
         * Create group of person
         *
         * @param	{string}  groupId	        - Numbers, en-us letters in lower case, '-', '_'. Max length: 64
         * @param	{string}  groupName	        - Person group display name. The maximum length is 128.
         * @param	{string}  groupDetails	    - (Optional) User-provided data attached to the group. The size limit is 16KB.
         */
        create: function(groupId, groupName, groupDetails) {
            return new Promise(function(resolve, reject) {
                var details = groupDetails || "";

                resolve(_client.face.personGroup.create(groupId, groupName, details));
                reject({error: "Failed to create group"});
            });
        },

        /**
         * Get an existing group
         *
         * @param   {string}  groupId           - Name of group to get
         * 
         * @return  {Promise} Object
         * @return  {Promise} Object.personGroupId
         * @return  {Promise} Object.name
         * @return  {Promise} Object.userData
         */
        get: function(groupId) {
            return new Promise(function(resolve, reject) {
                resolve(_client.face.personGroup.get(groupId));
                reject({error: "Failed to get group, " + groupId});
            });
        },

        /**
         * Update an existing group's name and details
         *
         * @param	{string}  groupId	        - Numbers, en-us letters in lower case, '-', '_'. Max length: 64
         * @param	{string}  groupName	        - Person group display name. The maximum length is 128.
         * @param	{string}  groupDetails	    - (Optional) User-provided data attached to the group. The size limit is 16KB.
         */
        update: function(groupId, groupName, groupDetails) {
            return new Promise(function(resolve, reject) {
                var detail = groupDetails || "";
                resolve(_client.face.personGroup.update(groupId, groupName, detail));
                reject({error: "Failed to update group " + groupId});
            });
        },

        /**
         * Deletes an existing person group.
         *
         * @param  {string}  groupId            - Name of group to delete
         */
        delete: function(groupId) {
            return new Promise(function(resolve, reject) {
                resolve(_client.face.personGroup.delete(groupId));
                reject({error: "Failed to delete group " + groupId});
            });
        },

        /**
         * Starts a person group training.
         * Training is a necessary preparation process of a person group before identification.
         * Each person group needs to be trained in order to call Identification. The training
         * will process for a while on the server side even after this API has responded.
         *
         * @param  {string} groupId       - Name of person group to get
         */
        startTraining: function(groupId) {
            return new Promise(function(resolve, reject) {
                resolve(_client.face.personGroup.trainingStart(groupId));
                reject({error: "Failed to Training"});
            })
        },

        /**
         * Retrieves the training status of a person group. Training is triggered by the Train PersonGroup API.
         * The training will process for a while on the server side. This API can query whether the training
         * is completed or ongoing.
         *
         * @param  {string} groupId       - Name of person group to get
         */
        trainingStatus: function(groupId) {
            return new Promise(function(resolve, reject) {
                resolve(_client.face.personGroup.trainingStatus(groupId));
                reject({error: "Failed to get status of training"});
            });
        }
    };

    /**
     * Person in the group
     */
    var person = {

        /**
         * Create person into group
         *
         * @param  {string}  groupId              - The target person's group.
         * @param  {string}  personName           - Target person's display name. The maximum length is 128.
         * @param  {string}  personDetail         - (Optional) fields for user-provided data attached to a person. Size limit is 16KB.
         * 
         * @return  {string}  personId
         */
        create: function(groupId, personName, personDetail) {
            return new Promise(function(resolve, reject) {
                var detail = personDetail || "";
                resolve(_client.face.person.create(groupId, personName, detail));
                reject({error: "Failed for creating person"});
            });
        },

        /**
         * Get an existing person from a group
         *
         * @param  {string}  groupId        - The target person's group.
         * @param  {string}  personId       - The target person to get.
         */
        get: function(groupId, personId) {
            return new Promise(function(resolve, reject) {
                resolve(_client.face.person.get(groupId, personId));
                reject({error: "Failed to get group"});
            });
        },

        /**
         * Update person's information
         *
         * @param  {string}  groupId              - The target person's group.
         * @param  {string}  personId             - The target personId
         * @param  {string}  personName           - Target person's display name. The maximum length is 128.
         * @param  {string}  personDetail         - (Optional) fields for user-provided data attached to a person. Size limit is 16KB.
         */
        update: function(groupId, personId, personName, personDetail) {
            return new Promise(function(resolve, reject) {
                var detail = personDetail || "";
                resolve(_client.face.person.update(groupId, personId, personName, detail));
                reject({error: "Failed to update group"});
            }).catch(function(e) {
                console.log(e);
            });
        },

        /**
         * Delete an existing person from group
         *
         * @param  {string}  groupId            - The target person's person group.
         * @param  {string}  personId           - The target person to delete.
         */
        delete: function(groupId, personId) {
            return new Promise(function(resolve, reject) {
                resolve(_client.face.person.delete(groupId, personId));
                reject({error: "Failed to delete member in the group"});
            }).catch(function(e) {
                console.log(e);
            });
        },

        /**
         * Adds a face to a person for identification. The maximum face count for each person is 248.
         *
         * @param  {string}  groupId                    - The target person's person group.
         * @param  {string}  personId                   - The target person that the face is added to.
         * @param  {object}  options                    - The source specification.
         * @param  {string}  options.url                - URL to image to be used.
         * @param  {string}  options.path               - Path to image to be used.
         * @param  {stream}  options.stream             - Stream for image to be used.
         * @param  {string}  options.personDetail       - Optional. Attach user data to person's face. The maximum length is 1024.
         * @param  {object}  options.targetFace         - Optional. The rectangle of the face in the image.
         * 
         * @return {string}  persistedFaceId
         */
        addFace: function(groupId, personId, options) {
            return new Promise(function(resolve, reject) {
                resolve(_client.face.person.addFace(groupId, personId, options));
                reject({error: "Failed to add faces"});
            }).catch(function(e) {
                console.log(e);
            });
        },
        
        /**
         * Get a face for a person.
         *
         * @param  {string} groupId           - The target person's person group.
         * @param  {string} personId          - The target person that the face is to get from.
         * @param  {string} persistedFaceId   - The ID of the face to get.
         * @return  {Promise}                 - Promise resolving with the resulting JSON
         */
        getFace: function(groupId, personId, persistedFaceId) {
            return new Promise(function(resolve, reject) {
                resolve(_client.face.person.getFace(groupId, personId, persistedFaceId));
                reject({error: "Failed to get person's faces"});
            }).catch(function(e) {
                console.log(e);
            });
        },

        /**
         * Updates a face for a person.
         *
         * @param   {string} groupId                - The target person's person group.
         * @param   {string} personId               - The target person that the face is updated on.
         * @param   {string} persistedFaceId        - The ID of the face to be updated.
         * @param   {string} personDetail           - Optional. Attach user data to person's face. The maximum length is 1024.
         */
        updateFace: function(groupId, personId, persistedFaceId, personDetail) {
            return new Promise(function(resolve, reject) {
                var userData = personDetail || undefined;
                resolve(_client.face.person.updateFace(groupId, personId, persistedFaceId, userData));
                reject({error: "Failed to update person's face"});
            }).catch(function(e) {
                console.log(e);
            });
        },

        /**
         * Deletes a face from a person.
         *
         * @param {string} groupId     - The target person's person group.
         * @param {string} personId          - The target person that the face is removed from.
         * @param {string} persistedFaceId   - The ID of the face to be deleted.
         * @return {Promise}                 - Promise resolving with the resulting JSON
         */
        deleteFace: function(groupId, personId, persistedFaceId) {
            return new Promise(function(resolve, reject) {
                resolve(_client.face.person.deleteFace(groupId, personId, persistedFaceId));
                reject({error: "Failed to delete person's face"});
            }).catch(function(e) {
                console.log(e);
            });
        }
    };

    return {
        detect: detect,
        getFaceIds: getFaceIds,
        identify: identify,
        verify: verify,
        group: group,
        person: person
    };
}; // End of analyzer

module.exports = analyzer;