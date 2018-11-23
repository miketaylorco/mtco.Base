//Version 2.0.2

//88b           d88                        88               88                         
//888b         d888                        88               88                         
//88`8b       d8'88                        88               88                         
//88 `8b     d8' 88   ,adPPYba,    ,adPPYb,88  88       88  88   ,adPPYba,  ,adPPYba,  
//88  `8b   d8'  88  a8"     "8a  a8"    `Y88  88       88  88  a8P_____88  I8[    ""  
//88   `8b d8'   88  8b       d8  8b       88  88       88  88  8PP"""""""   `"Y8ba,   
//88    `888'    88  "8a,   ,a8"  "8a,   ,d88  "8a,   ,a88  88  "8b,   ,aa  aa    ]8I  
//88     `8'     88   `"YbbdP"'    `"8bbdP"Y8   `"YbbdP'Y8  88   `"Ybbd8"'  `"YbbdP"'  

//Node-----------------------------------------
var fs = require('fs');
var path = require('path');
var del = require('del');
//Gulp-----------------------------------------
var gulp = require('gulp');
//General Use----------------------------------
var rename = require('gulp-rename');
var gulpif = require('gulp-if');
var tap = require('gulp-tap');
var merge = require('merge-stream');
var newer = require('gulp-newer');
//Templating-----------------------------------
var nunjucks = require('gulp-nunjucks');
var nunjucksModule = require('nunjucks');
var fm = require('front-matter');
var frontMatter = require('gulp-front-matter');
var htmlmin = require('gulp-htmlmin');
//Style/Script---------------------------------
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
//Server---------------------------------------
var bs = require('browser-sync').create();


//8b           d8                        88              88           88                         
//`8b         d8'                        ""              88           88                         
// `8b       d8'                                         88           88                         
//  `8b     d8'  ,adPPYYba,  8b,dPPYba,  88  ,adPPYYba,  88,dPPYba,   88   ,adPPYba,  ,adPPYba,  
//   `8b   d8'   ""     `Y8  88P'   "Y8  88  ""     `Y8  88P'    "8a  88  a8P_____88  I8[    ""  
//    `8b d8'    ,adPPPPP88  88          88  ,adPPPPP88  88       d8  88  8PP"""""""   `"Y8ba,   
//     `888'     88,    ,88  88          88  88,    ,88  88b,   ,a8"  88  "8b,   ,aa  aa    ]8I  
//      `8'      `"8bbdP"Y8  88          88  `"8bbdP"Y8  8Y"Ybbd8"'   88   `"Ybbd8"'  `"YbbdP"'  

//Retrieve config settings, set to local vars instead of having config.var everywhere
var config = require('./settings/gulpfile.config.js');

var addSourcemaps = config.addSourcemaps;
var addStyleguide = config.addStyleguide;
var absoluteFiles = config.absoluteFiles;
var paths = config.paths;
var headScripts = config.headScripts;
var bodyScripts = config.bodyScripts;
var assetPath = config.assetPath;
var serverSettings = config.serverSettings;
var autoprefixSettings = config.autoprefixSettings;
var minifyHTMLOptions = config.minifyHTMLOptions;
var cssnanoSettings = config.cssnanoSettings;


//Nunjucks Environment variables
var nunjucksLoader = new nunjucksModule.FileSystemLoader(paths.src.templates, {noCache: true});
var nunjucksEnv = new nunjucksModule.Environment(nunjucksLoader, {autoescape: false});
//Nunjucks:all task ignore folders, cache variable here for performance
var nunjucksAllIgnore = '!'+paths.src.templates+'/@(_includes|_layouts|_style)/*';
if(addStyleguide) {
	nunjucksAllIgnore = '!'+paths.src.templates+'/@(_includes|_layouts)/*';
}
//Cacluate path back to the root directory
var pathToRoot = path.join(__dirname, paths.src.templates);
//Relative/Absolute file paths
var relativeRoot="", pathFromRoot="";
//All navigation JSON
var navigation = updateNav();
var stylenav = updateStyleNav();
//All local YAML data in JSON
var allLocalJSON = dirTree(paths.src.templates, true);
var allLocalStyleJSON = dirTree(paths.src.styleFolder);
//Create falttened navigation JSON
var flatNavigation = flattenNav(navigation);
var flatStyleNavigation = flattenNav(stylenav, true);
//Create absolute files src array used for watch task
var absoluteFilesSrcArray = [];
for(var i=0;i<Object.keys(absoluteFiles).length;i++) {
	absoluteFilesSrcArray[i] = absoluteFiles[i].src;
}


// 888888888888                    88                    
//      88                         88                    
//      88                         88                    
//      88  ,adPPYYba,  ,adPPYba,  88   ,d8   ,adPPYba,  
//      88  ""     `Y8  I8[    ""  88 ,a8"    I8[    ""  
//      88  ,adPPPPP88   `"Y8ba,   8888[       `"Y8ba,   
//      88  88,    ,88  aa    ]8I  88`"Yba,   aa    ]8I  
//      88  `"8bbdP"Y8  `"YbbdP"'  88   `Y8a  `"YbbdP"'  

