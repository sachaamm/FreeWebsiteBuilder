//FONT UPLOADER
var fs = require("fs"),
    path = require("path");
	
	//var path = require('path');
	
  
var http = require('http');
var server = http.createServer();

var express = require('express');
var app = express();

var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var fileUpload = require('express-fileupload');

// ASYNC
var async = require('async');



// FIRST WE HAVE TO SETUP EXPRESS
app.use(express.static(__dirname + '/public')); // SET PUBLIC FOLDER CONTENT REACHABLE FOR CLIENT
app.use(fileUpload()); //  ENABLE EXPRESS UPLOAD
app.use(session({secret: 'todotopsecret'})) // ENABLE SESSION

var folderName = 'public/myProjects/';

var projectNames = [];
var projectName;
var indexDeletion;

var rootName = '/home';


var p = 'public/myProjects'; // PATH TO PROJECTS
var pathToProjectPages = '';


var projectPages = [];
var projectPath;


/*
fs.readdir(p, buildProjects );
fs.readdir(p, buildProjectTree );
*/		



function buildProjectTree(req,res){
	
    //req.session.projects = [];
	
	console.log("Render Page with " + projectNames.length+ " Projects ");
	
	for(var i = 0 ; i < projectNames.length ; i++){ 
    		 req.session.projects.push(projectNames[i]);		  
	}
	
	
}




// DISPLAY FONTS AVAILABLE
app.get(rootName, function(req, res) { 


var files = fs.readdirSync(p);
projectNames  = [];

for(var i in files) {
	
	if(fs.statSync("public/myProjects/"+files[i]).isDirectory())projectNames.push(files[i]);

}


    req.session.projects = [];
	
	
	for(var i = 0 ; i < projectNames.length ; i++){ 
    		 req.session.projects.push(projectNames[i]);		  
	}
	
	console.log("Render Page with " + projectNames.length+ " Projects ");
	
	

	// WE LOAD ALL PROJECTS AVAILABLE
	res.render('nodeBuilder/home.ejs', {projects: req.session.projects});
    

});

// PREPARE NEW PROJECT CREATION
app.get('/newProject', function(req, res) { 

	res.render('nodeBuilder/newProject.ejs');

});

// CREATE NEW PROJECT
app.post('/createProject', function(req, res ) { 

	projectName = req.body.projectName;

	projectPages = [];

	
	if (!fs.existsSync(projectName)){

		console.log("PROJECT CREATION");
	
	    fs.mkdirSync("public/myProjects/" + projectName);

		fs.mkdirSync("public/myProjects/" + projectName + "/pages");
		fs.mkdirSync("public/myProjects/" + projectName + "/style");
		fs.mkdirSync("public/myProjects/" + projectName + "/style/fonts");
		var stream = fs.createWriteStream("public/myProjects/" + projectName + "/style/design.css");
		stream.once('open', function(fd) {
		stream.end();
		});
		
		
		//fs.readdirSync(p, getDirectories );
		
		
	    res.redirect(rootName);
	 
		}else{
		
		console.log(" Project Already Exist " + projectName);
		res.redirect('newProject');

	}

});

app.get('/prepareDeletion/:id',function(req, res ) { 

indexDeletion = req.params.id;
res.render('nodeBuilder/prepareDeletion.ejs',{ value: req.session.projects[req.params.id] } );

});

app.get('/delete',function(req, res ) { 

  if (indexDeletion) {
	      
			removeFolder("public/myProjects/" + req.session.projects[indexDeletion]);
	
			console.log("delete project");
			
		    req.session.projects.splice(req.params.id, 1);
		    projectNames.splice(req.params.id, 1);
				
  }
	
    res.redirect('/home');

});


app.get('/editProject/:projectName',function(req, res ) { 

  req.session.pages = [];
  //projectPages = [];
	  projectPath = "public/myProjects/" + req.params.projectName + "/pages/" ;
	
  
  
  
var files = fs.readdirSync(projectPath);
projectPages  = [];


for(var i in files) {
	
	if(fs.statSync(projectPath + files[i]).isFile())projectPages.push(files[i]);

}



  
 // fs.readdirSync(projectPath, getPages );
  
  
  
  
  
  
  
  
  
  
  console.log("projectPages length " + projectPages.length);
  
  	for(var i = 0 ; i < projectPages.length ; i++){ 
    		 req.session.pages.push(projectPages[i]);		  
	}
 
  res.render('nodeBuilder/editProject.ejs',{ projectName: req.params.projectName , pages: req.session.pages } );
  
  
});

app.get('/editProject/:projectName/addPage',function(req, res ) { 

  res.render('nodeBuilder/addPage.ejs',{ projectName: req.params.projectName } );
  
});

app.post('/editProject/:projectName/createPage',function(req, res ) { 

  
  //create Page
  	pageName = req.body.pageName;
	
	var pagePath = "public/myProjects/" + req.params.projectName + "/pages/";

	var fileName = pageName + ".sg";
	var finalName = pagePath + fileName;

		
			if (!fs.existsSync(finalName)){

			console.log("Create New Page.");
			var stream = fs.createWriteStream( finalName );
			stream.once('open', function(fd) {
			stream.end();
		
            res.redirect('/editProject/'+req.params.projectName);
			
			projectPages.push(pageName);


			});
			
			
			
			}


});


app.listen(8080);   





function removeFolder(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
       removeFolder(curPath,null);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}






function getDirectories (err, files) {


	if (err) {
        throw err;
    }

    files.map(function (file) {
        return path.join(p, file);
    }).filter(function (file) {
        return fs.statSync(file).isDirectory();
    }).forEach(function (file) {
        console.log("%s (%s)", file, path.basename(file));
		projectNames.push(path.basename(file));
		
    });
}

































var loadProjects = function(callback){
	
	projectNames = [];
	
	var log = "Load Projects";
	console.log(log);
	
	
	callback(null,log);
	
	
}

var buildProjectData = function(callback){
	
	
	var log = "Build Projects";
	
	fs.readdir(p, getDirectories );

	
	console.log(log);
	
	
	
	callback(null,log);
	
	
	
}










function buildProjects(res,callback) {
	var stack = [];
	stack.push(loadProjects);
	stack.push(buildProjectData);
	
	async.parallel(stack, 
	function(err,log){
		console.log(log);
	});
	
	//console.log("Render Page with " + projectNames.length+ " Projects ");

	
	
}




