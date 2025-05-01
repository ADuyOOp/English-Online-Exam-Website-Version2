const questiondal = require('../model/questiondal')

const fs = require('node:fs');
const question = require('../entity/question')

/**** search question_id in array question_id within order question is soq ****/
async function SearchQID(arrQID , soq)  {
	var qid = 0

  for (const item of arrQID){
    var qid = Number(item)
    qid = await questiondal.FindQuestion(qid, soq)
    if (qid != 0) {
			break
		}
  }
	return qid
}  

/*********************************************** prac 2 ***********************************************/

// Insert record to question table from file text #_question.txt
	//test_data = C:\\data\listerning\\Photographs\\#_test
	//questionname = #_question.txt
async function BuildQuestion(test_data, questionname, order_question, testID) {

	// read file text then return array Question
	var ques_data = test_data + "\\" + questionname
	var arrQue = await ReadQuestion(ques_data, order_question, testID)

	//insert record from arrQue struct to question table
  	for (var que of arrQue){
		console.log("BuildQuestion :" + que)
		await questiondal.InsertQuestion(que)
	}
}

// return array Question form file text #_question.txt
async function ReadQuestion(ques_data, order_question, testID) {
	// convert content of file text become to array text
  	var arrLine = fs.readFileSync(ques_data).toString().split("\n");

	var con = ""
	var opt = ""
	var res = ""
	var arrQue = []

	for (var line of arrLine) {

		if (line.includes("c-")) {
			var pos = line.indexOf('-')
			line = line.substring(pos+1, line.length)
			con = line
		} else {
			if (line.includes("r-")) {
				var pos = line.indexOf('-')
				line = line.substring(pos+1, line.length)  
				res = line

				order_question.val = order_question.val + 1
				var arrOpt = opt.split("#")
				var que = new question.create(0, con, opt, res, order_question.val, testID, "")
				que.ArrOpt = arrOpt
				arrQue.push(que)

				con = ""
				opt = ""
				res = ""

			} else {
				// arrOpt = append(arrOpt, line)
				if (opt == "") {
					opt = line
				} else {
					opt = opt + "#" + line
				}
			}
		}
	}
	return arrQue
}


module.exports = {SearchQID, BuildQuestion, ReadQuestion};
