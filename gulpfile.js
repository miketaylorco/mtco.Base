                                                                                     
// 88b           d88                        88               88                         
// 888b         d888                        88               88                         
// 88`8b       d8'88                        88               88                         
// 88 `8b     d8' 88   ,adPPYba,    ,adPPYb,88  88       88  88   ,adPPYba,  ,adPPYba,  
// 88  `8b   d8'  88  a8"     "8a  a8"    `Y88  88       88  88  a8P_____88  I8[    ""  
// 88   `8b d8'   88  8b       d8  8b       88  88       88  88  8PP"""""""   `"Y8ba,   
// 88    `888'    88  "8a,   ,a8"  "8a,   ,d88  "8a,   ,a88  88  "8b,   ,aa  aa    ]8I  
// 88     `8'     88   `"YbbdP"'    `"8bbdP"Y8   `"YbbdP'Y8  88   `"Ybbd8"'  `"YbbdP"'  

// Node
var fs                              = require('fs');
var path                            = require('path');
var del                             = require('del');
var argv                            = require('yargs').argv;
var directoryExists                 = require('directory-exists');

// Gulp
var gulp                            = require('gulp');

// General use
var rename                          = require('gulp-rename');
var gulpif                          = require('gulp-if');
var tap                             = require('gulp-tap');
var merge                           = require('merge-stream');
var newer                           = require('gulp-newer');

// Templating
var nunjucks                        = require('gulp-nunjucks');
var nunjucksModule                  = require('nunjucks');
var fm                              = require('front-matter');
var frontMatter                     = require('gulp-front-matter');
var htmlmin                         = require('gulp-htmlmin');

// Styles and scripts
var sass                            = require('gulp-sass');
var autoprefixer                    = require('gulp-autoprefixer');
var cssnano                         = require('gulp-cssnano');
var uglify                          = require('gulp-uglify');
var sourcemaps                      = require('gulp-sourcemaps');
var concat                          = require('gulp-concat');

// Server
var browserSync                     = require('browser-sync');
var browserSyncLocal                = browserSync.create();
var browserSyncDist                 = browserSync.create();
var reload                          = browserSync.reload; // not used?




// 8b           d8                        88              88           88                         
// `8b         d8'                        ""              88           88                         
//  `8b       d8'                                         88           88                         
//   `8b     d8'  ,adPPYYba,  8b,dPPYba,  88  ,adPPYYba,  88,dPPYba,   88   ,adPPYba,  ,adPPYba,  
//    `8b   d8'   ""     `Y8  88P'   "Y8  88  ""     `Y8  88P'    "8a  88  a8P_____88  I8[    ""  
//     `8b d8'    ,adPPPPP88  88          88  ,adPPPPP88  88       d8  88  8PP"""""""   `"Y8ba,   
//      `888'     88,    ,88  88          88  88,    ,88  88b,   ,a8"  88  "8b,   ,aa  aa    ]8I  
//       `8'      `"8bbdP"Y8  88          88  `"8bbdP"Y8  8Y"Ybbd8"'   88   `"Ybbd8"'  `"YbbdP"'  

var settings = {

    addSourceMaps:                  true,
    addStyleGuide:                  true
    
}

var paths = {
    
    // path to root directory
    root:                           '', // calculated below
    relativeRoot:                   '', // calculated in pathTap function
    pathFromRoot:                   '', // calculated in pathTap function

    // pipe folders
    local:                          '__local',
    dist:                           '__dist',
    pipeAssetsToCms: [
        { path: '../mtco.Web/', folderMustExist: true }
    ],

    // paths for settings
    settings:                       '__settings',
    generated:                      'generated', // under settings folder
    globalJSON:                     'global.json',
    navJSON:                        'nav.json',
    navFullJSON:                    'nav.full.json',
    navFlatJSON:                    'nav.flat.json',
    stylenavJSON:                   'stylenav.json',
    stylenavFullJSON:               'stylenav.full.json',
    stylenavFlatJSON:               'stylenav.flat.json',
    appendNavTo:                    'common.js',

    // paths for templates
    templates:                      'templates',
    styleTemplates:                 '__style',
    ignore:                         ['__layouts', '__includes'], // paths.styleTemplates gets pushed to this below if settings.addStyleGuide

    // paths for watching
    watchGlobalNunjucks:            ['__layouts', '__includes'],

    // paths for assets
    files:                          'assets/files',
    absoluteFiles:                  [
                                        { src: 'favicon.ico', dest: '' }
                                        // { src: 'test/test.txt', dest: 'test' },
                                        // { src: 'assets/test/**/*', dest: 'assets/test' }
                                    ],
    styles:                         'assets/styles',
    images:                         'assets/images',
    media:                          'assets/media',
    videos:                         'assets/video',
    scripts:                        'assets/scripts',
    scriptsHead:                    'assets/scripts/__head',
    scriptsHeadFiles:               [
                                        'respond.min.js'
                                    ],
    scriptsBody:                    'assets/scripts/__body',
    scriptsBodyFiles:               [
                                        '_jquery-throttle-debounce.js',
                                        '_js-cookie.js',
                                        'console-fix.js',
                                        //'pageSwap.plugin.js',
                                        'picturefill.min.js'
                                    ],

    // paths for sprites
    sprites:                        'sprites',
    spriteImages:                   'assets/images/__sprites',
    spriteStyles:                   'assets/styles/__sprites',

}


// Calculate path back to the root directory
paths.root = path.join(__dirname, paths.templates);


// Ignore style guide
if(!settings.addStyleGuide) {
    paths.ignore.push(paths.styleTemplates);
}


// Navigation variables
var navigation;
var flatNavigation;
var stylenav;


//Nunjucks Environment variables
var nunjucksLoader = new nunjucksModule.FileSystemLoader(paths.templates, {noCache: true});
var nunjucksEnv = new nunjucksModule.Environment(nunjucksLoader, {autoescape: false});


