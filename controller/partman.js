
const fs = require('node:fs');
const path = require('path');

const fileman = require('../controller/fileman')
const testman = require('../controller/testman')
const partdal = require('../model/partdal')

const part = require('../entity/part')

// copy contains of folder part Photographs to 3 folders: audio,image,text in project
function LoadPart(part_kit) {
    listnodes = fs.readdirSync(part_kit)  //list part directory

    var curr = process.cwd()

	for (const node of listnodes) {
		let pathnode = path.join(part_kit,node)
		let isDir = fs.statSync(pathnode).isDirectory()
		if (isDir) {
			folder_name = node
			src_path = part_kit + "/" + folder_name
			dst_path = curr + "/" + folder_name
			fileman.CopyFolder(src_path, dst_path)
		}
	}
}

// return number of question with right answer
function MarkPart(arrQues, rAns) {
	for (const ques of arrQues){
		if (ques.Answer == ques.Result) {
			rAns = rAns + 1
		}
	}
	return rAns
}

/******************************************* prac 2 **************************************/
// create record part in database and folder Photographs in folder C:\exam\e29\listening
async function BuildPart(skill_name, skill_data, skill_kit, order_question, exam_id) {
	// var skillname = skillman.GetSkillByEnd(skill_data)
	var arrPart = []

	switch (skill_name) {
	case "listening":
		partsOfSkill = [{Partname: "Photographs", Numquestion: 6},
			{Partname: "Q&A", Numquestion: 6},
			{Partname: "Conversations", Numquestion: 12},
			{Partname: "Talks", Numquestion: 12}];
		break;
	case "reading":
		partsOfSkill = [{Partname: "Sentences", Numquestion: 6},
			{Partname: "Text", Numquestion: 16},
			{Partname: "Comprehension", Numquestion: 8}];
	}


	for (var item of partsOfSkill) {
		var part_name = item.Partname
		var num_question = item.Numquestion
		var num_test = testman.GetNumTest(part_name, num_question)

		var part_data = skill_data + "\\" + part_name

		/** CREATE DATABASE FOR PART*/
		var Part = new part.create("", part_name, num_question, exam_id)
		await partdal.InsertPart(Part)
		var partID = await partdal.GetLastPart()

		/** CREATE DIRECTORY FOR EXAM */
		// make new folder c:\exam\e1\listening\Photographs
		var part_kit = skill_kit + "\\" + part_name
		if (!fs.existsSync(part_kit)) {
			fs.mkdirSync(part_kit, { recursive: true });
			console.log("BuildPart :" + item)
		} else {
			console.log("directory " + item + " existed")
		}	


		// listing folder #_test in folder Photographs
		var order_test = 1
		var rand_size = 20 // 20 folder test in folder Photographs
		var arrIndex = []	// array of #_test is seleted in 20 test 
		while (order_test <= num_test) {
			var index_test = GetRandom(arrIndex, rand_size)
			await testman.BuildTest(part_data, part_kit, index_test, order_test, order_question, partID)
			order_test = order_test + 1
		}
	}
}

// return number is created random from 1 to 20
function GetRandom(arrIndex, rand_size) {
	var stop = false
	var index 

	while (!stop) {		
		index = Math.floor(Math.random() * (rand_size - 1)) + 1
		if (arrIndex.length == 0 || !SearchIndex(arrIndex, index)) {
			arrIndex.push(index)
			stop = true
		}
	}
	return index
}

// checking number is existed in arrIndex before
function SearchIndex(arrIndex, index) {
	var find = false

	for (var i of arrIndex) {
		if (index == i) {
			find = true
			break
		}
	}

	return find
}

function getRandInt(min, max){
    min = Math.ceil(min)
    max = Math.floor(max)
  
    return Math.floor(Math.random() * (max - min)) + min  
}


module.exports = {LoadPart, MarkPart, BuildPart, getRandInt};