gulp.task('clean', function (done) {
	return del(paths.dist.build, done);
});
gulp.task('server', function(done) {
	bs.init(serverSettings, done);
});
gulp.task('reload', function (done) {
	bs.reload();
	done();
});
gulp.task('sass', function() {
    return gulp.src(paths.src.styles+'/**/*.scss')
	.pipe(gulpif(addSourcemaps, sourcemaps.init()))
    .pipe(sass())
	.pipe(rename({suffix: '.min'}))
	.pipe(cssnano(cssnanoSettings))
	.pipe(autoprefixer(autoprefixSettings))
	.pipe(gulpif(addSourcemaps, sourcemaps.write('./')))
	.pipe(gulp.dest(paths.dist.styles));
});
gulp.task('css', function() {
    return gulp.src([paths.src.styles+'/**/*.css', '!'+paths.src.styles+'/**/*.min.css'])
	.pipe(gulpif(addSourcemaps, sourcemaps.init()))
    .pipe(rename({suffix: '.min'}))
	.pipe(newer(paths.dist.styles))
	.pipe(cssnano(cssnanoSettings))
	.pipe(autoprefixer(autoprefixSettings))
	.pipe(gulpif(addSourcemaps, sourcemaps.write('./')))
	.pipe(gulp.dest(paths.dist.styles));
});
gulp.task('css:min', function() {
    return gulp.src(paths.src.styles+'/**/*.min.css')
	.pipe(newer(paths.dist.styles))
	.pipe(gulp.dest(paths.dist.styles));
});
gulp.task('scripts', function() {
	//Cannot have gulp-newer due to navJSON changing.
    return gulp.src([paths.src.scripts+'/**/*.js', '!'+paths.src.scripts+'/**/*.min.js', '!'+paths.src.scriptsHead+'/**/*', '!'+paths.src.scriptsBody+'/**/*'])
    .pipe(tap(function(file) {
    	//Find "var navJSON={};" and replace with navigation
    	if(paths.src.navJSONAppend == path.basename(file.path)) {
    		var output = file.contents.toString().replace(/var navJSON={};/, 'var navJSON='+JSON.stringify(navigation)+';');
    		file.contents = new Buffer(output);
    	}
	}))
	.pipe(rename({suffix: '.min'}))
	.pipe(gulpif(addSourcemaps, sourcemaps.init()))
    .pipe(uglify())
	.pipe(gulpif(addSourcemaps, sourcemaps.write({includeContent: true})))
    .pipe(gulp.dest(paths.dist.scripts));
});
gulp.task('scripts:min', function() {
    return gulp.src([paths.src.scripts+'/**/*.min.js', '!'+paths.src.scriptsHead+'/**/*', '!'+paths.src.scriptsBody+'/**/*'])
	.pipe(newer(paths.dist.scripts))
    .pipe(gulp.dest(paths.dist.scripts));
});
gulp.task('scripts:head', function() {
    return gulp.src(headScripts)
      .pipe(gulpif(addSourcemaps, sourcemaps.init()))
      .pipe(concat(paths.dist.headScript))
      .pipe(uglify())
	  .pipe(gulpif(addSourcemaps, sourcemaps.write({includeContent: true})))
      .pipe(gulp.dest(paths.dist.scripts));
});
gulp.task('scripts:body', function() {
    return gulp.src(bodyScripts)
      .pipe(gulpif(addSourcemaps, sourcemaps.init()))
      .pipe(concat(paths.dist.bodyScript))
      .pipe(uglify())
	  .pipe(gulpif(addSourcemaps, sourcemaps.write({includeContent: true})))
      .pipe(gulp.dest(paths.dist.scripts));
});
gulp.task('nunjucks:all', function() {
    return gulp.src([paths.src.templates+'/**/*.njk', nunjucksAllIgnore])
	.pipe(tap(pathTap))
	.pipe(frontMatter({property: 'data'}))
	.pipe(nunjucks.compile({global: getGlobalJSON(), nav: navigation, stylenav: stylenav}, {env: nunjucksEnv}))
	.pipe(htmlmin(minifyHTMLOptions))
	.pipe(rename({extname: ".html"}))
	.pipe(gulp.dest(paths.dist.build));
});
gulp.task('nunjucks:single', function() {
    return gulp.src([paths.src.templates+'/**/*.njk', '!'+paths.src.templates+'/@(_includes|_layouts)/*'], { since: gulp.lastRun('nunjucks:single') })
	.pipe(tap(pathTap))
	.pipe(frontMatter({property: 'data'}))
	.pipe(nunjucks.compile({global: getGlobalJSON(), nav: navigation, stylenav: stylenav}, {env: nunjucksEnv}))
	.pipe(htmlmin(minifyHTMLOptions))
	.pipe(rename({extname: ".html"}))
	.pipe(gulp.dest(paths.dist.build));
});
gulp.task('checkYAML', function(done) {
	var originalNav = allLocalJSON;
	allLocalJSON = dirTree(paths.src.templates, true);
	
	//Only update navigation when YAML has changed.
	if(JSON.stringify(originalNav) != JSON.stringify(allLocalJSON)) {
		navigation = updateNav();
		flatNavigation = flattenNav(navigation);
	}
	done();
});
gulp.task('checkStyleYAML', function(done) {
	var originalStyleNav = allLocalStyleJSON;
	allLocalStyleJSON = dirTree(paths.src.templates);
	
	//Only update navigation when YAML has changed.
	if(JSON.stringify(originalStyleNav) != JSON.stringify(allLocalStyleJSON)) {
		stylenav = updateStyleNav();
		flatStyleNavigation = flattenNav(stylenav, true);
	}
	done();
});
gulp.task('files', function() {
	return gulp.src(paths.src.files+'/**/*')
	.pipe(gulp.dest(paths.dist.files));
});
gulp.task('absolute-copy', function() {
	var copyStream = merge();
	for(var i=0;i<absoluteFiles.length;i++) {
		var src = gulp.src(absoluteFiles[i].src)
		.pipe(gulp.dest(absoluteFiles[i].dest));
		copyStream.add(src);
	}
	return copyStream;
});
gulp.task('images', function() {
	return gulp.src(paths.src.images+'/**/*')
	.pipe(gulp.dest(paths.dist.images));
});
gulp.task('videos', function() {
	return gulp.src(paths.src.videos+'/**/*')
	.pipe(gulp.dest(paths.dist.videos));
});
gulp.task('updateNav', function(done) {
	navigation = updateNav();
	flatNavigation = flattenNav(navigation);
	checkUnique(navigation.nav);
	done();
});
gulp.task('updateStyleNav', function(done) {
	stylenav = updateStyleNav();
	flatStyleNavigation = flattenNav(stylenav, true);
	checkUnique(stylenav.stylenav);
	done();
});