// Prefix head/body scripts with path
if(paths.scriptsHeadFiles.length > 0) {
    for(var i=0; i<paths.scriptsHeadFiles.length; i++) {
        paths.scriptsHeadFiles[i] = paths.scriptsHead + '/' + paths.scriptsHeadFiles[i];
    }
}

if(settings.addStyleGuide) {
    paths.scriptsBodyFiles.push('_styleguide.js');
}

if(paths.scriptsBodyFiles.length > 0) {
    for(var i=0; i<paths.scriptsBodyFiles.length; i++) {
        paths.scriptsBodyFiles[i] = paths.scriptsBody + '/' + paths.scriptsBodyFiles[i];
    }
}


// all local YAML data in JSON
var allLocalJSON = dirTree(paths.templates);
                                                                                    



//  ad88888ba                                 88                                       
// d8"     "8b                ,d       ,d     ""                                       
// Y8,                        88       88                                              
// `Y8aaaaa,     ,adPPYba,  MM88MMM  MM88MMM  88  8b,dPPYba,    ,adPPYb,d8  ,adPPYba,  
//   `"""""8b,  a8P_____88    88       88     88  88P'   `"8a  a8"    `Y88  I8[    ""  
//         `8b  8PP"""""""    88       88     88  88       88  8b       88   `"Y8ba,   
// Y8a     a8P  "8b,   ,aa    88,      88,    88  88       88  "8a,   ,d88  aa    ]8I  
//  "Y88888P"    `"Ybbd8"'    "Y888    "Y888  88  88       88   `"YbbdP"Y8  `"YbbdP"'  
//                                                              aa,    ,88             
//                                                               "Y8bbdP"              

// BrowserSync settings for LOCAL
// http://www.browsersync.io/docs/options/

var serverSettings = {
    host: 'localhost',
    port: 8888,
    ui: {
        port: 9999,
        weinre: {
            port: 8899
        }
    },
    server: {
        baseDir: paths.local
    },
    ghostMode: true,
    online: false,
    watchOptions: {
        debounceDelay: 500
    }
};


// BrowserSync settings for DIST
// http://www.browsersync.io/docs/options/

var serverSettingsDist = {
    host: 'localhost',
    port: 3000,
    ui: {
        port: 3001,
        weinre: {
            port: 3080
        }
    },
    server: {
        baseDir: paths.dist
    },
    ghostMode: false,
    online: false,
    watchOptions: {
        debounceDelay: 500
    }
};


var autoprefixSettings = {
    browsers: ['> 0%', 'ie >= 7'],
    remove: false //Remove existing prefixes
};

var minifyHTMLOptions = {
	removeComments: true,
	collapseWhitespace: true,
	removeAttributeQuotes: true
};

var cssnanoSettings = {
	discardUnused: {
		fontFace: false,
		keyframes: false
	},
	safe: true
};


// pipe to CMS?
var doPipeAssetsToCms = (typeof paths.pipeAssetsToCms !== 'undefined' && paths.pipeAssetsToCms.length > 0 && argv.cms);

function pipeStreamToCms (stream, suffix) {
  for(var i=0; i < paths.pipeAssetsToCms.length; i++) {
    stream.pipe(gulp.dest(paths.pipeAssetsToCms[i].path + '/' + suffix));
  }
  return stream;
}    




// 88888888888                                             88                                       
// 88                                               ,d     ""                                       
// 88                                               88                                              
// 88aaaaa  88       88  8b,dPPYba,    ,adPPYba,  MM88MMM  88   ,adPPYba,   8b,dPPYba,   ,adPPYba,  
// 88"""""  88       88  88P'   `"8a  a8"     ""    88     88  a8"     "8a  88P'   `"8a  I8[    ""  
// 88       88       88  88       88  8b            88     88  8b       d8  88       88   `"Y8ba,   
// 88       "8a,   ,a88  88       88  "8a,   ,aa    88,    88  "8a,   ,a8"  88       88  aa    ]8I  
// 88        `"YbbdP'Y8  88       88   `"Ybbd8"'    "Y888  88   `"YbbdP"'   88       88  `"YbbdP"'  


function logError (error) {
    // details of the error in the console
    console.log(error.toString());
    this.emit('end');
}


function pathTap(file) {
	paths.relativeRoot = path.relative(path.dirname(file.path), paths.root).replace(/\\/g,"/");
    paths.pathFromRoot = file.path.replace(paths.root, "").replace(/\\/g,"/").replace(/\.njk/, ".html");
}


function getGlobalJSON() {
	return JSON.parse(fs.readFileSync('./' + paths.settings + '/' + paths.globalJSON, 'utf8'));
}


function dirTree(dir) {
    var stats = fs.lstatSync(dir);
    var data = [];
    
    if(stats.isDirectory()) {
        var items = fs.readdirSync(dir);

        for(var i=0; i < items.length; i++) {
            var item = items[i];

            if ((paths.ignore.indexOf(path.basename(item)) === -1) && (path.extname(item) == ".njk")) {
                try {
                    var content = fm(fs.readFileSync(dir + '/' + item, 'utf8')).attributes;
                    if(Object.keys(content).length > 0) {
                        if(!content.hasOwnProperty("url")) {
                            content.url = dir.replace(paths.templates, "") + '/' + path.normalize(item).replace(/.njk/, ".html");
                        }
                        data.push(content);
                    }
                }
                catch(e) {
                    console.log("[dirTree] Error parsing YAML front matter: " + e);
                }
            }
            else if(fs.lstatSync(dir + '/' + item).isDirectory()) {
                data = data.concat.apply(data, dirTree(dir + '/' + item));
            }

        }
    }
    return data;
}


