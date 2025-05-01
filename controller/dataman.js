  /*************************************** prac 3  **************************************************/

const fs = require('node:fs');
const path = require("path");
const skill = require('../entity/skill')
const part = require('../entity/part')
const test = require('../entity/test')
const fileman = require('../controller/fileman')
const questionman = require('../controller/questionman')


/** browse the skill directory tree then return skill obj **/
async function ReadDirSkill(root_data, skill_name) {
	// initial skill object
    var Skill = new skill.create(skill_name)

	var path_skill = root_data + "\\" + skill_name

    var nodes = fs.readdirSync(path_skill)  //list skill directory

    for (var node of nodes) { // browse skill directory
		var part_name = node
		var Part = new part.create("",part_name,"", 0)
		var path_part = path_skill + "\\" + part_name

        var items = fs.readdirSync(path_part)   // open part directory

        for (var cnode of items) {  // browse part directory                 
			var test_name = cnode
			var Test = new test.create(0,"","","",0,0)
            Test.Testname = cnode
			var path_test = path_part + "\\" + test_name

            var files = fs.readdirSync(path_test)   // open test directory

            for (var gnode of files) {  // browse test directory                 

				var file_name = gnode
                Test.ArrFile.push(file_name)    // build test
			}
            Part.ArrTest.push(Test) // build part
		}
        Skill.ArrPart.push(Part)    // build skill
	}

	return Skill
}

async function GetDirPart(skill, part_name) {
	var Part = new part.create(part_name)
	for (var item of skill.ArrPart) {
	// for _, item := range skill.ArrPart {
		if (item.Partname == part_name) {
			Part = item
			break
		}
	}
	return Part
}

/** save test to C:\\data in case create new or edit **/
async function SaveDirTest(skill_name, part_name, test_name, audio, image, text, arrQues, arrOpt, arrRes) {
	// get path to new test folder
	var path_test 
	if (test_name == undefined) {
		path_test = GetNewTest(skill_name, part_name) //new test
	} else {
		path_test = GetOldTest(skill_name, part_name, test_name) //edit test
		fileman.RemoveFolder(path_test)
	}

	fileman.MakeFolder(path_test)

	// get path to ware_house folder
	var ware_house = fileman.GetWare()

	// case for "listening": save file audio and image
	if (skill_name == "listening") {
		fileman.CopyFile(ware_house, audio, path_test)
		if (part_name == "Photographs") {
			fileman.CopyFile(ware_house, image, path_test)
		}
	}

	// create and write to file text.txt
	var textId = GetNewTestId(skill_name, part_name)
	var fileName = part_name + "_" + textId + "_text.txt"
	var filePath = path.join(path_test, fileName)
	fs.writeFileSync(filePath, text)
	//var ft = fs.writeFileSync(path_test + "\\text.txt", text)

	// create and write to file question.txt
	var f = fs.createWriteStream(path_test + "\\question.txt")

	// write to file question.txt
	var start = 0
	var jump = 4
	if (part_name == "Q&A") {
		jump = 3
	}
	var end = jump

	for (var i=0; i < arrQues.length; i++) {
		f.write("c-" + arrQues[i] + "\n")
		for (var j=start; j<end; j++) {
			f.write(arrOpt[j] + "\n")
		}
		start = end
		end = end + jump
		f.write("r-" + arrRes[i] + "\n")
		f.write("" + "\n")
	}

	f.close()
}

/** return path to new test will be created  **/
function GetNewTest(skill_name , part_name)  {
	var root_data = fileman.GetRoot()
	var path_part = root_data + "\\" + skill_name + "\\" + part_name

	// get max number of test folder
	var nodes= fs.readdirSync(path_part)

	var lastID = 0
	for (var node of nodes) {
		var test_name = node

		var pos = test_name.indexOf('_')
		var stestID = test_name.substring(0,pos)
		var testID = Number(stestID)
		if (lastID < testID){
			lastID = testID
		}
	}
	var sNewID = (lastID + 1).toString()
	var path_test = path_part + "\\" + sNewID + "_test"

	return path_test
}

/** Get text.txt ID **/
function GetNewTestId(skill_name , part_name)  {
	var root_data = fileman.GetRoot()
	var path_part = root_data + "\\" + skill_name + "\\" + part_name

	// get max number of test folder
	var nodes= fs.readdirSync(path_part)

	var lastID = 0
	for (var node of nodes) {
		var test_name = node

		var pos = test_name.indexOf('_')
		var stestID = test_name.substring(0,pos)
		var testID = Number(stestID)
		if (lastID < testID){
			lastID = testID
		}
	}
	var sNewID = (lastID).toString()

	return sNewID
}

/** return path to old test was be edited**/
function GetOldTest(skill_name, part_name, test_name) {
	var root_data = fileman.GetRoot()
	var path_test = root_data + "\\" + skill_name + "\\" + part_name + "\\" + test_name
	return path_test
}

// copy files in C:\data\<skill>\<part>\#_test to folder audio, image, text in folder project
async function CopyDirTest(skillname, path_test) {
	// set path folder audio, image, text in project
	var curr = process.cwd()

	var audio_curr = curr + "\\" + "audio"
	var image_curr = curr + "\\" + "image"
	var text_curr = curr + "\\" + "text"

	// get name of files in folder #_test
	var audioname 
	var imagename 
	var textname 

	var nodes= fs.readdirSync(path_test)

	for (var node of nodes) {
		if (node.includes("mp3")) {
			audioname = node
		} else {
				if (node.includes("png") || node.includes("jpg")) {
					imagename = node
			} else {
				if (node.includes("txt") && node.includes("text")) {
					textname = node
				}
			}
		}
	}

	/**** copy files from data to project ****/
	// remove audio, image, text folder in project if any
	fileman.CleanFolder()

	// copy file
	switch (skillname) {
	case "listening":
		fileman.MakeFolder(audio_curr)
		fileman.MakeFolder(image_curr)
		fileman.MakeFolder(text_curr)

		fileman.CopyFile(path_test, audioname, audio_curr);
		fileman.CopyFile(path_test, imagename, image_curr);
		fileman.CopyFile(path_test, textname, text_curr);
		break;

	case "reading":
		fileman.MakeFolder(text_curr)

		fileman.CopyFile(path_test, textname, text_curr)
	}
}

// add ArrQues, Audio, Image, Text for test entity
async function GetDirTest(path_test, Part, test_name ) {
	var Test = new test.create(0,"","","",0,0)
	Test.Testname = test_name

	for (var item of Part.ArrTest ) {
		if (item.Testname == test_name) {
			Test = item
			var orderQues = {val:0}
			var ques_data = path_test + "\\" + "question.txt"
			Test.ArrQues = await questionman.ReadQuestion(ques_data, orderQues, Test.Testid)

			// set Audio, Image, Text for test
			for (var pt of Test.ArrFile) {
				if (pt.includes("mp3")) {
					Test.Audio = pt
				} else {
					if (pt.includes("png") || pt.includes("jpg")) {
						Test.Image = pt
					} else {
						if (pt.includes("txt") && (pt.includes("text"))) {
							Test.Text = pt
							var path_text = path_test + "\\" + pt
							Test.CoText = GetContainText(path_text)
						}
					}
				}
			}
			break
		}
	}
	return Test
}

function GetContainText(path_file) {
	var con = ""

	var data = fs.readFileSync(path_file, 'UTF-8')

	while (data.includes("\r\n")) {
		data = data.replace("\r\n", "\n")
	}
	con = data

	return con
}

module.exports = {ReadDirSkill,GetDirPart,SaveDirTest,CopyDirTest,GetDirTest};
