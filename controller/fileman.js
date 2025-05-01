const fs = require('node:fs');
const path = require('path');

async function isDirectory(path) {  
	const stats = await fs.stat(path)  	
	return stats.isDirectory()
  }

// checking source folders: audio, image, text in project
// if existed: remove
function CleanFolder() {
	var dir_name = ["audio", "image", "text"]

	var curdir = process.cwd()
	for (const item of dir_name) {
		pathitem = path.join(curdir,item)
		if (fs.existsSync(pathitem)) {
			RemoveFolder(pathitem)
		}
	}
}	

// remove existed folder
function RemoveFolder(path_folder) {
	try {
		// delete directory recursively
		fs.rmSync(path_folder, { recursive: true });
		console.log("The directory is deleted.");
	  } catch (err) {
		console.error(err);
	  }
}

// copy all files from source folder to destination folder
function CopyFolder(src_path, dst_path) {
	// checking source path
	if (!fs.existsSync(src_path)) {
		console.log("directory not existing")
		return
	}

	// checking destination path
	if (!fs.existsSync(dst_path)) {
		fs.mkdirSync(dst_path, 0o744);
	} else {
		console.log("directory existed")
	}

	// copy all files in folder from src to des
    var files = fs.readdirSync(src_path)
    for (const file of files) {    
		var filename = file
		CopyFile(src_path, filename, dst_path)
	}
}

// copy file from source to destination
function CopyFile(sfolder, file, dfolder) {
	var soupath = sfolder
	var filename = file

	var source = soupath + "/" + filename
	var dst = dfolder
	var destination = dst + "/" + filename


	fs.copyFile(source,destination, (err) => {
        if (err) {
            console.log("Error copy:", err); //! Error Here
        }
    });
}

/****************************** prac 2 **************************************/
function GetRoot()  {
	return "C:\\data"
	// return "C:/data"
}

function GetKit()  {
	return "C:\\exam"
}

// create new folder
function MakeFolder(path_folder) {
	if (!fs.existsSync(path_folder)) {
		fs.mkdirSync(path_folder, 0o744);
	} else {
		console.log("directory existed")
	}
}

/****************************** prac 3 **************************************/

function GetWare() {
	return "C:\\ware"
}

module.exports = {isDirectory, CleanFolder, CopyFolder, CopyFile, RemoveFolder, GetRoot, GetKit, MakeFolder, GetWare};