// I8,        8        ,8I                                88           
// `8b       d8b       d8'              ,d                88           
//  "8,     ,8"8,     ,8"               88                88           
//   Y8     8P Y8     8P  ,adPPYYba,  MM88MMM  ,adPPYba,  88,dPPYba,   
//   `8b   d8' `8b   d8'  ""     `Y8    88    a8"     ""  88P'    "8a  
//    `8a a8'   `8a a8'   ,adPPPPP88    88    8b          88       88  
//     `8a8'     `8a8'    88,    ,88    88,   "8a,   ,aa  88       88  
//      `8'       `8'     `"8bbdP"Y8    "Y888  `"Ybbd8"'  88       88  

gulp.task('watch', function() {
	// Styles
    gulp.watch(paths.src.styles+'/**/*.scss', gulp.series('sass', 'reload')).on('unlink', deleteStyle).on('error', function(){});
    gulp.watch([paths.src.styles+'/**/*.css', '!'+paths.src.styles+'/**/*.min.css'], gulp.series('css', 'reload')).on('unlink', deleteStyle).on('error', function(){});
    gulp.watch(paths.src.styles+'/**/*.min.css', gulp.series('css:min', 'reload')).on('unlink', deleteStyle).on('error', function(){});
    
	// Scripts
    gulp.watch([paths.src.scripts+'/**/*.js', '!'+paths.src.scripts+'/**/*.min.js', '!'+paths.src.scriptsHead+'/**/*', '!'+paths.src.scriptsBody+'/**/*'],
		gulp.series('scripts', 'reload')).on('unlink', deleteScript).on('error', function(){});
	gulp.watch([paths.src.scripts+'/**/*.min.js', '!'+paths.src.scriptsHead+'/**/*', '!'+paths.src.scriptsBody+'/**/*'], 
		gulp.series('scripts:min', 'reload')).on('unlink', deleteScript).on('error', function(){});
    gulp.watch(paths.src.scriptsHead+'/**/*', gulp.series('scripts:head', 'reload')).on('error', function(){});
    gulp.watch(paths.src.scriptsBody+'/**/*', gulp.series('scripts:body', 'reload')).on('error', function(){});

	// Nunjucks
    gulp.watch(paths.src.templates+'/@(_includes|_layouts)/*.njk', gulp.series('nunjucks:all', 'reload')).on('error', function(){});
    gulp.watch([paths.src.templates+'/**/*.njk', '!'+paths.src.templates+'/@(_includes|_layouts|_style)/*'],
        gulp.series('nunjucks:single', 'checkYAML', 'reload')).on('unlink', deleteNunjucksFile).on('error', function(){});
    
	// Nunjucks _styleguide
	if(addStyleguide) {
		gulp.watch(paths.src.templates+'/@(_style)/*.njk', gulp.series('nunjucks:single', 'checkStyleYAML', 'reload')).on('unlink', deleteNunjucksFile).on('error', function(){});
	}
    
	// JSON
	//If ANY navigation or data changes, run nunjucks:all and update the nav in the JavaScript file.
    gulp.watch(paths.src.navDebugJSON, gulp.series(gulp.parallel('nunjucks:all', 'scripts'), 'reload')).on('error', function(){});
	gulp.watch(paths.src.stylenavDebugJSON, gulp.series(gulp.parallel('nunjucks:all', 'scripts'), 'reload')).on('error', function(){});
	
    gulp.watch(paths.src.globalJSON, gulp.series('nunjucks:all', 'reload')).on('error', function(){});
	gulp.watch(paths.src.navJSON, gulp.series('updateNav', 'reload')).on('error', function(){});
	gulp.watch(paths.src.stylenavJSON, gulp.series('updateStyleNav', 'reload')).on('error', function(){});
	
	// Files
	gulp.watch(paths.src.files+'/**/*', gulp.series('files', 'reload')).on('unlink', deleteFile).on('error', function(){});
	
	//Absolute file copy
	gulp.watch(absoluteFilesSrcArray, gulp.series('absolute-copy', 'reload')).on('error', function(){});
	
	// Images
	gulp.watch(paths.src.images+'/**/*', gulp.series('images', 'reload')).on('unlink', deleteImage).on('error', function(){});
	
	// Videos
	gulp.watch(paths.src.videos+'/**/*', gulp.series('videos', 'reload')).on('unlink', deleteVideo).on('error', function(){});
});
gulp.task('default', gulp.series('server', 'watch'));



