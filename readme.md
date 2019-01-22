# Flag Base 4

Node version 10.14.1
Yarn v1.12.1
Gulp 4.0.0
Nunjucks

## Gulp parameters ##

`gulp`
Builds to exising __local folder (not source-controlled)

`gulp --local`
Deletes existing __local folder and recreates all local files (not source-controlled)

`gulp --cms`
Also pipes site assets (styles, scripts, images) to specified folders for use in CMS projects

`gulp --dist`
Builds to __local AND __dist folders - __dist IS source-controlled, and should be used for deploying etc.

