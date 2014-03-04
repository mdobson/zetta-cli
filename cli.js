#!/usr/bin/env node

var program = require('commander'),
    pkg = require('./package.json'),
    path = require('path'),
    spawn = require('child_process').spawn,
    argo = require('argo'),
    titan = require('titan'),
    siren = require('argo-formatter-siren'),
    FogRuntime = require('./fog_runtime'),
    CloudClient = require('./cloud_client'),
    fs = require('fs');

program
  .version(pkg.version)
  .usage('[options]')
  .option('new')
  .option('run')
  .option('open')
  .option('cloud')
  .option('--host -h [host]')
  .option('--port -p [port]', parseInt)
  .parse(process.argv);

if(program.new) {
  var p = path.join(process.cwd(), program.args[0]);
  var s = path.join(__dirname, './app');
  fs.mkdir(p, function(err) {
    if(err) {
      console.log('Error creating folder!');
    } else {
      var cp = spawn('cp', [ '-r', s+'/.', p ]);

      cp.stderr.on('data', function(d) {
        console.log('error:'+d);
      });

    }
  });
}

if(program.run) {
  var dir = process.cwd();
  var app = require(path.join(dir, 'app'));

  var scouts = fs.readdirSync(path.join(dir, 'scouts')).filter(function(scoutPath) {
    if (/^.+\.js$/.test(scoutPath)) {
      return scoutPath;
    }
  }).map(function(scoutPath) {
    return require(path.join(dir, 'scouts', scoutPath));
  });

  var server = argo()
    .use(titan)
    .allow('*')
    .format({ directory : path.join(__dirname,'api_formats'), engines: [siren], override: {'application/json': siren}})
    .logger();

  var fog = new FogRuntime(server, scouts);
  fog.init(function(err) {
    var apps = [app];
    fog.loadApps(apps);
    if(program.cloud) {
      var port = 80 || program.port;
      port = ''+port;
      var host = 'http://elroy.io' || program.host;
        
      var endpoint = host+':'+port; 
      CloudClient(server, client, function(server) {
        server.listen(3002, function(){});
      });
    } else {
      server.listen(3002,function(){
      });
    }
    
  });

}


if(program.open) {
  var app = path.basename(process.cwd());
  var o = spawn('open', ['http://siren-api-browser.herokuapp.com/#/entity?url=http:%2F%2Flocalhost:3002%2Fhello']);
}