// 88888888ba                88  88           88  
// 88      "8b               ""  88           88  
// 88      ,8P                   88           88  
// 88aaaaaa8P'  88       88  88  88   ,adPPYb,88  
// 88""""""8b,  88       88  88  88  a8"    `Y88  
// 88      `8b  88       88  88  88  8b       88  
// 88      a8P  "8a,   ,a88  88  88  "8a,   ,d88  
// 88888888P"    `"YbbdP'Y8  88  88   `"8bbdP"Y8  

//Nunjucks may rely on getting file sizes from files, so files is run before
gulp.task('build', gulp.series('clean', gulp.parallel('sass', 'css', 'css:min', 'scripts', 'scripts:head', 'scripts:body', 'scripts:min', 'nunjucks:all', 'images', 'videos', 'files', 'absolute-copy')));


// 88888888888                                             88                                       
// 88                                               ,d     ""                                       
// 88                                               88                                              
// 88aaaaa  88       88  8b,dPPYba,    ,adPPYba,  MM88MMM  88   ,adPPYba,   8b,dPPYba,   ,adPPYba,  
// 88"""""  88       88  88P'   `"8a  a8"     ""    88     88  a8"     "8a  88P'   `"8a  I8[    ""  
// 88       88       88  88       88  8b            88     88  8b       d8  88       88   `"Y8ba,   
// 88       "8a,   ,a88  88       88  "8a,   ,aa    88,    88  "8a,   ,a8"  88       88  aa    ]8I  
// 88        `"YbbdP'Y8  88       88   `"Ybbd8"'    "Y888  88   `"YbbdP"'   88       88  `"YbbdP"'  

