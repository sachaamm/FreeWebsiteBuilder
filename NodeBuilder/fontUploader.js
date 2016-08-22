//FONT UPLOADER

var fs = require('fs');

var http = require('http');
var server = http.createServer();

var express = require('express');
var app = express();

var session = require('cookie-session'); // Charge le middleware de sessions

var fileUpload = require('express-fileupload');

// WALK
var walk    = require('walk');


// SET PUBLIC FOLDER CONTENT REACHABLE FOR CLIENT
app.use(express.static(__dirname + '/public'));

// FILES
var files   = [];
var lines   = [];

var folderName = 'public/fonts';
// Walker options
var walker  = walk.walk('./'+folderName, { followLinks: false });

// BUILD FILES DATA
walker.on('file', loadFontDirectory );
// WHEN FILES ARE BUILT WE BUILD THE CSS FILE WITH FONT-FACES
walker.on('end', onDirectoryLoaded );

// WALKER CALLBACKS
function loadFontDirectory(root, stat, next){
	 // Add this file to the list of files
    files.push(root + '/' + stat.name);
	lines.push(stat.name);
    next();
}

function onDirectoryLoaded(){
	console.log(files);	
	buildCssFile();
}

// BUILD FONT FACES
function buildCssFile(){
	
	var input="\n";
	input+="*{\n";
	input+="	font-family:"+giveAutomaticFontName(lines[0])+"\n}\n\n";

for(var i = 0 ; i < lines.length ; i++){
		
	input+="@font-face{\n";
	input+="	font-family:"+giveAutomaticFontName(lines[i])+";\n";
	input+="	src:url("+files[i].replace('public/','')+");\n}\n";

}

input+="\n";

fs.writeFileSync("public/design.css", input, "UTF-8");
		
}


function giveAutomaticFontName(fontFile){
	return fontFile.replace(/\..*$/,'');
}


var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres

var urlencodedParser = bodyParser.urlencoded({ extended: false });


// default options 
app.use(fileUpload());
app.use(session({secret: 'todotopsecret'}))

/* S'il n'y a pas de todolist dans la session,
on en crée une vide sous forme d'array avant la suite */
.use(function(req, res, next){
   // if (typeof(req.session.todolist) == 'undefined') {
        req.session.todolist = [];
    //}
    next();
	
})


/* On affiche la todolist et le formulaire */
.get('/allFonts', function(req, res) { 
    res.render('allFonts.ejs', {todolist: req.session.todolist});
	
	// BUILD FILES DATA
walker.on('file', loadFontDirectory );
// WHEN FILES ARE BUILT WE BUILD THE CSS FILE WITH FONT-FACES
walker.on('end', onDirectoryLoaded );
	
		console.log("Fonts loaded "+lines.length);

		for(var i = 0 ; i < lines.length ; i++){
			  req.session.todolist.push(lines[i].replace(/\..*$/,''));
		}
})



app.post('/upload', function(req, res) {
	
	 res.render('backToFontPage.ejs');
	
    var sampleFile;
 
    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }
 
    sampleFile = req.files.sampleFile;
	
	
	var replaceEmptySpace = sampleFile.name.replace(/ /g,"-");
	var cleanFileName = replaceEmptySpace.replace(/\./g,"-");
	
	console.log("clean File Name  :  " + cleanFileName);
	
	var arr = [];
    var str = cleanFileName
    var lg = str.length;
    arr[0] = str.charAt(lg-3);
    arr[1] = str.charAt(lg-2);
    arr[2] = str.charAt(lg-1);

    var type = arr.join("");

	console.log(" type "+ type);
	
	if(type == 'ttf' || type == 'otf' || type == 'TTF'){
		
		sampleFile.mv("public/fonts/"+replaceEmptySpace, function(err) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            console.log('File uploaded!');
        }
    });
			
		
	}

	
});

app.get('/upload', function(req, res) { 

  res.render('uploadForm.ejs');
	

})



.listen(8081);   