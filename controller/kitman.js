const fs = require('node:fs');
const path = require('path');

const examman = require('../controller/examman')
const skillman = require('../controller/skillman')
const fileman = require('../controller/fileman');
const { log } = require('node:console');
const examdal = require('../model/examdal')
const partdal = require('../model/partdal')
const testdal = require('../model/testdal')
const questiondal = require('../model/questiondal')
const partman = require('../controller/partman');
const e = require('express');

class KitController {
	async LoadTestKit(examID, root_kit) {
		//remove folders: audio, image, text if any
		fileman.CleanFolder()
	
		// return C:/exam/e#
		let exam_kit = examman.FindExam(examID, root_kit)
		// console.log(exam_kit)
		if (exam_kit != "") {
			let listnodes = fs.readdirSync(exam_kit)  //list e# directory	
	
			for (const node of listnodes) {
				let pathnode = path.join(exam_kit,node)
				let isDir = fs.statSync(pathnode).isDirectory()
				if(isDir){
					let skill_name = node
					let skill_kit = exam_kit + "/" + skill_name
					skillman.LoadSkill(skill_kit)
				}
			}
		}
	}
	
	// get data from database fetch into exam struct for testing
	async ListTestKit(examID) {
		var Exam = await examdal.ListExam(examID)
		if (Exam == null) {
			console.log("exam not existing")
		} else {
			// console.log("examid: " + Exam.Examid)
			
			// var Parts = []
			var Parts = await partdal.ListParts(examID)
			// console.log(Parts)
			Exam.ArrPart = Parts


			for (const Part of Parts) {				
				var Tests = await testdal.ListTests(Part.Partid)
				/** sorting array Tests if any*/ 
				Part.ArrTest = Tests
	
				for (const Test of Tests) {	
					var Questions = await questiondal.ListQuestions(Test.Testid)
					/** sorting array Questions if any*/ 
					Test.ArrQues = Questions
	
					for (const Question of Questions) {
						console.log("Questions: " + Question.Orderquestion)
						Question.ArrOpt = Question.StrOpt.split("#")

					} /** end for Questions */
					
				} /** end for Tests */
	
			} /** end for Parts */
	
		} /** end else */
		return Exam
	}	

	async ScoreTestKit(examID) {
		var Exam = await examdal.ListExam(examID)
		if (Exam == null) {
			console.log("exam not existing")
		} else {
			console.log("ScoreTestKit")
			console.log("examid: " + Exam.Examid)

			var Parts = await partdal.ListParts(examID)
			Exam.ArrPart = Parts

			for (const Part of Parts) {
				var rightAns = 0
				var Tests = await testdal.ListTests(Part.Partid)
				Part.ArrTest = Tests


				/** sorting array Tests if any*/ 

				for (const Test of Tests){					
					var Questions = await questiondal.ListQuestions(Test.Testid)
					Test.ArrQues = Questions

					/** sorting array Question if any*/ 

					rightAns =  partman.MarkPart(Questions, rightAns)
				}
				Part.Rightanswer = rightAns
				var ratio = (Part.Rightanswer / Part.Numquestion) * 100
				Part.Ratio = ratio.toFixed(0)
			}
		}
		return Exam
	}

  /*************************************** prac 2  **************************************************/
  // remove resource folders in project
	async RemoveTestKit(sid) {
		//remove folders: audio, image, text if any
		fileman.CleanFolder()

		/** remove folder C:\exam\e# **/
		var pathdir = "C:\\exam\\e" + sid
		if (fs.existsSync(pathdir)) {
			fileman.RemoveFolder(pathdir)
		}

		/** remove record in exam table by exam_id = sid **/
		var id = Number(sid)
		await examdal.RemoveExam(id)
		// model.RemoveExam(id)
	}

	// create resource folders and insert data to database for new exam test
	async BuildTestKit(root_data, root_kit) {
		// passing parameter "listening" or "reading"
		// skill_name := "listening"

		var arrSkill = ["listening", "reading"]
		// var arrSkill = ["listening"]


		for (var skill_name of arrSkill) {
			var skill_data = root_data + "\\" + skill_name

			// insert data into table exam
			var skill_kit = await  examman.BuildExam(root_kit, skill_name)
			var examID = await examdal.GetLastExam()

			var order_question = {val:0}	//variable type object

			console.log("BuildTestKit :" + skill_name)

			// build parts of a exam skill
			await partman.BuildPart(skill_name, skill_data, skill_kit, order_question, examID)
		}
	}

}

const kitcon = new KitController()
module.exports = kitcon;

// module.exports = {LoadTestKit, ListTestKit};

