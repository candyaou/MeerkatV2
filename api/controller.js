var express = require('express')
var app = express()
var router = express.Router()

var request = require('request').defaults({baseUrl: 'http://localhost:8080/api/'})
var analyzer = require('../controller/controller')

// on route that end in /groups
router.route('/groups')

    /**
     * Create group
     * @body {string}  groupId              
     * @body {string}  groupName
     * @body {string}  groupDetail          - Optional
     */
    .post(function(req, res) {
        if (req.body.groupId == undefined || req.body.groupName == undefined)
            res.json({error: 'Provide both Id and Name'})

        var creator;
        var group = {groupId: req.body.groupId, groupName: req.body.groupName}
        console.log(group)
        
        if (req.body.groupDetail === undefined) {
            creator = analyzer().group.create(req.body.groupId, req.body.groupName)
        }
        else {
            creator = analyzer().group.create(req.body.groupId, req.body.groupName, req.body.groupDetail)
            group.groupDetail = req.body.groupDetail
        }
        
        console.log('successfully Created')
        creator.then(function(response, error) {
            if (error)
                res.send(error)
            
            // send request to http://localhost:8080/.../models/groups
            request.post({
                uri: '/models/groups',
                body: group
            }/*, function(error, response) {
                if (error)
                    res.send(error)
                console.log(response)
                res.json(response)
            }*/)
        })

        res.json({message: 'Created successfully'})
    })
    
    /**
     * Get all groups
     */
    .get(function(req, res) {
        request.get({
            uri: '/models/groups'
        }
        /*, function(error, response) {
            if (error)
                res.send(error)
            res.json(response)
        }*/)
    })

// on route that end in /groups/:group_id
router.route('/groups/:group_id')

    /**
     * Get group's object
     */
    .get(function(req, res) {
        request.get({
            uri: '/models/groups/' + req.params.group_id
        }, function(error, response) {
            if (error)
                res.send(error)
            res.json(response)
        })
        //res.json({message: 'The information of ' + req.params.group_id})
    })

    /**
     * Update groupId
     * @body  {string}  groupId
     * @body  {string}  groupName
     * @body  {string}  groupDetail
     */
    .put(function(req, res) {
        
    })

    /**
     * Delete group
     */

router.route('/groups/:group_id/members')

    /**
     * Create member in the group_id
     * @body {string}  memberId
     * @body {string}  firstname
     * @body {string}  lastname
     * @body {string}  memberDetail         - Optional
     */
    .post(function(req, res) {
        if (req.body.memberId == undefined || req.body.firstname == undefined || req.body.lastname == undefined)
            res.json({error: 'Id and Name must be provied'})
        
        var memberCreator
        var member = {memberId: req.body.memberId, firstname: req.body.firstname, lastname: req.body.lastname}
        if(memberDetail == undefined)
            memberCreator = analyzer().person.create(req.params.groupId, req.body.firstname + ' ' + req.body.lastname)
        else{
            memberCreator = analyzer().person.create(req.params.groupId, req.body.firstname + ' ' + req.body.lastname, req.body.memberDetail)
            member.memberDetail = req.body.memberDetail
        }
        
        memberCreator.then(function(response, error) {
            if (error)
                res.send(error)
            
            member.personId = response['personId']
            // send request to localhost:8080/.../groups/:group_id/members
            request.post({
                uri: '/models/groups/' + req.params.group_id + '/members',
                body: member
            }, function(error, response) {
                if (error)
                    res.send(error)
                
                res.json(response)
            })
        })
        
        //res.json({message: 'Member was created successfully'})
    })

    /**
     * Get all members in group
     */
    .get(function(req, res) {
        request.get({
            uri: '/models/groups/' + req.params.group_id + '/members'
        }, function(error, response) {
            if (error)
                res.send(error)
            res.json(response)
        })
        //res.json({message: 'Member was updated successfully'})
    })

