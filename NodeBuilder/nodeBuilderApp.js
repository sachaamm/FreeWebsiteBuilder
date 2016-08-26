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

// FIRST WE HAVE TO SETUP EXPRESS
app.use(express.static(__dirname + '/public')); // SET PUBLIC FOLDER CONTENT REACHABLE FOR CLIENT
app.use(fileUpload()); //  ENABLE EXPRESS UPLOAD
app.use(session({secret: 'todotopsecret'})) // ENABLE SESSION

var folderName = 'public/myProjects/';


// Walker options
var walker  = walk.walk('./'+folderName, { followLinks: false });
walker.on('end', showProjects ); // WHEN WALKER IS READY , WE BUILD THE PROJECTS TREE


var projectNames = [];
var projectName;

var rootName = '/home';




// DISPLAY FONTS AVAILABLE
app.get(rootName, function(req, res) { 

    req.session.projects = [];
	
	console.log("Render " + projectNames.length+ " Projects ");
	
	for(var i = 0 ; i < projectNames.length ; i++){ 
    		 req.session.projects.push(projectNames[i]);		  
	}
	
	console.log("Project Names length " + projectNames.length );
	
	// WE LOAD ALL PROJECTS AVAILABLE
	res.render('nodeBuilder/home.ejs', {projects: req.session.projects});

});

// PREPARE NEW PROJECT CREATION
app.get('/newProject', function(req, res) { 

	res.render('nodeBuilder/newProject.ejs');

});

// CREATE NEW PROJECT
app.post('/createProject', function(req, res) { 

	projectName = req.body.projectName;

	if (!fs.existsSync(projectName)){

		
		//
	
      
		walker  = walk.walk('./'+folderName, { followLinks: false });
		walker.on('directories', getProjects ); // WHEN WALKER IS READY , WE BUILD THE PROJECTS TREE

		res.redirect(rootName);
	

		}else{
		
		console.log(" Project Already Exist " + projectName);
		res.redirect('newProject');

	}

});

	
app.listen(8080);   





// INIT PROJECT TREE --> CLEAR PROJECTNAMES ARRAY AND CLEAR SESSION
var initProjectTree = function(callback){
	
	//fs.mkdirSync("public/myProjects/"+projectName);

	  
	var log = "Init Project Tree";
	console.log(log);

	//walker.on('directories', getProjects );
	callback(null,log);
}
// PUT PROJECT NAMES IN PROJECTS.SESSION --> PUT PROJECTNAMES ARRAY INPUT  in SESSION
var putProjectsNamesInSession = function(callback){
	var log = "Build Project Tree";
	console.log(log);
	
	//walker  = walk.walk('./'+folderName, { followLinks: false });
	//walker.on('directories', getProjects );

	callback(null,log);
}

// SHOW PROJECTS
function showProjects(callback) {
	var stack = [];

	stack.push(initProjectTree);
	stack.push(putProjectsNamesInSession);
	
	async.parallel(stack, 
	function(err,log){
		console.log(log);
	});
}


// WALKER FUNCTION
function getProjects(root, dirStatsArray, next) {
	
	console.log("Add Content");
	
	for(var i = 0 ; i < dirStatsArray.length ; i++){	
		console.log(dirStatsArray[i].name);
	    projectNames.push(dirStatsArray[i].name);
	}

    next();
} 