// update the navigation
function updateNav() {
    var nav = JSON.parse(fs.readFileSync(paths.settings + '/' + paths.navJSON, 'utf8'));
    var pages = dirTree(paths.templates);

    var copyNodes = function(source, collection) {
        for (var c in collection) {
            var item = collection[c];

            if(item["id"] == source["id"]) {
                delete source["id"];
                for (var prop in source) {
                    if("url" in item && prop == "url") { continue; }
                    item[prop] = source[prop];
                }
            }
            else if(item["children"] !== "undefined" && typeof(item["children"] == "object")) {
                copyNodes (source, item["children"]);
            }
        }
        return;
    }

    for(var p in pages) {
        var page = pages[p];
        copyNodes(page, nav.nav);
    }

    fs.writeFileSync(paths.settings + '/' + paths.generated + '/' + paths.navFullJSON, JSON.stringify(nav, null, 4));
    return nav;
}


// generate flattened JSON for navigation
function flattenNav(treeNav, writeToFile) {
    var flatNav = [];

    function recurseNav(cur, parent) {
        var thisObj = JSON.parse(JSON.stringify(cur));
        thisObj.parent = parent;

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

    recurseNav(treeNav.nav[0], "rootNav");
    if (writeToFile) { fs.writeFileSync(paths.settings + '/' + paths.generated + '/' + paths.navFlatJSON, JSON.stringify(flatNav, null, 4)); }
    return flatNav;
}


// search flat navigation JSON
function searchFlatJSON(id, flatJSON) {
    for(var i=0; i < flatJSON.length; i++) {
        if(flatJSON[i].id == id) {
            return flatJSON[i];
        }
    }
}


// update the style guide navigation
function updateStyleNav() {
    var nav = JSON.parse(fs.readFileSync(paths.settings + '/' + paths.stylenavJSON, 'utf8'));
    var pages = dirTree(paths.templates);

    var copyNodes = function(source, collection) {
        for (var c in collection) {
            var item = collection[c];

            if(item["id"] == source["id"]) {
                delete source["id"];
                for (var prop in source) {
                    if("url" in item && prop == "url") { continue; }
                    item[prop] = source[prop];
                }
            }
            else if(item["children"] !== "undefined" && typeof(item["children"] == "object")) {
                copyNodes (source, item["children"]);
            }
        }
        return;
    }

    for(var p in pages) {
        var page = pages[p];
        copyNodes(page, nav.stylenav);
    }

    fs.writeFileSync(paths.settings + '/' + paths.generated + '/' + paths.stylenavFullJSON, JSON.stringify(nav, null, 4));
    return nav;
}


// Check that there are no duplicate IDs in navigation
function checkUnique(newList, exList) {
	if(typeof exList == "undefined") {
		var exList = [];
	}
	
	for(var i=0;i<newList.length;i++) {
		for(var j=0;j<exList.length;j++)
		{
			if(newList[i].id == exList[j]) {
				console.log("[checkUnique] Duplicate ID found in nav.json: " + newList[i].id);
			}
		}
		exList[exList.length] = newList[i].id;
		
		if(newList[i].children) {
			checkUnique(newList[i].children, exList);
		}
	}
}


// generate the navigation JSON files on disk
function generateNav() {
    console.log("[generateNav] Generating navigation");
    navigation = updateNav();
    flatNavigation = flattenNav(navigation, true);
    checkUnique(navigation.nav);

    if(settings.addStyleGuide) {
        console.log("[generateNav] Generating style guide navigation");
        stylenav = updateStyleNav();
        checkUnique(stylenav.stylenav);
    }
}

// gulp task to generate the navigation
gulp.task('generateNav', function(done) {
    generateNav();
    done();
});



// just read the navigation JSON from the generated files
function readNav() {
    console.log("[readNav] Reading navigation");
    try {
        navigation = JSON.parse(fs.readFileSync(paths.settings + '/' + paths.generated + '/' + paths.navFullJSON, 'utf8'));
        flatNavigation = flattenNav(navigation, false);

        if(settings.addStyleGuide) {
            stylenav = JSON.parse(fs.readFileSync(paths.settings + '/' + paths.generated + '/' + paths.stylenavFullJSON, 'utf8'));
        }
    }
    catch (e) {
        console.log("[readNav] Error reading navigation");
        generateNav();
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

gulp.task('nunjucks', function(done) {

    return gulp.src([paths.templates + '/**/*.njk', '!' + paths.templates + '/{' + paths.ignore.toString() + '}/**/*.+(html|nunjucks|njk)'])
        .pipe(tap(pathTap))
        .pipe(frontMatter({property: 'data'}))
        .pipe(nunjucks.compile({
            global: getGlobalJSON(),
            nav: navigation,
            stylenav: stylenav
        }, {
            env: nunjucksEnv
        }))
        .pipe(htmlmin(minifyHTMLOptions))
        .pipe(rename({extname: ".html"}))
        .on('error', logError)
        .pipe(gulp.dest(paths.local))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist)));


    done();
});


// single file
gulp.task('nunjucks:single', function(done) {

    return gulp.src([paths.templates + '/**/*.njk', '!' + paths.templates + '/{' + paths.ignore.toString() + '}/**/*.+(html|nunjucks|njk)'], { since: gulp.lastRun('nunjucks:single') })
        .pipe(tap(pathTap))
        .pipe(frontMatter({property: 'data'}))
        .pipe(nunjucks.compile({
            global: getGlobalJSON(),
            nav: navigation,
            stylenav: stylenav
        }, {
            env: nunjucksEnv
        }))
        .pipe(htmlmin(minifyHTMLOptions))
        .pipe(rename({extname: ".html"}))
        .on('error', logError)
        .pipe(gulp.dest(paths.local))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist)));

    done();

});


// filters

nunjucksEnv.addFilter("image", function(name) {
	var relativePath = (paths.relativeRoot === '') ? paths.images : paths.relativeRoot + '/' + paths.images;
	return relativePath + '/' + name;
});

nunjucksEnv.addFilter("media", function(name) {
	var relativePath = (paths.relativeRoot === '') ? paths.media : paths.relativeRoot + '/' + paths.media;
	return relativePath + '/' + name;
});

nunjucksEnv.addFilter("video", function(name) {
	var relativePath = (paths.relativeRoot === '') ? paths.video : paths.relativeRoot + '/' + paths.video;
	return relativePath + '/' + name;
});