function pathTap(file) {
	relativeRoot = path.relative(path.dirname(file.path), pathToRoot).replace(/\\/g,"/");
	pathFromRoot = file.path.replace(pathToRoot, "").replace(/\\/g,"/").replace(/\.njk/, ".html");
}
function getGlobalJSON() {
	return JSON.parse(fs.readFileSync('./'+paths.src.globalJSON, 'utf8'));
}
function updateNav() {
	console.log("NOTICE| Updating navigation");
	var nav = JSON.parse(fs.readFileSync(paths.src.navJSON, 'utf8'));
	var pages = dirTree(paths.src.templates, true);
	
	var copyNodes = function(source, collection) {
		for(var c in collection) {
			var item = collection[c];
			
			if(item["id"] == source["id"]) {
				delete source["id"];
				for(var prop in source) {
					if("url" in item && prop == "url") { continue; }
					
					item[prop] = source[prop];
				}
			} else if(item["children"] !== "undefined" && typeof(item["children"] == "object")) {
				copyNodes(source, item["children"]);
			}
		}
		return;
	};
	
	for(var p in pages) {
		var page = pages[p];
		copyNodes(page, nav.nav);
	}
	
	//Save generated navigation file for debug.
	fs.writeFileSync(paths.src.navDebugJSON, JSON.stringify(nav, null, 4));
	return nav;
}
function updateStyleNav() {
	console.log("NOTICE| Updating navigation");
	var stylenav = JSON.parse(fs.readFileSync(paths.src.stylenavJSON, 'utf8'));
	var pages = dirTree(paths.src.templates);
	
	var copyNodes = function(source, collection) {
		for(var c in collection) {
			var item = collection[c];
			
			if(item["id"] == source["id"]) {
				delete source["id"];
				for(var prop in source) {
					if("url" in item && prop == "url") { continue; }
					
					item[prop] = source[prop];
				}
			} else if(item["children"] !== "undefined" && typeof(item["children"] == "object")) {
				copyNodes(source, item["children"]);
			}
		}
		return;
	};
	
	for(var p in pages) {
		var page = pages[p];
		copyNodes(page, stylenav.stylenav);
	}
	
	//Save generated navigation file for debug.
	fs.writeFileSync(paths.src.stylenavDebugJSON, JSON.stringify(stylenav, null, 4));
	return stylenav;
}
function flattenNav(treeNav, boolStyleNav) {
	var flatNav = [];
	
	function recurseNav(cur, parent) {
		//Copy JSON structure by value (NOT REFERENCE)
		var thisObj = JSON.parse(JSON.stringify(cur));
		//Add parent attr to JSON
		thisObj.parent = parent;
		
		//We want to recursively add children separately
		delete thisObj["children"];
		
		if(cur.hasOwnProperty("children")) {
			thisObj.children = [];
			for(var child in cur["children"]) {
				thisObj.children.push(cur["children"][child]["id"]);
				recurseNav(cur["children"][child], cur["id"]);
			}
		}
		flatNav.push(thisObj);
	}
	
	if(boolStyleNav) {
		recurseNav(treeNav.stylenav[0], "rootNav");
	} else {
		recurseNav(treeNav.nav[0], "rootNav");
	}
	
	fs.writeFileSync(paths.src.navFlatDebugJSON, JSON.stringify(flatNav, null, 4));
	return flatNav;
}
function dirTree(dir, excludeStyle) {
	var stats = fs.lstatSync(dir),
	data = [],
	exclude = ["_includes", "_layouts"];
	
	if(excludeStyle) {
		exclude.push("_style");
	}
	
	if(stats.isDirectory()) {
		var items = fs.readdirSync(dir);
		
		for(var i=0; i < items.length; i++ ) {
			var item = items[i];
			if(exclude.indexOf(dir.split('/')[1]) === -1 && path.extname(item) == ".njk") {	//If not in exlude directory list and a nunjucks file
				try {
					var content = fm(fs.readFileSync(dir + '/' + item, 'utf8')).attributes;
					if(Object.keys(content).length > 0) { //Check if YAML headers are empty
						if(!content.hasOwnProperty("url")) {
							content.url = dir.replace(paths.src.templates, "") + '/' + path.normalize(item).replace(/\.njk/, ".html");
						}
						data.push(content);
					}
				}
				catch(e) {console.log("ERROR| Parsing YAML Header: "+e);}
			} else if(fs.lstatSync(dir + '/' + item).isDirectory()) {
				if(excludeStyle) {
					data = data.concat.apply(data, dirTree(dir + '/' + item, true));
				} else {
					data = data.concat.apply(data, dirTree(dir + '/' + item));
				}
			}
		}
	}
	return data;
}
//Check that there are no duplicate ID's in navigation
function checkUnique(newList, exList) {
	if(typeof exList == "undefined") {
		var exList = [];
	}
	
	for(var i=0;i<newList.length;i++) {
		for(var j=0;j<exList.length;j++)
		{
			if(newList[i].id == exList[j]) {
				console.log("WARNING| Duplicate ID found in nav.json: " + newList[i].id);
			}
		}
		exList[exList.length] = newList[i].id;
		
		if(newList[i].children) {
			checkUnique(newList[i].children, exList);
		}
	}
}
function searchJSONFlat(id, flatJSON) {
	for(var i=0;i<flatJSON.length;i++) {
		if(flatJSON[i].id == id) {
			return flatJSON[i];
		}
	}
}


                                                                                           
// 888b      88                            88                           88                    
// 8888b     88                            ""                           88                    
// 88 `8b    88                                                         88                    
// 88  `8b   88  88       88  8b,dPPYba,   88  88       88   ,adPPYba,  88   ,d8   ,adPPYba,  
// 88   `8b  88  88       88  88P'   `"8a  88  88       88  a8"     ""  88 ,a8"    I8[    ""  
// 88    `8b 88  88       88  88       88  88  88       88  8b          8888[       `"Y8ba,   
// 88     `8888  "8a,   ,a88  88       88  88  "8a,   ,a88  "8a,   ,aa  88`"Yba,   aa    ]8I  
// 88      `888   `"YbbdP'Y8  88       88  88   `"YbbdP'Y8   `"Ybbd8"'  88   `Y8a  `"YbbdP"'  
//                                        ,88                                                 
//                                      888P"                                                 

nunjucksEnv.addFilter("image", function(input) {
	var relativeImages = (relativeRoot === '') ? assetPath.images : relativeRoot +'/'+ assetPath.images;
	return relativeImages + input;
});
nunjucksEnv.addFilter("video", function(input) {
	var relativeVideos = (relativeRoot === '') ? assetPath.videos : relativeRoot +'/'+ assetPath.videos;
	return relativeVideos + input;
});
nunjucksEnv.addFilter("style", function(input) {
	var relativeStyles = (relativeRoot === '') ? assetPath.styles : relativeRoot +'/'+ assetPath.styles;
	return relativeStyles + input;
});
nunjucksEnv.addFilter("script", function(input) {
	var relativeScripts = (relativeRoot === '') ? assetPath.scripts : relativeRoot +'/'+ assetPath.scripts;
	return relativeScripts + input;
});
nunjucksEnv.addFilter("link", function(input) {
	var relativeLink = path.relative(path.dirname(pathFromRoot), input).replace(/\\/g,"/");
	return relativeLink;
});
nunjucksEnv.addFilter("linkid", function(input) {
	var thisUrl = searchJSONFlat(input, flatNavigation).url;
	if(typeof thisUrl != "undefined") {
		return path.relative(path.dirname(pathFromRoot), thisUrl).replace(/\\/g,"/");
	}
	else {
		console.log("WARNING| linkid filter ID: " + input + ' was not found in: ' + pathFromRoot);
		return "#";
	}
});
nunjucksEnv.addFilter("file", function(input) {
	var relativeFiles = (relativeRoot === '') ? assetPath.files : relativeRoot +'/'+ assetPath.files;
	return relativeFiles + input;
});
nunjucksEnv.addFilter("obj", function(input) {
	var result = searchJSONFlat(input, flatNavigation);
	if(typeof result != "undefined") {
		return result;
	}
	else {
		console.log("WARNING| obj filter ID: " + input + ' was not found in: ' + pathFromRoot);
		return "#";
	}
});