// on the route that end in /groups/:group_id/members/:member_id
router.route('/groups/:group_id/members/:member_id')

    /**
     * Get member's object
     */
    .get(function(req, res) {
        request.get({
            uri: '/models/groups/' + req.params.group_id + '/members' + req.params.member_id
        }, function(error, response) {
            if (error)
                res.send(error)
            res.json(response)
        })
        //res.json({message: 'Information of member: ' + req.params.member_id})
    })

    /**
     * Update member's information
     */

router.route('groups/:group_id/members/:member_id/personImages')

    /**
     * Add new member's face image
     */
    .post(function(req, res) {
        
        var personId
        request.get({
            uri: '/models/groups/' + req.params.group_id + '/members' + req.params.member_id + '/personId'
        }, function(error, response) {
            if (error)
                res.send(error)
            personId = response
        })
        var addFaceCreator
        var body = {}
        if (req.body.url != undefined) {
            body['personImagePath'] = req.body.url
            addFaceCreator = analyzer().person.addFace(req.params.group_id, personId, req.body.url)
        }
        else if (req.body.path != undefined) {
            body['personImagePath'] = req.body.path
            addFaceCreator = analyzer().person.addFace(req.params.group_id, personId, req.body.path)
        }
        else if (req.body.stream != undefined)  {
            body['personImagePath'] = req.body.stream
            addFaceCreator = analyzer().person.addFace(req.params.group_id, personId, req.body.stream)
        }

        addFaceCreator.then(function(response, error) {
            request.post({
                uri: '/models/groups/' + req.params.group_id + '/members' + req.params.member_id + '/personId' + personId,
                body: body
            }, function(error, response) {
                if (error)
                    res.send(error)
                res.json(response)
            })
        })
    })

// on the route that end in /analyze/:group_id
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
        
        var detectAnalyzer = analyzer().detect(options)
        var facesAttributes;
        detectAnalyzer.then(function(response, error) {
            if(error)
                res.send(error)
            
            // @response {object}
            res.json(response)
            facesAttributes = response
            return analyzer().getFaceIds(response)
        }).then(function(response, error) {
            if (error)
                res.send(error)
            
            // @response {string[]} faceIds
            res.json(response)

            return analyzer().identify(response, req.params.group_id)
        }).then(function(response, error) {
            if (error)
                res.send(error)
            
            // @response {object}  from identify()
            res.json(response)
            var result = []
            for (var i = 0; i<response.length; i++) {
                request.get({
                    uri: '/models/groups/' + req.params.group_id + '/members/' + response[i]['candidates']['personId']
                }, function(e, r) {
                    if (e)
                        res.send(e)
                    
                    r['faceId'] = response[i]['faceId']
                    result[i] = r
                })
            }
            return result
        }).then(function(response, error) {
            if (error)
                res.send(error)
            for (var i = 0; i<response.length; i++) {
                for (var j = 0; j<facesAttributes.length; j++) {
                    if (response[i]['faceId'] == facesAttributes[j]['faceId']) {
                        response[i]['faceRectangle'] = facesAttributes[j]['faceRectangle']
                        break
                    }
                }
            }
            res.json(response)
        })
        
        //res.json({0: {faceId: '', faceRectangle: '', firstname: '', lastname:''}})
    })

router.route('/analyze/:group_id/train')

    /**
     * Training group
     */
    .post(function(req, res) {
        var trainCreator;
        trainCreator = analyzer().group.startTraining(req.params.group_id)
        trainCreator.then(function(response, error) {
            if (error)
                res.send(error)
            res.json(response)
        })
    })

    /**
     * Get training status
     */
    .get(function(req, res) {
        var statusCreator;
        statusCreator = analyzer().group.trainingStatus(req.params.group_id)
        statusCreator.then(function(response, error) {
            if (error)
                res.send(error)
            res.json(response)
        })
    })    

module.exports = router