nunjucksEnv.addFilter("style", function(name) {
	var relativePath = (paths.relativeRoot === '') ? paths.styles : paths.relativeRoot + '/' + paths.styles;
    return relativePath + '/' + name;
});

nunjucksEnv.addFilter("script", function(name) {
	var relativePath = (paths.relativeRoot === '') ? paths.scripts : paths.relativeRoot + '/' + paths.scripts;
	return relativePath + '/' + name;
});

nunjucksEnv.addFilter("file", function(name) {
	var relativePath = (paths.relativeRoot === '') ? paths.files : paths.relativeRoot + '/' + paths.files;
	return relativePath + '/' + name;
});

nunjucksEnv.addFilter("link", function(name) {
    if(name) {
        var relativePath = path.relative(path.dirname(path.pathFromRoot), name).replace(/\\/g,"/");
        return relativePath;
    } else {
        return name;
    }
});

nunjucksEnv.addFilter("linkid", function(input) {
	var thisUrl = searchJSONFlat(input, flatNavigation).url;
	if(typeof thisUrl != "undefined") {
		return path.relative(path.dirname(paths.pathFromRoot), thisUrl).replace(/\\/g,"/");
	}
	else {
		console.log("[linkid filter] ID " + input + ' was not found in: ' + path.pathFromRoot);
		return "#";
	}
});

nunjucksEnv.addFilter("obj", function(input) {
	var result = searchFlatJSON(input, flatNavigation);
	if(typeof result != "undefined") {
		return result;
	}
	else {
		console.log("[obj filter] ID " + input + ' was not found in: ' + path.pathFromRoot);
		return "#";
	}
});



gulp.task('checkYAML', function(done) {

    var originalNav = allLocalJSON;
    allLocalJSON = dirTree(paths.templates);

    if(JSON.stringify(originalNav) != JSON.stringify(allLocalJSON)) {
        console.log('[checkYAML] Updating navigation');
        navigation = updateNav();
        flatNavigation = flattenNav(navigation);
    }

    done();
});


                                                            
//  ad88888ba                       88                         
// d8"     "8b  ,d                  88                         
// Y8,          88                  88                         
// `Y8aaaaa,  MM88MMM  8b       d8  88   ,adPPYba,  ,adPPYba,  
//   `"""""8b,  88     `8b     d8'  88  a8P_____88  I8[    ""  
//         `8b  88      `8b   d8'   88  8PP"""""""   `"Y8ba,   
// Y8a     a8P  88,      `8b,d8'    88  "8b,   ,aa  aa    ]8I  
//  "Y88888P"   "Y888      Y88'     88   `"Ybbd8"'  `"YbbdP"'  
//                         d8'                                 
//                        d8'                                  

gulp.task('sass', function(done) {

    var stream = gulp.src(paths.styles + "/**/*.scss")
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.init()))
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cssnano(cssnanoSettings))
        .pipe(autoprefixer(autoprefixSettings))
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.local + "/" + paths.styles))
        .pipe(browserSyncLocal.reload({stream: true}))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + "/" + paths.styles)))
        .pipe(gulpif(argv.dist, browserSyncDist.reload({stream: true})));

    // pipe to CMS
    if(doPipeAssetsToCms) { stream = pipeStreamToCms(stream, paths.styles); }

    //return stream;
    done();
});

gulp.task('css', function(done) {

    var stream = gulp.src([paths.styles + '/**/*.css', '!' + paths.styles + '/**/*.min.css'])
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.init()))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cssnano(cssnanoSettings))
        .pipe(autoprefixer(autoprefixSettings))
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.local + "/" + paths.styles))
        .pipe(browserSyncLocal.reload({stream: true}))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + "/" + paths.styles)))
        .pipe(gulpif(argv.dist, browserSyncDist.reload({stream: true})));

    // pipe to CMS
    if(doPipeAssetsToCms) { stream = pipeStreamToCms(stream, paths.styles); }

    done();
});

gulp.task('css:min', function(done) {

    var stream = gulp.src(paths.styles + '/**/*.min.css')
        .pipe(gulp.dest(paths.local + "/" + paths.styles))
        .pipe(browserSyncLocal.reload({stream: true}))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + "/" + paths.styles)))
        .pipe(gulpif(argv.dist, browserSyncDist.reload({stream: true})));

    // pipe to CMS
    if(doPipeAssetsToCms) { stream = pipeStreamToCms(stream, paths.styles); }

    done();
});



                                                                         
//  ad88888ba                           88                                  
// d8"     "8b                          ""                ,d                
// Y8,                                                    88                
// `Y8aaaaa,     ,adPPYba,  8b,dPPYba,  88  8b,dPPYba,  MM88MMM  ,adPPYba,  
//   `"""""8b,  a8"     ""  88P'   "Y8  88  88P'    "8a   88     I8[    ""  
//         `8b  8b          88          88  88       d8   88      `"Y8ba,   
// Y8a     a8P  "8a,   ,aa  88          88  88b,   ,a8"   88,    aa    ]8I  
//  "Y88888P"    `"Ybbd8"'  88          88  88`YbbdP"'    "Y888  `"YbbdP"'  
//                                          88                              
//                                          88                              

gulp.task('scripts:head', function(done) {
    
    var stream = gulp.src(paths.scriptsHeadFiles)
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.init()))
        .pipe(concat('__head.min.js'))
        .pipe(uglify())
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.write()))
        .pipe(gulp.dest(paths.local + '/' + paths.scripts))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.scripts)));

    if(doPipeAssetsToCms) {
        stream = pipeStreamToCms(stream, paths.scripts);
    }

    done();
});

gulp.task('scripts:body', function(done) {
    
    var stream = gulp.src(paths.scriptsBodyFiles)
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.init()))
        .pipe(concat('__body.min.js'))
        .pipe(uglify())
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.write()))
        .pipe(gulp.dest(paths.local + '/' + paths.scripts))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.scripts)));

    if(doPipeAssetsToCms) {
        stream = pipeStreamToCms(stream, paths.scripts);
    }

    done();
});

