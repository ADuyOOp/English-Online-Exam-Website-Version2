const express = require('express');
require('express-group-routes');

const api_exam = require('../controller/api_exam');
const api_root = require('../controller/api_root');
const api_manage = require('../controller/api_manage');
const api_data = require('../controller/api_data');
const api_user = require('../controller/api_user');

const upload = require('../multerConfig'); //for file upload

const router = express.Router();

router.get("/", api_root.Home);   

router.group("/exam", (router) => {
    router.get("/list", api_exam.ListAllExam); // /exam/list (Listening/Reading)
    // router.get("/list2", (req, res) => {res.render("writing");});
    router.get("/list2", api_exam.ListAllExam2);
    router.get("/load/:id", api_exam.LoadExam); // /exam/load

    router.get("/list/:id",api_exam.ListExam)   // /exam/list/#
    router.post("/list/:id",api_exam.ListExam)  // click 'end' button for fetching data

    router.get("/score/:id",api_exam.ScoreExam)     // /exam/score/#
    router.post("/score/:id",api_exam.ScoreExam)    // click 'review' buton for view result

    router.post("/skill", api_exam.ListExamBySkill)    //(web) listing exam existing by listening or reading
    router.get("/review/:id", api_exam.ReviewExam)      // /exam/review/#

    /************************************** prac 2 **********************************************/
    router.get("/remove/:id", api_exam.RemoveExam) //delete exam# (folders and database)

    router.get("/create", api_exam.CreateExam)  //(api) create a new exam# folder
    router.post("/create", api_exam.CreateExam) //(web-manage) create a new exam# folder

});

router.group("/manage", (router) => {
    router.get("/list", api_manage.ListManageExam); // /manage/list

    router.get("/login", api_manage.LoginUser); // /manage/login call login.html
    router.post("/login", api_manage.CheckUser) // check info account signed in
    router.get("/logout", api_manage.LogoutUser) // clear session signed in
});

/****************************************** prac 3 **********************************************/
router.group("/data", (router) => {
    router.get("/", api_data.Ware); // /data/       // load test_home.html page
    router.get("/list/:skill", api_data.Ware)       // load test_home.html when click <skill> link
    router.get("/list/:skill/:part", api_data.Ware) // load test_home.html when click <skill>/<part> link

    router.post("/create/:skill/:part", api_data.ComposeTest) // load test_compose.html
    

/****************************************** prac 6 **********************************************/
    router.post("/save", upload.fields([
        { name: 'audiofile', maxCount: 1 }, 
        { name: 'imagefile', maxCount: 1 }
    ]), (req, res, next) => {
        console.log("Files received by Multer:", req.files); // Debugging
        next();
    }, api_data.SaveTest);// save test to ware first then to test folder


    router.get("/edit/:skill/:part/:test", api_data.EditTest) // load test_edit.html
});

/****************************************** prac 4 **********************************************/
router.group("/user", (router) => {
    router.get("/list", api_user.ListAllUser); // /user/list       // load user_list.html page

    router.get("/create", api_user.CreateUser) // load user_create.html
    router.post("/create", api_user.AddUser)   // insert user to database

    router.post("/remove/:id", api_user.RemoveUser) // delete user in database

    router.post("/edit/:id", api_user.EditUser)     // load user_edit.html
    router.post("/update/:id", api_user.UpdateUser) // update user to database
});

module.exports = router;