// 88888888ba,                88                                     88888888888  88  88                         
// 88      `"8b               88                ,d                   88           ""  88                         
// 88        `8b              88                88                   88               88                         
// 88         88   ,adPPYba,  88   ,adPPYba,  MM88MMM  ,adPPYba,     88aaaaa      88  88   ,adPPYba,  ,adPPYba,  
// 88         88  a8P_____88  88  a8P_____88    88    a8P_____88     88"""""      88  88  a8P_____88  I8[    ""  
// 88         8P  8PP"""""""  88  8PP"""""""    88    8PP"""""""     88           88  88  8PP"""""""   `"Y8ba,   
// 88      .a8P   "8b,   ,aa  88  "8b,   ,aa    88,   "8b,   ,aa     88           88  88  "8b,   ,aa  aa    ]8I  
// 88888888Y"'     `"Ybbd8"'  88   `"Ybbd8"'    "Y888  `"Ybbd8"'     88           88  88   `"Ybbd8"'  `"YbbdP"'  

function deleteNunjucksFile(filepath) {
	var toDelete = filepath.replace(/\\/g,"/").replace(paths.src.templates, paths.dist.build).replace(/\.njk/, ".html");
	del([toDelete]).then(function(paths){
		console.log(paths.join('\n'));
	});
}
function deleteStyle(filepath) {
	var toDelete = filepath.replace(/\\/g,"/").replace(paths.src.styles, paths.dist.styles).replace(/\.scss|\.css|\.min\.css/, ".min.css");
	del([toDelete]).then(function(paths){
		console.log('NOTICE| Deleted file:\n', paths.join('\n'));
	});
	if(addSourcemaps) {
		del([toDelete + '.map']).then(function(paths){
			console.log('NOTICE| Deleted file:\n', paths.join('\n'));
		});
	}
}
function deleteScript(filepath) {
	var toDelete = filepath.replace(/\\/g,"/").replace(paths.src.scripts, paths.dist.scripts).replace(/\.js|\.min\.js/, ".min.js");
	del([toDelete]).then(function(paths){
		console.log('NOTICE| Deleted script:\n', paths.join('\n'));
	});
}
function deleteFile(filepath) {
	var toDelete = filepath.replace(/\\/g,"/").replace(paths.src.files, paths.dist.files);
	del([toDelete]).then(function(paths){
		console.log('NOTICE| Deleted file:\n', paths.join('\n'));
	});
}
function deleteImage(filepath) {
	var toDelete = filepath.replace(/\\/g,"/").replace(paths.src.images, paths.dist.images);
	del([toDelete]).then(function(paths){
		console.log('NOTICE| Deleted image:\n', paths.join('\n'));
	});
}
function deleteVideo(filepath) {
	var toDelete = filepath.replace(/\\/g,"/").replace(paths.src.videos, paths.dist.videos);
	del([toDelete]).then(function(paths){
		console.log('NOTICE| Deleted video:\n', paths.join('\n'));
	});
}
//====================================================================================================================


// ad88888ba                            88                                 
//d8"     "8b                           ""    ,d                           
//Y8,                                         88                           
//`Y8aaaaa,    8b,dPPYba,   8b,dPPYba,  88  MM88MMM  ,adPPYba,  ,adPPYba,  
//  `"""""8b,  88P'    "8a  88P'   "Y8  88    88    a8P_____88  I8[    ""  
//        `8b  88       d8  88          88    88    8PP"""""""   `"Y8ba,   
//Y8a     a8P  88b,   ,a8"  88          88    88,   "8b,   ,aa  aa    ]8I  
// "Y88888P"   88`YbbdP"'   88          88    "Y888  `"Ybbd8"'  `"YbbdP"'  
//             88                                                          
//             88                                                          

//Require global variables - loaded in a single task so they can be used over multiple tasks and only load if called
var svgSprite, svg2png, spritesmith, svgVar, jimp, buffer;

