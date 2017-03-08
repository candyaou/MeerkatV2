var analyzer = require("./src/analyze")
/*
var group = analyzer().group.get('2')

group.then(function(response, error) {
    console.log(response)
})*/
/*
var person = analyzer().person.create('2', 'Thanyathorn Thanapattheerakul')
person.then(function(response, error) {
    console.log("@ person.create()")
    console.log(response)
})
*/
/*
var pers = analyzer().person.get('2', 'a537fc64-01aa-42f7-942f-c34d25be57d3')
pers.then(function(response, error) {
    console.log(response)
})*/
/*
var add = analyzer().person.addFace('2', 'a537fc64-01aa-42f7-942f-c34d25be57d3', {path: 'D:/CSC498 - Project I/source_code/meerkat/img/smile3.jpg'})
add.then(function(response, error) {
    console.log(response)
    console.log(error)
})
*/
/*
var del = analyzer().person.deleteFace('2', 'a537fc64-01aa-42f7-942f-c34d25be57d3', '88b64c7d-6554-49a1-bb62-d66748f51210')
del.then(function(response, error) {
    console.log(response)
})*/
/*
var train = analyzer().group.startTraining('2')
train.then(function(response, error) {
    console.log(response)
})

var status = analyzer().group.trainingStatus('2')
status.then(function(response, error) {
    console.log(response)
})
*/
var ident = analyzer().identify(['9da5570f-1dc6-4483-aa48-3790cdc5e96a'], '2')
ident.then(function(response, error) {
    console.log(response[0])
})