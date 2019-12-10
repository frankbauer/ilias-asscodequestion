const     conf = require('./package.json')
        , exec = require('child_process').exec
        , shell = require('shelljs')
        , path = require('path')
        , vueconf = require('./vue.config')

        
const dest = path.join('..', 'codeblocks', conf.version);
console.log("Deploying CodeBlocks to '" +dest + "'");

const vuecli = exec('vue-cli-service build --dest ' + dest, function(code, stdout, stderr) 
{
    //console.log('Exit code:', code); 
    shell.rm(path.join(dest, 'index.html'))   
    shell.rm(path.join(dest, 'favicon.ico')) 

    shell.config.silent = true;
    const conffile = path.join(dest, 'ilias-conf.php')
    shell.echo('<?php ').to(conffile)
    shell.echo('define("CODEBLOCKS_VERSION",     "'+conf.version+'");').toEnd(conffile)
    shell.echo('define("CODEBLOCKS_BASE_URI",     "./'+vueconf.publicPath+'");').toEnd(conffile)
    shell.echo('define("CODEBLOCKS_REL_PATH",     "'+path.join('codeblocks', conf.version)+'/");').toEnd(conffile)
    shell.echo('define("CODEBLOCKS_TAG_REGEX",     "/\{:([\w]+)}/g");').toEnd(conffile)
    shell.echo('?> ').toEnd(conffile)

    const targetconf = path.join('..', 'classes', 'support', 'codeblocks-conf-'+conf.version+'.php')
    console.log(conffile, targetconf);
    shell.cp(conffile, targetconf)
}
);

vuecli.stdout.on('data', function(data) {
    console.log(data);
});

vuecli.stderr.on('data', function(data) {
    console.error(data);
});