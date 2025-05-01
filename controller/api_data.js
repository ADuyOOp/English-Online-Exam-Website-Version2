  /*************************************** prac 3  **************************************************/

const fileman = require('../controller/fileman')
const dataman = require('../controller/dataman')
// const skill = require('../entity/skill')
// const part = require('../entity/part')
// const test = require('../entity/test')

const userman = require('../controller/userman')

class DataControl {
    async Ware(req, res) {
        /********************* prac 2 **************************/   
        // var skill_name = req.params["skill"]
        // var part_name = req.params["part"]
        // var skill = null
        // var part  = null

        // if (skill_name != undefined) {
        //     var root_data = fileman.GetRoot()
        //     skill = await dataman.ReadDirSkill(root_data, skill_name)

        //     if (part_name != undefined) {
        //         part =await dataman.GetDirPart(skill, part_name)
        //     }
        // }
        // res.render('test_home',{skill: skill, skill_name: skill_name, part: part, part_name: part_name})
        // res.render('test_home',{skill: skill, skill_name: skill_name})

        /********************* prac 4 **************************/   
        var listrole = ["staff", "admin"]
        var session = req.session;
        var sessionID = session.sessionID
    
        if (sessionID == undefined) {
            session.job = "data"
            var Message = "Sign in. Please !"
            // res.send(errMessage)
            res.render('login',{Message:Message}) //to user.GET("/login", user.LoginUser)
        } else {
            var author = await userman.AuthorUser(req, listrole)
            if (author) {
                var skill_name = req.params["skill"]
                var part_name = req.params["part"]
                var skill = null
                var part  = null

                if (skill_name != undefined) {
                    var root_data = fileman.GetRoot()
                    skill = await dataman.ReadDirSkill(root_data, skill_name)

                    if (part_name != undefined) {
                        part =await dataman.GetDirPart(skill, part_name)
                    }
                }

                var username = session.username
                // res.send(username)
                res.render('test_home',{skill: skill, skill_name: skill_name, part: part, part_name: part_name, Username:username})
                // res.render('test_home',{skill: skill, skill_name: skill_name})
            }
        }
    }

    /**** call test_compose.html to build test folder ****/
    async ComposeTest(req, res) {
        var skill_name = req.params["skill"]
        var part_name = req.params["part"]
        var username = req.session.username

        if (skill_name == "listening"){
            res.render('test_compose_listening',{skill_name: skill_name,part_name: part_name, Username:username})
        }
        else{
        res.render('test_compose_reading',{skill_name: skill_name,part_name: part_name, Username:username})
        }
    }

    /**** get parameters from test_compose.html or test_edit.html then save to data folder ****/
    async SaveTest(req, res) {
        // get parameters of folder
        var skill = req.body.skill
        var part = req.body.part
        var test = req.body.test    //only edit test

        // get parameters of file
        var audio = req.body.audiohidden //edit audio only
        var image = req.body.imagehidden //edit image only
        // var faudio = req.body.audiofile
        // var fimage = req.body.imagefile
        
        // get parameters of file
        var faudio = ''
        var fimage = ''

        // Debugging: Log req.files to see if files are received
        console.log("req.files Save Test:", req.files);
        
        // Get uploaded audio files in warehouse
        if (req.files && req.files['audiofile'] && req.files['audiofile'][0]) {
            faudio = req.files['audiofile'][0].filename;
        }
        console.log("Uploaded audio file:", faudio);

        // Get uploaded image files in warehouse
        if (req.files && req.files['imagefile'] && req.files['imagefile'][0]) {
            fimage = req.files['imagefile'][0].filename;
        }
        console.log("Uploaded image file:", fimage);

        // check upload file audio 
        var saudio
        if (faudio == undefined || faudio == '') {
            saudio = audio
        } else {
            saudio = faudio
        }

        // check upload file image 
        var simage 
        if (fimage == undefined || fimage == '') {
            simage = image
        } else {
            simage = fimage
        }

        // get parameters for audiotext.txt
        var text = req.body.text

        // get parameters for question.txt
        var Ques = req.body.question
        var arrOpt = req.body.opt
        var arrRes = req.body.result

        var arrQues = []
        if (typeof Ques == 'string'){
            arrQues.push(Ques)
        }else{
            arrQues = Ques
        }

        // copy media files existing on ware folder and save new text file to data folder
        await dataman.SaveDirTest(skill, part, test, saudio, simage, text, arrQues, arrOpt, arrRes)
        var url_path = "/data/list/" + skill + "/" + part
        res.redirect(url_path)
    }

    /**** call test_edit.html then edit files in #_test folder in data folder ****/
    async EditTest(req, res) {
        var username = req.session.username
        var skill_name = req.params.skill
        var part_name = req.params.part
        var test_name = req.params.test    //only edit test

        var Skill 
        var Part 
        var Test 
        var path_test 

        if (skill_name != undefined) {
            var root_data = fileman.GetRoot()
            Skill = await dataman.ReadDirSkill(root_data, skill_name)

            if (part_name != undefined) {
                Part = await dataman.GetDirPart(Skill, part_name)

                if (test_name != undefined) {
                    path_test = fileman.GetRoot() + "\\" + skill_name + "\\" + part_name + "\\" + test_name
                    Test = await dataman.GetDirTest(path_test, Part, test_name)
                    await dataman.CopyDirTest(skill_name, path_test)
                }
            }
        }

        // set array Result to send to test_edit.html
        var arrResult = ["a", "b", "c", "d"]        

        //load form to update test
        res.render('test_edit',{skill_name:skill_name, part_name: part_name, test_name:test_name, path_test:path_test, Test:Test, arrResult:arrResult, Username:username})
        // res.send({skill_name:skill_name, part_name: part_name, test_name:test_name, path_test:path_test, Test:Test, arrResult:arrResult})
    }
}

const datacon = new DataControl()
module.exports = datacon;
