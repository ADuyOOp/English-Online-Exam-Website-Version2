const examdal = require('../model/examdal')
const kitman = require('../controller/kitman')
const skilldal = require('../model/skilldal')
const questiondal = require('../model/questiondal')
const questionman = require('../controller/questionman')
const fileman = require('../controller/fileman')
const userman = require('../controller/userman')


class ExamControl {
  //constructor for calling fuction in the same class
  constructor() {
    this.getUsername = this.getUsername.bind(this);
    this.ListAllExam = this.ListAllExam.bind(this);
    this.LoadExam = this.LoadExam.bind(this);
    this.ListExam = this.ListExam.bind(this);
    this.ScoreExam = this.ScoreExam.bind(this);
    this.ReviewExam = this.ReviewExam.bind(this);

    this.ListAllExam2 = this.ListAllExam2.bind(this); // new

  }

  //Get username from session
  async getUsername(req) {
    // var session = req.session;
    // var sessionID = session.sessionID
    // if (sessionID == undefined) {
    //     var username = ''
    // }else{
    //     var username = session.username
    // }
    // return username

    var session = req.session;
    if (!session || session.sessionID == undefined) {
        return ''
    } else {
        return session.username
    }
  }

  async ListAllExam(req, res){
      var arrExam = await examdal.ListAllExam()
      var username = await this.getUsername(req) //get username from session
      if(arrExam != null){
        res.render('listall',{earr:arrExam, Username:username})
      }
    }
    
  async ListAllExam2(req, res){
    var username = await this.getUsername(req) //get username from session
    res.render('writing',{Username:username})
  }   

  async LoadExam(req, res){
      const sid = req.params['id']

      const root_kit = "c:/exam"
      kitman.LoadTestKit(sid, root_kit)     /**copy folder audio, image, text from C:\data to project */

      var Exam = await examdal.ListExam(sid)
      var skillid = await skilldal.GetSkillID(sid)
      var skillname = await skilldal.GetSkillName(skillid)
      var username = await this.getUsername(req) //get username from session


      res.render('load',{exam:Exam, skillname: skillname, Username:username})
  }      

  async ListExam(req, res){
    var sid = req.params['id']
    sid = Number(sid)

    /***** coding for POST (click 'end' button): values fetched *****/
    var mess =  req.body.mess
    console.log('mess: ' + mess)

    var arrQID =  req.body.sqid
    console.log(arrQID)

    var arrQOD =  req.body.sqod
    console.log(arrQOD)

    if (arrQOD != null){
      //// update answers from list.js to database WHEN BUTTON END CLICKED ////
      for (var i=0; i<arrQOD.length; i++){
        var ans = arrQOD[i]   // get answer from list.js
        var soq = i + 1       // order of question
        var qid = await questionman.SearchQID(arrQID, soq) // identify question_id that has order question respectively in database
        if (qid != 0) {
          await questiondal.UpdateQuestion(qid, ans) // update column ans of question_id that gave
        }
      }
    }
    /***** coding for POST (click 'end' button): values fetched *****/

    var username = await this.getUsername(req) //get username from session

    /***** coding for GET (testing) *****/
    var Exam = await kitman.ListTestKit(sid)
    var countTime = Exam.Duration //unit by minute
    res.render('list',{Exam:Exam, countTime:countTime,Username:username})  
  }

  async ScoreExam(req, res){
    // Using with /exam/score/:id
    var sid = req.params['id']
    var id = Number(sid)

    var Exam = await kitman.ScoreTestKit(id)

    // res.send(Exam)
    var username = await this.getUsername(req) //get username from session
    res.render('score',{Exam:Exam, Username:username})
  }

  async ListExamBySkill(req, res) {
    var skill = req.body.skill
    var id = Number(skill)

    var arrExam = []
    switch (id) {
    case 3:
      arrExam = await examdal.ListAllExam(); break;
    case 1:
      arrExam = await examdal.ListExamBySkill(1); break;
    case 2:
      arrExam = await examdal.ListExamBySkill(2); break;
    }

    // res.send(arrExam)
    res.render('listall',{earr:arrExam})
  }

  /**** review result exam - read only ****/
  async ReviewExam(req, res){
    // Using with /exam/review/:id
    var sid = req.params['id']
    var id = Number(sid)

    var Exam = await kitman.ListTestKit(id)

    // res.send(Exam)
    var username = await this.getUsername(req) 
    res.render('review',{Exam:Exam, Username:username})
  }

  /*************************************** prac 2  **************************************************/
  /**** remove resource folders of exam come out project ****/
  async RemoveExam(req, res) {
    /********************* prac 2 **************************/   
    // // Using with /exam/remove/:id
    // var sid = req.params['id']
    // await kitman.RemoveTestKit(sid)      
    // // res.send({message:"exam " + sid + " has deleted successfully"})
    // res.redirect('/manage/list')

    /********************* prac 4 **************************/      
    var createrole = ["staff", "admin"]
    var session = req.session;
    var sessionID = session.sessionID
    if (sessionID == undefined) {
      session.job = "exam"
      var Message = "Sign in. Please !"
      // res.send(errMessage)
      res.render('login',{Message:Message}) //to user.GET("/login", user.LoginUser)
    } else {
      var author = await userman.AuthorUser(req, createrole)
      if (author) {
        var sid = req.params['id']
        await kitman.RemoveTestKit(sid)      
        // res.send({message:"exam " + sid + " has deleted successfully"})
        res.redirect('/manage/list')
      } else {
          dialognode.warn('Access denied.!', '')
      }
    }    
  }

  /**** create new e# exam ****/
  async CreateExam(req, res) {
    /********************* prac 2 **************************/    
    // var root_data = fileman.GetRoot() // path to C:\data
    // var root_kit = fileman.GetKit()   // path to C:\exam
    // await kitman.BuildTestKit(root_data, root_kit)
    // res.redirect('/manage/list')

    /********************* prac 4 **************************/      
    var createrole = ["staff", "admin"]
    var session = req.session;
    var sessionID = session.sessionID
    if (sessionID == undefined) {
      session.job = "exam"
      var Message = "Sign in. Please !"
      // res.send(errMessage)
      res.render('login',{Message:Message}) //to user.GET("/login", user.LoginUser)
    } else {
      var author = await userman.AuthorUser(req, createrole)
      if (author) {
        var root_data = fileman.GetRoot() // path to C:\data
        var root_kit = fileman.GetKit()   // path to C:\exam
        await kitman.BuildTestKit(root_data, root_kit)
        res.redirect('/manage/list')
      } else {
          dialognode.warn('Access denied.!', '')
      }
    }    
  }
}

const examcon = new ExamControl()
module.exports = examcon;

