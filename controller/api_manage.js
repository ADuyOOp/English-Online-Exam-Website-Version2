
const examdal = require('../model/examdal')
const dialognode = require('dialog-node');
const userdal = require('../model/userdal')
const userman = require('../controller/userman')

const crypto = require("crypto");

class ManageControl {
  async ListManageExam(req, res){
    /********************* prac 2 **************************/   
    // var arrExam = await examdal.ListAllExam()
    // if(arrExam != null){
    //     // res.send(arrExam)
    //     res.render('listmanage',{ArrExam:arrExam})
    //   }
    // }    

    /********************* prac 4 **************************/      
    var listrole = ["staff", "admin"]
    var session = req.session;
    var sessionID = session.sessionID
    if (sessionID == undefined) {
      session.job = "exam"
      var Message = "Please Sign in."
      // res.send(errMessage)
      res.render('login',{Message:Message}) //to user.GET("/login", user.LoginUser)
    } else {
      var author = await userman.AuthorUser(req, listrole)
      if (author) {
        var arrExam = await examdal.ListAllExam()
        var username = session.username
        // res.send(username)
        res.render('listmanage',{ArrExam:arrExam, Username:username})
      } else {
          dialognode.warn('Access denied.!', '')
      }
    }
  }

  /************************************* prac 4 ****************************************/
  // Authentication for manage exam /
  async LoginUser(req, res) {
    res.render('login')
  }

  // // check users account and set role session - if any /
  async CheckUser(req, res) {
    var name = req.body.name
    var pass = req.body.password

    // acc := entity.Account{Name: "nva", Pass: "123", Role: "staff"}
    var user = await userdal.GetUser(name, pass)
    if (user == null) {
      var errMessage = "Username or password is incorrect. Please try again !"
      // res.send(errorMessage)
      res.render('login',{Message:errMessage})
    } else {
        var authen = await userman.AuthenUser(user, name, pass)

        if (authen) {
          var session = req.session;

          // Generate a unique session ID
          let uuid = crypto.randomUUID();
          session.sessionID = uuid
          session.role = user.Role
          session.username = user.Name

          var job = session.job

          switch (job) {
          case "exam":
            // ListManageExam(c)
            res.redirect("/manage/list") //manage.GET("/list", controller.ListManageExam)
            break;
          case "user":
            // ListAllUser(c)
            res.redirect("/user/list") //user.GET("/list", controller.ListAllUser)
            break;
          case "data":
            // Ware(c)
            res.redirect("/data") //data.GET("/", controller.Ware)
            break;
          }
        } else {
          res.render('login', {Message: "Access denied. You do not have permission to this page!"})
        }
    }
  }

  // clearing current session /
  async LogoutUser(req, res) {
    req.session.destroy();
    dialognode.info('Your account had Sign Out.', '')
    res.redirect('/')   //go to Home
  }
}

const mancon = new ManageControl()
module.exports = mancon;