//Require dependencies and declare global sprite variables
gulp.task('sprite-require', function(done) {
	svgSprite = require('gulp-svg-sprite');
	svg2png = require('gulp-svg2png');
	spritesmith = require('gulp.spritesmith');
	jimp = require('gulp-jimp');
	buffer = require('vinyl-buffer');
	
	svgVar = {
		folders: getFolders(paths.src.sprite),
		folderPath: [],
		relPathSprite: path.relative(paths.dist.styles, paths.dist.spriteImages).replace(/\\/g,"/")
	};
	
	for(var i=0;i<svgVar.folders.length;i++) {	//Generate folder paths
		svgVar.folderPath[i] = paths.src.sprite+'/'+svgVar.folders[i];
	}
	done();
});
//Add xml declaration to all SVGs in the sprite folder - required for svg2png
gulp.task('sprite-xml-fix', function() {
	var xmlTasks = merge();
	
	for(var i=0;i<svgVar.folders.length;i++) {
		xmlTasks.add(gulp.src(svgVar.folderPath[i]+'/*.svg')
		.pipe(tap(function(file) {
			return file.contents = addXMLDeclaration(file);
		}))
		.pipe(gulp.dest(svgVar.folderPath[i])));
	}
	return xmlTasks;
});


//  .d8888. db    db  d888b       .d8888. d8888b. d8888b. d888888b d888888b d88888b .d8888. 
//  88'  YP 88    88 88' Y8b      88'  YP 88  `8D 88  `8D   `88'   `~~88~~' 88'     88'  YP 
//  `8bo.   Y8    8P 88           `8bo.   88oodD' 88oobY'    88       88    88ooooo `8bo.   
//    `Y8b. `8b  d8' 88  ooo        `Y8b. 88~~~   88`8b      88       88    88~~~~~   `Y8b. 
//  db   8D  `8bd8'  88. ~8~      db   8D 88      88 `88.   .88.      88    88.     db   8D 
//  `8888Y'    YP     Y888P       `8888Y' 88      88   YD Y888888P    YP    Y88888P `8888Y' 

//Create SVG sprites
//Generates Scss
gulp.task('sprite-svg', function() {
	var svgTasks = merge();
	var haveSVG = false;
	for(var i=0;i<svgVar.folders.length;i++) {
		var fileName = svgVar.folders[i];
		var settings = {
			"scale": 1,
			"padding": 0
		};
		
		//Retrieve/Merge settings.json file
		try {
			var fileSettings = JSON.parse(fs.readFileSync(svgVar.folderPath[i] + '/settings.json', 'utf8'));
			for(var obj in fileSettings){settings[obj]=fileSettings[obj];}
		}catch(e){}//Ignore settings file
		
		//Set Scss template to use
		var svgSpriteTemplate = './sprite/scss-template-svg-background.handlebars';
		if(settings.scale == 2) {
			svgSpriteTemplate = './sprite/scss-template-svg-background-x2.handlebars';
		}
		
		switch(settings.svg) {
			case "inline":
				haveSVG = true;
				svgTasks.add(gulp.src(svgVar.folderPath[i]+'/*.svg')
				.pipe(svgSprite({
					mode: {
						defs:{
							dest: paths.src.spriteImages,
							sprite: fileName+'.svg',
							bust: false
						}
					}
				}))
				.pipe(gulp.dest('./')));
				break;
			case "background":
				haveSVG = true;
				svgTasks.add(gulp.src(svgVar.folderPath[i]+'/*.svg')
				.pipe(svgSprite({
					shape: {spacing: {padding: settings.padding}},
					mode: {
						css: {
							dest: './',
							sprite: paths.src.spriteImages+'/'+fileName+'.svg',
							prefix : fileName+'-%s',
							render: {
								scss: {
									template: svgSpriteTemplate,
									dest: paths.src.spriteStyles+'/_'+fileName+'.scss'
								}
							},
							bust: false
						}
					},
					variables: {
						name: fileName,
						bgImage: svgVar.relPathSprite+'/'+fileName+'.svg',
						fallbackx2: svgVar.relPathSprite+'/'+fileName+'-x2.png',
						fallback: svgVar.relPathSprite+'/'+fileName+'.png'
					}
				}))
				.pipe(gulp.dest('./')));
				break;
			case undefined: break;
			default:
				console.log("WARNING| svg attr can only be inline or background: " + fileName);
		}
	}
	if(!haveSVG) {return null;}	//Required as an empty merge() will error
	return svgTasks;
});


//  d8888b. d8b   db  d888b       .d8888. d8888b. d8888b. d888888b d888888b d88888b .d8888. 
//  88  `8D 888o  88 88' Y8b      88'  YP 88  `8D 88  `8D   `88'   `~~88~~' 88'     88'  YP 
//  88oodD' 88V8o 88 88           `8bo.   88oodD' 88oobY'    88       88    88ooooo `8bo.   
//  88~~~   88 V8o88 88  ooo        `Y8b. 88~~~   88`8b      88       88    88~~~~~   `Y8b. 
//  88      88  V888 88. ~8~      db   8D 88      88 `88.   .88.      88    88.     db   8D 
//  88      VP   V8P  Y888P       `8888Y' 88      88   YD Y888888P    YP    Y88888P `8888Y' 

