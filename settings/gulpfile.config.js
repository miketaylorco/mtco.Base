//Version 2.0.2

var addSourcemaps = true;

var addStyleguide = true;

var paths = {
    src: {
        styles: 'assets/styles',
        scripts: 'assets/scripts',
		scriptsHead: 'assets/scripts/_head',
		scriptsBody: 'assets/scripts/_body',
        templates: 'templates',
        files: 'assets/files',
		images: 'assets/images',
        videos: 'assets/videos',
        globalJSON: 'settings/global.json',
        navJSONAppend: 'common.js',
        navJSON: 'settings/nav.json',
        navDebugJSON: 'settings/debug/nav.debug.json',
        navFlatDebugJSON: 'settings/debug/navFlat.debug.json',
        
        stylenavJSON: 'settings/stylenav.json',
    	stylenavDebugJSON: 'settings/debug/stylenav.debug.json',
    	styleFolder:'templates/_style',
		
		sprite: 'sprite',
		spriteImages: 'assets/images/sprites',
		spriteStyles: 'assets/styles/sprites'
    },
    dist: {
        styles: 'build/assets/styles',
        scripts: 'build/assets/scripts',
        headScript: 'head.min.js',
        bodyScript: 'body.min.js',
		files: 'build/assets/files',
		images: 'build/assets/images',
        videos: 'build/assets/videos',
        build: 'build',
		
		spriteImages: 'build/assets/images/sprites'
    }
};

//Files that will be copied to a destination
var absoluteFiles = [
     {
       src: 'templates/favicon.ico',
       dest: 'build'
     }
	//Example of copying a folder into build.
	// {
	// 	src: 'assets/test/**/*',
	// 	dest: 'build/assets/test'
	// }
];

//Scripts to concatenate
var headScripts = [
  paths.src.scriptsHead+'/modernizr-3.3.1.min.js',
  paths.src.scriptsHead+'/respond.min.js'
];

var bodyScripts = [
  paths.src.scriptsBody+'/_jquery-throttle-debounce.js',
  paths.src.scriptsBody+'/_js-cookie.js',
  paths.src.scriptsBody+'/console-fix.js',
  paths.src.scriptsBody+'/pageSwap.plugin.js',
  paths.src.scriptsBody+'/picturefill.min.js'
];

// add style guide JS if debugging
if(addStyleguide) {
	bodyScripts.push(paths.src.scriptsBody+'/_styleguide.js');
}

// {{ 'image.jpg' | image }} -> ../../{assetsPath.images}image.jpg
var assetPath = {
	styles: 'assets/styles/',
	scripts: 'assets/scripts/',
    images: 'assets/images/',
    videos: 'assets/videos/',
	files: 'assets/files/'
};

//Server settings (BrowserSync)
//http://www.browsersync.io/docs/options/
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
		baseDir: paths.dist.build
	},
	ghostMode: true,
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



//Exports settings to allow gulpfile to require this file.
//If you add a variable, add it here to access it in gulpfile.js
module.exports = {
    addSourcemaps: addSourcemaps,
    addStyleguide: addStyleguide,
    absoluteFiles: absoluteFiles,
    paths: paths,
    headScripts: headScripts,
    bodyScripts: bodyScripts,
    assetPath: assetPath,
    serverSettings: serverSettings,
    autoprefixSettings: autoprefixSettings,
    minifyHTMLOptions: minifyHTMLOptions,
    cssnanoSettings: cssnanoSettings
}