gulp.task('scripts', function(done) {

    var stream = gulp.src([paths.scripts + '/**/*.js', '!' + paths.scripts + '/**/*.min.js', '!' + paths.scriptsHead + '/**/*', '!' + paths.scriptsBody + '/**/*'])
        .pipe(tap(function(file) {
            // find "var navJSON={};" and replace with navigation
            if(paths.appendNavTo == path.basename(file.path)) {
                var output = file.contents.toString().replace(/var navJSON={};/, 'var navJSON='+JSON.stringify(navigation) + ';');
                file.contents = Buffer.from(output);
            }
        }))
        .pipe(rename({suffix: '.min' }))
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.init()))
        .pipe(uglify())
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.write({includeContent: true})))
        .pipe(gulp.dest(paths.local + '/' + paths.scripts))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.scripts)));

    if(doPipeAssetsToCms) {
        stream = pipeStreamToCms(stream, paths.scripts);
    }

    done();
});

gulp.task('scripts:min', function(done) {

    var stream = gulp.src([paths.scripts + '/**/*.min.js', '!' + paths.scriptsHead + '/**/*.js', '!' + paths.scriptsBody + '/**/*.js'])
        .pipe(gulp.dest(paths.local + '/' + paths.scripts))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.scripts)));

    if(doPipeAssetsToCms) {
        stream = pipeStreamToCms(stream, paths.scripts);
    }

    done();
});



                                            
                                                                        
// 88                                                                      
// 88                                                                      
// 88                                                                      
// 88  88,dPYba,,adPYba,   ,adPPYYba,   ,adPPYb,d8   ,adPPYba,  ,adPPYba,  
// 88  88P'   "88"    "8a  ""     `Y8  a8"    `Y88  a8P_____88  I8[    ""  
// 88  88      88      88  ,adPPPPP88  8b       88  8PP"""""""   `"Y8ba,   
// 88  88      88      88  88,    ,88  "8a,   ,d88  "8b,   ,aa  aa    ]8I  
// 88  88      88      88  `"8bbdP"Y8   `"YbbdP"Y8   `"Ybbd8"'  `"YbbdP"'  
//                                      aa,    ,88                         
//                                       "Y8bbdP"                          
                                      
gulp.task('images', function(done) {

    var stream = gulp.src([paths.images + '/**/*'])
        .pipe(gulp.dest(paths.local + '/' + paths.images))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.images)));

    if(doPipeAssetsToCms) {
        stream = pipeStreamToCms(stream, paths.images);
    }

    //return stream;
    done();
});




                                                            
// 88b           d88                       88  88              
// 888b         d888                       88  ""              
// 88`8b       d8'88                       88                  
// 88 `8b     d8' 88   ,adPPYba,   ,adPPYb,88  88  ,adPPYYba,  
// 88  `8b   d8'  88  a8P_____88  a8"    `Y88  88  ""     `Y8  
// 88   `8b d8'   88  8PP"""""""  8b       88  88  ,adPPPPP88  
// 88    `888'    88  "8b,   ,aa  "8a,   ,d88  88  88,    ,88  
// 88     `8'     88   `"Ybbd8"'   `"8bbdP"Y8  88  `"8bbdP"Y8  

gulp.task('media', function(done) {

    var stream = gulp.src([paths.media + '/**/*'])
        .pipe(gulp.dest(paths.local + '/' + paths.media))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.media)));

    //return stream;
    done();
});




                                                           
// 8b           d8  88           88                           
// `8b         d8'  ""           88                           
//  `8b       d8'                88                           
//   `8b     d8'    88   ,adPPYb,88   ,adPPYba,   ,adPPYba,   
//    `8b   d8'     88  a8"    `Y88  a8P_____88  a8"     "8a  
//     `8b d8'      88  8b       88  8PP"""""""  8b       d8  
//      `888'       88  "8a,   ,d88  "8b,   ,aa  "8a,   ,a8"  
//       `8'        88   `"8bbdP"Y8   `"Ybbd8"'   `"YbbdP"'   

gulp.task('video', function(done) {

    var stream = gulp.src([paths.video + '/**/*'])
        .pipe(gulp.dest(paths.local + '/' + paths.video))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.video)));

    //return stream;
    done();
});




// 88888888888  88  88                         
// 88           ""  88                         
// 88               88                         
// 88aaaaa      88  88   ,adPPYba,  ,adPPYba,  
// 88"""""      88  88  a8P_____88  I8[    ""  
// 88           88  88  8PP"""""""   `"Y8ba,   
// 88           88  88  "8b,   ,aa  aa    ]8I  
// 88           88  88   `"Ybbd8"'  `"YbbdP"'  

// files folder + absolute files

gulp.task('files', function(done) {

    var stream = gulp.src([paths.files + '/**/*'])
        .pipe(gulp.dest(paths.local + '/' + paths.files))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.files)));

    //return stream;
    done();
});


gulp.task('files:absolute', function(done) {

    var copyStream = merge();
    if(paths.absoluteFiles.length > 0) {
        for(var i=0; i<paths.absoluteFiles.length; i++) {
            var src = gulp.src(paths.templates + '/' + paths.absoluteFiles[i].src)
                .pipe(gulp.dest(paths.local + '/' + paths.absoluteFiles[i].dest))
                .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.absoluteFiles[i].dest)));
            copyStream.add(src);
        }
    }
    return copyStream;

});




                                                               
// 88888888ba,                88                                  
// 88      `"8b               88                ,d                
// 88        `8b              88                88                
// 88         88   ,adPPYba,  88   ,adPPYba,  MM88MMM  ,adPPYba,  
// 88         88  a8P_____88  88  a8P_____88    88    a8P_____88  
// 88         8P  8PP"""""""  88  8PP"""""""    88    8PP"""""""  
// 88      .a8P   "8b,   ,aa  88  "8b,   ,aa    88,   "8b,   ,aa  
// 88888888Y"'     `"Ybbd8"'  88   `"Ybbd8"'    "Y888  `"Ybbd8"'  

