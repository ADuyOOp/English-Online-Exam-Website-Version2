const fs = require('node:fs');
const path = require('path');
const exam = require('../entity/exam')
const examdal = require('../model/examdal')

function FindExam(examID , root_kit)  {
	var exam_kit 
    var listnodes = fs.readdirSync(root_kit)  //list exam directory
    // console.log(listnodes)

	for (const node of listnodes) {
        let pathnode = path.join(root_kit,node)
        let isDir = fs.statSync(pathnode).isDirectory()
        if(isDir){
            let exam_name = node + "";
            let seID = exam_name.slice(1)       //cut 'e' from 'e#'
            let eID = Number(seID)              // convert string to number
            if(eID == examID){
                // exam_kit = root_kit + "/" + exam_name
                exam_kit = path.join(root_kit,exam_name)
				break
            }
        }
    }

	return exam_kit
}

/*********************************** prac 2 ***********************************/
// create and return folder c:\exam\e1\listening
async function BuildExam(root_kit, skill_name) {
	var total_question 
	var durarion 
	var skillID 

	switch (skill_name) {
	case "listening":
		total_question = 36
		durarion = 40
		skillID = 1
		break;

	case "reading":
		total_question = 30
		durarion = 35
		skillID = 2
	}

	// insert to exam table
	var Exam = new exam.create("",total_question, durarion, skillID)
	await examdal.InsertExam(Exam)

	// make new folder c:\exam\e1\listening
	var examID = await examdal.GetLastExam()
	var exam_name = "e" + examID
	var skill_kit = root_kit + "\\" + exam_name + "\\" + skill_name
    if (!fs.existsSync(skill_kit)) {
		fs.mkdirSync(skill_kit, { recursive: true });
	} else {
		console.log("directory existed")
	}

	return skill_kit
}

module.exports = {FindExam, BuildExam};
