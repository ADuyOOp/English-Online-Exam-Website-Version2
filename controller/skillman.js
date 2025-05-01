
const fs = require('node:fs');
const path = require('path');

const partman = require('../controller/partman')

// Listing folder skill-listing in folder C:\exam\e#
function LoadSkill(skill_kit) {
	var listnodes = fs.readdirSync(skill_kit)  //list skill directory

	for (const node of listnodes) {
		let pathnode = path.join(skill_kit,node)
		let isDir = fs.statSync(pathnode).isDirectory()
		if (isDir) {
			part_name = node
			part_kit = skill_kit + "/" + part_name
			partman.LoadPart(part_kit)
		}
	}
}

module.exports = {LoadSkill};