function deleteNunjucksFile(filepath) {
    var toDelete = filepath.replace(/\\/g,"/").replace(paths.templates, paths.local).replace(/\.njk/, ".html");
	del([toDelete]).then(function(paths){
		console.log('[deleteNunjucksFile] Deleted ' + paths.join('\n'));
	});

    if(argv.dist) {
        toDelete = filepath.replace(/\\/g,"/").replace(paths.templates, paths.dist).replace(/\.njk/, ".html");
	    del([toDelete]).then(function(paths){
		    console.log('[deleteNunjucksFile] Deleted ' + paths.join('\n'));
	    });
    }
}

function deleteStyle(filepath) {
	var toDelete = filepath.replace(/\\/g,"/").replace(paths.styles, paths.local + '/' + paths.styles).replace(/\.scss|\.css|\.min\.css/, ".min.css");
	del([toDelete]).then(function(paths){
		console.log('[deleteStyle] Deleted ', paths.join('\n'));
	});
	if(settings.addSourceMaps) {
		del([toDelete + '.map']).then(function(paths){
			console.log('[deleteStyle] Deleted ', paths.join('\n'));
		});
    }
    
    if(argv.dist) {
        toDelete = filepath.replace(/\\/g,"/").replace(paths.styles, paths.dist + '/' + paths.styles).replace(/\.scss|\.css|\.min\.css/, ".min.css");
        del([toDelete]).then(function(paths){
            console.log('[deleteStyle] Deleted ', paths.join('\n'));
        });
        if(settings.addSourceMaps) {
            del([toDelete + '.map']).then(function(paths){
                console.log('[deleteStyle] Deleted ', paths.join('\n'));
            });
        }
    }
}

function deleteScript(filepath) {
    var toDelete = filepath.replace(/\\/g,"/").replace(paths.scripts, paths.local + '/' + paths.scripts).replace(/\.js|\.min\.js/, ".min.js");
	del([toDelete]).then(function(paths){
		console.log('[deleteScript] Deleted ', paths.join('\n'));
    });
    
    if(argv.dist) {
        toDelete = filepath.replace(/\\/g,"/").replace(paths.scripts, paths.dist + '/' + paths.scripts).replace(/\.js|\.min\.js/, ".min.js");
        del([toDelete]).then(function(paths){
            console.log('[deleteScript] Deleted ', paths.join('\n'));
        });
    }
}

function deleteImage(filepath) {
    var toDelete = filepath.replace(/\\/g,"/").replace(paths.images, paths.local + '/' + paths.images);
	del([toDelete]).then(function(paths){
		console.log('[deleteImage] Deleted ', paths.join('\n'));
    });
    
    if(argv.dist) {
        toDelete = filepath.replace(/\\/g,"/").replace(paths.images, paths.dist + '/' + paths.images);
        del([toDelete]).then(function(paths){
            console.log('[deleteImage] Deleted ', paths.join('\n'));
        });
    }
}

function deleteMedia(filepath) {
    var toDelete = filepath.replace(/\\/g,"/").replace(paths.media, paths.local + '/' + paths.media);
	del([toDelete]).then(function(paths){
		console.log('[deleteMedia] Deleted ', paths.join('\n'));
    });
    
    if(argv.dist) {
        toDelete = filepath.replace(/\\/g,"/").replace(paths.media, paths.dist + '/' + paths.media);
        del([toDelete]).then(function(paths){
            console.log('[deleteMedia] Deleted ', paths.join('\n'));
        });
    }
}

function deleteVideo(filepath) {
    var toDelete = filepath.replace(/\\/g,"/").replace(paths.videos, paths.local + '/' + paths.videos);
	del([toDelete]).then(function(paths){
		console.log('[deleteVideo] Deleted ', paths.join('\n'));
    });
    
    if(argv.dist) {
        toDelete = filepath.replace(/\\/g,"/").replace(paths.videos, paths.dist + '/' + paths.videos);
        del([toDelete]).then(function(paths){
            console.log('[deleteVideo] Deleted ', paths.join('\n'));
        });
    }
}

function deleteFile(filepath) {
    var toDelete = filepath.replace(/\\/g,"/").replace(paths.files, paths.local + '/' + paths.files);
	del([toDelete]).then(function(paths){
		console.log('[deleteFile] Deleted ', paths.join('\n'));
    });
    
    if(argv.dist) {
        toDelete = filepath.replace(/\\/g,"/").replace(paths.files, paths.dist + '/' + paths.files);
        del([toDelete]).then(function(paths){
            console.log('[deleteFile] Deleted ', paths.join('\n'));
        });
    }
}






//    ,ad8888ba,   88                                       
//   d8"'    `"8b  88                                       
//  d8'            88                                       
//  88             88   ,adPPYba,  ,adPPYYba,  8b,dPPYba,   
//  88             88  a8P_____88  ""     `Y8  88P'   `"8a  
//  Y8,            88  8PP"""""""  ,adPPPPP88  88       88  
//   Y8a.    .a8P  88  "8b,   ,aa  88,    ,88  88       88  
//    `"Y8888Y"'   88   `"Ybbd8"'  `"8bbdP"Y8  88       88  
 
gulp.task('clean', function(done) {

    // if piping assets to CMS folders, check that folders actually exist on the filesystem
    if(doPipeAssetsToCms) {
        for (i = paths.pipeAssetsToCms.length - 1; i >= 0; --i) {
            if(paths.pipeAssetsToCms[i].folderMustExist) {
                if(!directoryExists.sync(paths.pipeAssetsToCms[i].path)) {
                    console.log('[pipeAssetsToCms] Required path ' + paths.pipeAssetsToCms[i].path + " does not exist; removing from pipe list");
                    paths.pipeAssetsToCms.splice(i, 1);
                }
            }
        }

        // reset pipeAssetsToCms variable if none are now required
        if(paths.pipeAssetsToCms.length == 0) {
            doPipeAssetsToCms = false;
        }
    }

    if(argv.local) {
        generateNav();
        return del([paths.local + '/**/*']);
    }
    else if(argv.dist) {
        generateNav();
        return del([paths.local + '/**/*', paths.dist + '/**/*']);
    }
    else {
        readNav();
    }

    done();
});




