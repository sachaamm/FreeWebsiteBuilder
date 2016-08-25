//FONT UPLOADER
var fs = require("fs");

var http = require('http');
var server = http.createServer();

var express = require('express');
var app = express();

var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var fileUpload = require('express-fileupload');

// WALK
var walk = require('walk');
// ASYNC
var async = require('async');

// FILES
var files   = [];
var lines   = [];
// ALLOWED FORMATS
var allowedFormats = ['ttf','otf','TTF','OTF'];
var query = 'fonts';
var folderName = 'public/'+query;

// Walker options
var walker  = walk.walk('./'+folderName, { followLinks: false });

// FIRST WE HAVE TO SETUP EXPRESS
app.use(express.static(__dirname + '/public')); // SET PUBLIC FOLDER CONTENT REACHABLE FOR CLIENT
app.use(fileUpload()); //  ENABLE EXPRESS UPLOAD
app.use(session({secret: 'todotopsecret'})) // ENABLE SESSION

// AND THEN , WE CAN CALL THE LOADING PARALLEL THREAD
walker.on('file', buildElements ); // WHEN WALKER IS READY , WE LOAD THE LOADING PARALLEL THREAD



		

// DISPLAY FONTS AVAILABLE
app.get('/allFonts', function(req, res) { 

	console.log("Fonts loaded "+lines.length);
    req.session.todolist = [];
	req.session.allowedFormats = [];

		for(var i = 0 ; i < lines.length ; i++){
			  if(query == 'fonts')req.session.todolist.push(lines[i].replace(/\..*$/,''));
			  if(query == 'pictures')req.session.todolist.push(lines[i]);
			  
		}
		
		
		for(var i = 0 ; i < allowedFormats.length ; i++){
			req.session.allowedFormats.push(allowedFormats[i]);
		}

	
		res.render('allFonts.ejs', {todolist: req.session.todolist});

		
		
		
})

app.get('/uploadConfirmation', function(req, res) { 

	// WHEN WE RELOAD PAGE , WE UPDATE FILE LIST (maybe just add the new element in the lines array should be better)
	walker  = walk.walk('./'+folderName, { followLinks: false });
	walker.on('file', loadFontDirectory );
	walker.on('end', onDirectoryLoaded );
	res.redirect('/allFonts');

})


// REMOVE ONE FONT FILE
app.get('/allFonts/deleteFont/:id', function(req, res) {
	
	var parseId = parseInt(req.params.id,10);
			  		  
    if ( req.params.id != '' && parseId ) {
		
		// CODER EN ASYNCHRONE ;)	
			fs.unlink(files[req.params.id],function(err){
		
		if(err){
			console.log("Unable to delete this file.");
			return;
		}else{
			
			console.log("Index to delete :" + req.params.id);
			req.session.todolist.splice(req.params.id, 1);

			files.splice(req.params.id, 1);
			lines.splice(req.params.id, 1);
	  
		}
		
	});
		
    }
    res.redirect('/allFonts');
})

// UPLOAD FORM
app.get('/upload', function(req, res) { 

  res.render('uploadForm.ejs');
	
})

// UPLOAD FILE
app.post('/upload', function(req, res) {
	
	
    var sampleFile;
 
    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }
 
    sampleFile = req.files.sampleFile;

	var replaceEmptySpace = sampleFile.name.replace(/ /g,"-");
	var cleanFileName = replaceEmptySpace.replace(/\./g,"-");
	
	console.log("clean File Name  :  " + cleanFileName);

	var type = getType(cleanFileName);

	console.log(" type "+ type);
	
	if( isValidType(type) ){
		
		sampleFile.mv("public/fonts/" + replaceEmptySpace , function(err) {
        if (err) {
            res.status(500).send(err);
        }
        else {
			
			res.render('backToFontPage.ejs');
	
            console.log('File uploaded!');
			// WHEN WE RELOAD PAGE , WE UPDATE FILE LIST (maybe just add the new element in the lines array should be better)
	        walker  = walk.walk('./'+folderName, { followLinks: false });
	        walker.on('file', buildElements );
        }
    });
			
	}else{
		
		res.render('illegalFormat.ejs',{todolist: req.session.allowedFormats});
		
	
		
	}
	
});


	
app.listen(8081);   



///////////////////
////
// ASYNC PARALLEL


var initFontBuild = function(callback){
	var log = "Init";
	console.log(log);
	
	files   = [];
    lines   = [];
	
	app.use(session({secret: 'todotopsecret'}))
	
	app.use(function(req, res, next){
   // if (typeof(req.session.todolist) == 'undefined') {
        req.session.todolist = [];
		//req.session.allowedFormats = [];
    //}
    next();
	
    })

	walker  = walk.walk('./'+folderName, { followLinks: false });

	callback(null,log);
}
// LOAD FONTS
var loadFonts = function(callback){
	var log = "Load Fonts";
	console.log(log);
	
	walker.on('file', loadFontDirectory );
	callback(null,log);
}
// BUILD FILES
var buildFiles = function(callback){
	var log = "Build Files";
	console.log(log);
	
	walker.on('end', onDirectoryLoaded );
	callback(null,log);
}


function buildElements(callback) {
	var stack = [];
	stack.push(initFontBuild);
	stack.push(loadFonts);
	stack.push(buildFiles);
	
	async.parallel(stack, 
	function(err,log){
		console.log(log);
	});
}


//////////////////////////////
///
// WALKER CALLBACKS

function loadFontDirectory(root, stat, next){
	 // Add this file to the list of files
    files.push(root + '/' + stat.name);
	lines.push(stat.name);
    next();
}

function onDirectoryLoaded(){
	console.log(files);	
	console.log(lines);
	if(query == 'fonts')buildCssFile();
}

/////////////////////////////	
// BUILD FONT FACES
function buildCssFile(){
	
	var input="\n*{\n	font-family:"+giveAutomaticFontName(lines[0])+"\n}\n\n";

	for(var i = 0 ; i < lines.length ; i++){
	input+="@font-face{\n	font-family:"+giveAutomaticFontName(lines[i])+";\n	src:url("+files[i].replace('public/','')+");\n}\n";
	}

	input+="\n";
	fs.writeFileSync("public/design.css", input, "UTF-8");	
}


function giveAutomaticFontName(fontFile){
	return fontFile.replace(/\..*$/,'');
}


function getType(fileName){
    
	var arr = [];
    var str = fileName;
    var lg = str.length;
    arr[0] = str.charAt(lg-3);
    arr[1] = str.charAt(lg-2);
    arr[2] = str.charAt(lg-1);

    var type = arr.join("");
	return type;
	
}

function isValidType(type){
	
	for(var i = 0 ; i < allowedFormats.length ; i++) {
		
		if(type == allowedFormats[i])return true;
	}
	
	return false;
}