//Create fallback PNGs from SVGs
gulp.task('sprite-png-fb', function() {
	var pngFBTasks = merge();
	for(var i=0;i<svgVar.folders.length;i++) {
		var fileName = svgVar.folders[i];
		var settings = {
			"algorithm": "binary-tree",
			"scale": 1,
			"padding": 0
		};
		
		//Retrieve/Merge settings.json file
		try {
			var fileSettings = JSON.parse(fs.readFileSync(svgVar.folderPath[i] + '/settings.json', 'utf8'));
			for(var obj in fileSettings){settings[obj]=fileSettings[obj];}
		}catch(e){}//Ignore settings file
		
		if(settings.svg == "background") {
			pngFBTasks.add(gulp.src(paths.src.spriteImages+'/'+fileName+'.svg')
			.pipe(svg2png(1, false))
			.pipe(gulp.dest(paths.src.spriteImages)));
			
			if(settings.scale != 1) {
				pngFBTasks.add(gulp.src(paths.src.spriteImages+'/'+fileName+'.svg')
				.pipe(svg2png(settings.scale, false))
				.pipe(rename(fileName+'-x'+settings.scale+'.png'))
				.pipe(gulp.dest(paths.src.spriteImages)));
			}
		}
		else {
			pngFBTasks.add(gulp.src(svgVar.folderPath[i]+'/*.svg')
			.pipe(svg2png(settings.scale, false))
			.pipe(gulp.dest(svgVar.folderPath[i])));
		}
	}
	return pngFBTasks;
});

//Create PNG sprites
//Generates Scss
gulp.task('sprite-png', function() {
	var pngTasks = merge();
	for(var i=0;i<svgVar.folders.length;i++) {
		let fileName = svgVar.folders[i];
		var settings = {
			"algorithm": "binary-tree",
			"scale": 1,
			"padding": 0
		};
		
		//Retrieve/Merge settings.json file
		try {
			var fileSettings = JSON.parse(fs.readFileSync(svgVar.folderPath[i] + '/settings.json', 'utf8'));
			for(var obj in fileSettings){settings[obj]=fileSettings[obj];}
		}catch(e){}//Ignore settings file
		
		if(settings.svg == "inline" || typeof settings.svg == "undefined") {
			//Default handlebars scss template for png
			var scssTemplate = 'scss-template-png.handlebars';
			if(settings.svg) {
				scssTemplate = 'scss-template-svg.handlebars';
				if(settings.scale == 2) {
					scssTemplate = 'scss-template-svg-x2.handlebars';
					settings.imgName = fileName+'-x2.png';
					settings.imgPath = svgVar.relPathSprite+'/'+fileName+'-x2.png';
				}
			}
			else {
				if(settings.scale == 2) {
					scssTemplate = 'scss-template-png-x2.handlebars';
					settings.imgName = fileName+'-x2.png';
					settings.imgPath = svgVar.relPathSprite+'/'+fileName+'-x2.png';
				}
			}
			
			var fallbackPath = (svgVar.relPathSprite+'/'+fileName+'.png').toString();
			
			var spriteSettings = {
				cssTemplate: paths.src.sprite+'/'+scssTemplate,
				imgName: fileName+'.png',
				cssName: '_'+fileName+'.scss',
				imgPath: svgVar.relPathSprite+'/'+fileName+'.png',
				cssSpritesheetName: fileName,
				cssVarMap: function(sprite) {
					sprite.name = sprite.name;
					sprite.sheetName = fileName;
					sprite.fallback = fallbackPath,
					sprite.padding = settings.padding
				},
			};
			
			//Merge local settings with defaults
			for(var sprObj in settings) {spriteSettings[sprObj]=settings[sprObj];}
			
			var spriteData = gulp.src(svgVar.folderPath[i]+'/*.png')
			.pipe(spritesmith(spriteSettings));
			
			spriteData.css
			.pipe(gulp.dest(paths.src.spriteStyles));
			
			//If PNGx2, create x1 size
			if((!settings.svg || settings.svg == "inline") && settings.scale == 2) {
				spriteData.img
				.pipe(buffer())
				.pipe(gulp.dest(paths.src.spriteImages))
				.pipe(jimp({scale: 0.5}))
				.pipe(rename(fileName+'.png'))
				.pipe(gulp.dest(paths.src.spriteImages));
			}
			else {
				spriteData.img
				.pipe(gulp.dest(paths.src.spriteImages));
			}
			
			pngTasks.add(spriteData);
		}
	}
	return pngTasks;
});

//https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md
//Returns an array of folder names
function getFolders(dir) {
	return fs.readdirSync(dir)
	.filter(function(file) {
		return fs.statSync(path.join(dir, file)).isDirectory();
	});
}
//Adds xml declaration to the beginning of a file (for SVGs)
function addXMLDeclaration(file) {
	if(file.contents.toString().indexOf('<?xml') == -1) {
		return file.contents = Buffer.concat([
			new Buffer('<?xml version="1.0"?>'),
			file.contents
		]);
	}
	return file.contents;
}


//Creates sprites
//Generates PNG fallbacks
//Generates Scss
gulp.task('sprite', gulp.series('sprite-require', 'sprite-xml-fix', 'sprite-svg', 'sprite-png-fb', 'sprite-png'));