//  ad88888ba                                                    
// d8"     "8b                                                   
// Y8,                                                           
// `Y8aaaaa,     ,adPPYba,  8b,dPPYba,  8b       d8   ,adPPYba,  
//   `"""""8b,  a8P_____88  88P'   "Y8  `8b     d8'  a8P_____88  
//         `8b  8PP"""""""  88           `8b   d8'   8PP"""""""  
// Y8a     a8P  "8b,   ,aa  88            `8b,d8'    "8b,   ,aa  
//  "Y88888P"    `"Ybbd8"'  88              "8"       `"Ybbd8"'  

gulp.task('reload:local', function(done) {
    browserSyncLocal.reload();
    done();
})

gulp.task('reload:dist', function(done) {
    browserSyncDist.reload();
    done();
})

gulp.task('serve', function(done) {

    browserSyncLocal.init(serverSettings);

    if(argv.dist) {
        browserSyncDist.init(serverSettingsDist);
    }

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

gulp.task('watch', function(done) {

    // recreate nav and re-do nunjucks and scripts if json is changed, then reload browser
    gulp.watch(paths.settings + '/*.json', gulp.series('generateNav', gulp.parallel('nunjucks', 'scripts'), argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});

    // recreate all files if a global template or include is touched
    gulp.watch(paths.templates+'/{' + paths.watchGlobalNunjucks.toString() + '}/*.njk', gulp.series('nunjucks', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});

    // recreate a single file if a single template is touched
    gulp.watch([paths.templates + '/**/*.njk', '!' + paths.templates + '/{' + paths.ignore.toString() + '}/*'], gulp.series('nunjucks:single', 'checkYAML', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local'))
        .on('unlink', deleteNunjucksFile)
        .on('error', function() {});

    // check for style changes
    gulp.watch(paths.styles + '/**/*.scss', gulp.series('sass', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local'))
        .on('unlink', deleteStyle)
        .on('error', function() {});

    gulp.watch([paths.styles + '/**/*.css', '!' + paths.styles + '/**/*.min.css'], gulp.series('css', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local'))
        .on('unlink', deleteStyle)
        .on('error', function() {});

    gulp.watch(paths.styles + '/**/*.min.css', gulp.series('css:min', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local'))
        .on('unlink', deleteStyle)
        .on('error', function() {});

    // check for script changes
    gulp.watch([paths.scripts + '/**/*.js', '!' + paths.scripts + '/**/*.min.js', '!' + paths.scriptsHead + '/**/*.js', '!' + paths.scriptsBody + '/**/*.js'], gulp.series('scripts', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local'))
        .on('unlink', deleteScript)
        .on('error', function() {});

    gulp.watch([paths.scripts + '/**/*.min.js', '!' + paths.scriptsHead + '/**/*.js', '!' + paths.scriptsBody + '/**/*.js'], gulp.series('scripts:min', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});
    gulp.watch(paths.scriptsHead + '/**/*.js', gulp.series('scripts:head', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});
    gulp.watch(paths.scriptsBody + '/**/*.js', gulp.series('scripts:body', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});

    // check for images, media, video, files
    gulp.watch(paths.images + '/**/*', gulp.series('images', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local'))
        .on('unlink', deleteImage)
        .on('error', function() {});

    gulp.watch(paths.media + '/**/*', gulp.series('media', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local'))
        .on('unlink', deleteMedia)
        .on('error', function() {});

    gulp.watch(paths.video + '/**/*', gulp.series('video', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local'))
        .on('unlink', deleteVideo)
        .on('error', function() {});
        
    gulp.watch(paths.files + '/**/*', gulp.series('files', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local'))
        .on('unlink', deleteFile)
        .on('error', function() {});

    done();
});




// 88888888ba,                   ad88                           88           
// 88      `"8b                 d8"                             88    ,d     
// 88        `8b                88                              88    88     
// 88         88   ,adPPYba,  MM88MMM  ,adPPYYba,  88       88  88  MM88MMM  
// 88         88  a8P_____88    88     ""     `Y8  88       88  88    88     
// 88         8P  8PP"""""""    88     ,adPPPPP88  88       88  88    88     
// 88      .a8P   "8b,   ,aa    88     88,    ,88  "8a,   ,a88  88    88,    
// 88888888Y"'     `"Ybbd8"'    88     `"8bbdP"Y8   `"YbbdP'Y8  88    "Y888  

gulp.task('default', gulp.series('clean', gulp.parallel('nunjucks', 'sass', 'css', 'css:min', 'scripts:head', 'scripts:body', 'scripts', 'scripts:min', 'files', 'files:absolute', 'images', 'media', 'video'), 'serve', 'watch'));















// ############################################################################################################################ 
// ############################################################################################################################ 

/* Question: is this still how we would do this? */



//  ad88888ba                            88                                 
// d8"     "8b                           ""    ,d                           
// Y8,                                         88                           
// `Y8aaaaa,    8b,dPPYba,   8b,dPPYba,  88  MM88MMM  ,adPPYba,  ,adPPYba,  
//   `"""""8b,  88P'    "8a  88P'   "Y8  88    88    a8P_____88  I8[    ""  
//         `8b  88       d8  88          88    88    8PP"""""""   `"Y8ba,   
// Y8a     a8P  88b,   ,a8"  88          88    88,   "8b,   ,aa  aa    ]8I  
//  "Y88888P"   88`YbbdP"'   88          88    "Y888  `"Ybbd8"'  `"YbbdP"'  
//              88                                                          
//              88                                                          

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
		folders: getFolders(paths.sprites),
		folderPath: [],
		relPathSprite: path.relative(paths.styles, paths.spriteImages).replace(/\\/g,"/")
	};
	
	for(var i=0;i<svgVar.folders.length;i++) {	//Generate folder paths
		svgVar.folderPath[i] = paths.sprites + '/' + svgVar.folders[i];
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
		var svgSettings = {
			"scale": 1,
			"padding": 0
		};
		
		//Retrieve/Merge settings.json file
		try {
			var fileSettings = JSON.parse(fs.readFileSync(svgVar.folderPath[i] + '/settings.json', 'utf8'));
			for(var obj in fileSettings){svgSettings[obj]=fileSettings[obj];}
		}catch(e){}//Ignore settings file
		
		//Set Scss template to use
		var svgSpriteTemplate = './sprites/scss-template-svg-background.handlebars';
		if(svgSettings.scale == 2) {
			svgSpriteTemplate = './sprites/scss-template-svg-background-x2.handlebars';
		}
		
		switch(svgSettings.svg) {
			case "inline":
				haveSVG = true;
				svgTasks.add(gulp.src(svgVar.folderPath[i]+'/*.svg')
				.pipe(svgSprite({
					mode: {
						defs:{
							dest: paths.spriteImages,
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
					shape: {spacing: {padding: svgSettings.padding}},
					mode: {
						css: {
							dest: './',
							sprite: paths.spriteImages+'/'+fileName+'.svg',
							prefix : fileName+'-%s',
							render: {
								scss: {
									template: svgSpriteTemplate,
									dest: paths.spriteStyles+'/_'+fileName+'.scss'
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
				console.log("[sprite-svg] WARNING svg attr can only be inline or background: " + fileName);
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
		var svgSettings = {
			"algorithm": "binary-tree",
			"scale": 1,
			"padding": 0
		};
		
		//Retrieve/Merge settings.json file
		try {
			var fileSettings = JSON.parse(fs.readFileSync(svgVar.folderPath[i] + '/settings.json', 'utf8'));
			for(var obj in fileSettings){svgSettings[obj]=fileSettings[obj];}
		}catch(e){}//Ignore settings file
		
		if(svgSettings.svg == "background") {
			pngFBTasks.add(gulp.src(paths.spriteImages+'/'+fileName+'.svg')
			.pipe(svg2png(1, false))
			.pipe(gulp.dest(paths.spriteImages)));
            
			if(svgSettings.scale != 1) {
				pngFBTasks.add(gulp.src(paths.spriteImages+'/'+fileName+'.svg')
				.pipe(svg2png(svgSettings.scale, false))
				.pipe(rename(fileName+'-x'+svgSettings.scale+'.png'))
				.pipe(gulp.dest(paths.spriteImages)));
			}
		}
		else {
			pngFBTasks.add(gulp.src(svgVar.folderPath[i]+'/*.svg')
			.pipe(svg2png(svgSettings.scale, false))
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
		var svgSettings = {
			"algorithm": "binary-tree",
			"scale": 1,
			"padding": 0
		};
		
		//Retrieve/Merge settings.json file
		try {
			var fileSettings = JSON.parse(fs.readFileSync(svgVar.folderPath[i] + '/settings.json', 'utf8'));
			for(var obj in fileSettings){svgSettings[obj]=fileSettings[obj];}
		}catch(e){}//Ignore settings file
		
		if(svgSettings.svg == "inline" || typeof svgSettings.svg == "undefined") {
			//Default handlebars scss template for png
			var scssTemplate = 'scss-template-png.handlebars';
			if(svgSettings.svg) {
				scssTemplate = 'scss-template-svg.handlebars';
				if(svgSettings.scale == 2) {
					scssTemplate = 'scss-template-svg-x2.handlebars';
					svgSettings.imgName = fileName+'-x2.png';
					svgSettings.imgPath = svgVar.relPathSprite+'/'+fileName+'-x2.png';
				}
			}
			else {
				if(svgSettings.scale == 2) {
					scssTemplate = 'scss-template-png-x2.handlebars';
					svgSettings.imgName = fileName+'-x2.png';
					svgSettings.imgPath = svgVar.relPathSprite+'/'+fileName+'-x2.png';
				}
			}
			
			var fallbackPath = (svgVar.relPathSprite+'/'+fileName+'.png').toString();
			
			var spriteSettings = {
				cssTemplate: paths.sprites+'/'+scssTemplate,
				imgName: fileName+'.png',
				cssName: '_'+fileName+'.scss',
				imgPath: svgVar.relPathSprite+'/'+fileName+'.png',
				cssSpritesheetName: fileName,
				cssVarMap: function(sprite) {
					sprite.name = sprite.name;
					sprite.sheetName = fileName;
					sprite.fallback = fallbackPath,
					sprite.padding = svgSettings.padding
				},
			};
			
			//Merge local settings with defaults
			for(var sprObj in svgSettings) {spriteSettings[sprObj]=svgSettings[sprObj];}
			
			var spriteData = gulp.src(svgVar.folderPath[i]+'/*.png')
			.pipe(spritesmith(spriteSettings));
			
			spriteData.css
			.pipe(gulp.dest(paths.spriteStyles));
			
			//If PNGx2, create x1 size
			if((!svgSettings.svg || svgSettings.svg == "inline") && svgSettings.scale == 2) {
				spriteData.img
				.pipe(buffer())
				.pipe(gulp.dest(paths.spriteImages))
				.pipe(jimp({scale: 0.5}))
				.pipe(rename(fileName+'.png'))
				.pipe(gulp.dest(paths.spriteImages));
			}
			else {
				spriteData.img
				.pipe(gulp.dest(paths.spriteImages));
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
			Buffer.from('<?xml version="1.0"?>'),
			file.contents
		]);
	}
	return file.contents;
}


//Creates sprites
//Generates PNG fallbacks
//Generates Scss
gulp.task('sprite', gulp.series('sprite-require', 'sprite-xml-fix', 'sprite-svg', 'sprite-png-fb', 'sprite-png'));