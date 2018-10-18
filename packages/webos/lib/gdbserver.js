var util=require("util"),async=require("async"),path=require("path"),npmlog=require("npmlog"),request=require("request"),spawn=require("child_process").spawn,fs=require("fs"),readLine=require("readline"),novacom=require("./novacom"),installer=require("./install"),prefixPath="/media/developer/",prefixAppPath=prefixPath+"apps/usr/palm/applications",prefixServicePath=prefixPath+"apps/usr/palm/services",defaultGdbserverPort="9930";
(function(){var e=npmlog;e.heading="gdbserver";e.level="warn";var m={log:e,session:null,run:function(a,h,f){function r(b){installer.list(a,function(n,d){d instanceof Array&&(a.instPkgs=d);b(n)})}function c(b){e.verbose("gdbserver#_makeSession");a.nReplies=1;a.session=new novacom.Session(a.device,b)}function s(b,a){this.session=b;b.run("if ! type gdbserver > /dev/null; then echo 1; else echo 0; fi;",null,function(b){if("1"==(Buffer.isBuffer(b)?b.toString().trim():b.trim()))return a(Error("gdbserver command is not available in the target device"));
setImmediate(a)},null,function(b){if(b)return setImmediate(a,b)})}function m(b){function n(a){f=Buffer.isBuffer(a)?a.toString().trim():a.trim();if("{"===f[0])e.verbose("gdbserver#run()#_readAppInfo#metaData:",f),b(null,f);else return b(Error("Failed to get appinfo.json"))}e.verbose("gdbserver#_readAppInfo");var d=g||k;if(a.instPkgs){var t=g?"applications":"services";a.instPkgs.every(function(b){return-1!==d.indexOf(b.id)?(prefixAppPath=prefixServicePath=path.join(path.dirname(b.folderPath),"..",t).replace(/\\/g,
"/"),!1):!0})}if(g)var c=path.join(prefixAppPath,g,"appinfo.json");else if(k)c=path.join(prefixServicePath,k,"services.json");else return b(Error("gdbserver launch failed due to no appId"));var c=c.replace(/\\/g,"/"),u="cat "+c,f;async.series([function(b){a.session.run(u,process.stdin,n,process.stderr,b)}],function(a,n){if(a)return b(Error(d+" was not installed"))})}function v(b,a){e.verbose("gdbserver#run()#_getExecFileName#metaData:",b);try{var d=JSON.parse(b);if(g){if(!d.main)return a(Error("Failed to get Executable File Name from appinfo.json"));
if("web"===d.type)return a(Error(d.id+" is not a native app"));this.execName=d.main}else if(k){if("native"!==d.engine)return a(Error(d.id+" is not a native service"));this.execName=d.executable}e.verbose("gdbserver#run()#_getExecFileName#execName:",this.execName);a()}catch(c){a(c)}}function q(b,c){function d(a){a=Buffer.isBuffer(a)?a.toString().trim():a.trim();if("0"===a)f.port=b,c();else if("1"===a)b=Number(b)+1,q(b,c);else return c(Error("Failed to get Debug Port"))}e.verbose("gdbserver#run()#_findNewDebugPort#gdbPort:",
b);null===b&&(b=p);"function"===typeof b&&(c=b,b=p);var f=this,h=util.format("netstat -ltn 2>/dev/null | grep :%s | wc -l",b);async.series([function(b){a.session.run(h,process.stdin,d,process.stderr,b)}],function(a,b){if(a)return c(a)})}function w(b){function c(a){d=Buffer.isBuffer(a)?d.concat(a.toString()):d.concat(a);setImmediate(b,null,d)}e.verbose("gdbserver#run()#_getEnvFromDevice");if("root"!=a.session.getDevice().username)setImmediate(b,null,"");else{var d="";a.session.run("find /etc/jail_native_devmode.conf 2>/dev/null | xargs awk '/setenv/{printf \"export %s=%s;\\n\", $2,$3}' | xargs echo",
null,c,null,function(a){if(a)return setImmediate(b,a)})}}function x(a,c){e.verbose("gdbserver#run()#_addUserEnv");if(g)var d={SDL_VIDEODRIVER:"wayland",XDG_RUNTIME_DIR:"/tmp/xdg",LD_LIBRARY_PATH:"$LD_LIBRARY_PATH:"+path.join(prefixAppPath,g,"lib").replace(/\\/g,"/")};else k&&(d={LD_LIBRARY_PATH:"$LD_LIBRARY_PATH:"+path.join(prefixServicePath,k,"lib").replace(/\\/g,"/")});d=a.concat(function(a,b){var c="";Object.keys(a).forEach(function(b){c=c.concat("export ").concat(b).concat("=").concat(a[b]).concat(";")});
return c}(d));c(null,d)}function y(b,c){e.verbose("gdbserver#run()#_launchGdbserver");var d;g?d=path.join(prefixAppPath,g):k&&(d=path.join(prefixServicePath,k));d=util.format("cd %s && gdbserver :%s %s",d,this.port,path.join(d,this.execName)).replace(/\\/g,"/");a.session.runNoHangup(b+d,function(a){a=Buffer.isBuffer(a)?a.toString():a;console.log("[gdbserver] "+a)},function(){e.verbose("gdbserver#run()#_launchGdbserver#__exit");process.exit(0)},c)}function z(b){e.verbose("gdbserver#run()#_portForward");
a.session.forward(this.port,this.port,b)}function A(b){e.verbose("gdbserver#run()#_waitExit");var c=a.session.getDevice();console.log(" >> gdb can connect to [target remote",c.host+":"+this.port+"]\n");b()}if("function"!==typeof f)throw Error("Missing completion callback (next="+util.inspect(f)+")");var l=this,g=a.appId,k=a.serviceId,p=a.port||defaultGdbserverPort;if(g||k){var B=0;process.on("SIGINT",function(){e.verbose("This is SIGINT handling...");0<B++&&(e.verbose("To prevent hangup due to an abnormal disconnection"),
process.exit(1));async.waterfall([c.bind(l),function(a,c){l.session=a;c()},l.getPidUsingPort.bind(l,l.port),l.killProcByPid.bind(l),function(a){l.session.end();setTimeout(a,500)}],function(a,c){a&&process.exit(1);process.exit(0)})});async.waterfall([r,c.bind(this),s.bind(this),m.bind(this),v.bind(this),this.getPidUsingPort.bind(this,p),this.killProcByPid.bind(this),q.bind(this,p),w.bind(this),x.bind(this),y.bind(this),z.bind(this),A.bind(this)],function(a,c){e.verbose("gdbserver#run()","err: ",a,
"result:",c);f(a,c)})}else f(Error("gdbserver launch failed due to no appId"))},close:function(a,h,f){e.verbose("gdbserver#close");h=a.port||defaultGdbserverPort;if("function"!==typeof f)throw Error("Missing completion callback (next="+util.inspect(f)+")");async.waterfall([function(f){a.nReplies=1;a.session=new novacom.Session(a.device,f)}.bind(this),function(a,c){this.session=a;c()}.bind(this),this.getPidUsingPort.bind(this,h),this.killProcByPid.bind(this),function(a){setTimeout(a,1E3)},this.closeSession],
function(a,c){e.verbose("gdbserver#close()","err: ",a,"results:",c);f(a,c)})},killPrevGdbserver:function(a){options.session?this.session.runNoHangup("kill -9 `pidof gdbserver` 2>/dev/null",a):a(Error("gdbserver#killPrevGdbserver()#no session"))},getPidUsingPort:function(a,e){function f(a){(a=Buffer.isBuffer(a)?a.toString().trim():a.trim())?(a=a.split(" ").filter(function(a){return""!==a.trim()}),e(null,a)):e()}"function"===typeof a&&(e=a,a=defaultGdbserverPort);if(this.session){var m=util.format("fuser -n tcp %s 2>/dev/null | awk '{print $0}' | xargs echo",
a);async.series([function(a){this.session.run(m,process.stdin,f,process.stderr,a)}.bind(this)],function(a,f){if(a)return e(a)})}else e(Error("gdbserver#getPidUsingPort()#no session"))},killProcByPid:function(a,h){e.verbose("gdbserver#killProcByPid");if("function"===typeof a)return a();if(!this.session)return h(Error("gdbserver#killPrevGdbserver()#no session"));var f=[];if(a instanceof Array)f=a;else if(a instanceof String)f.push(a);else return h(Error("gdbserver#killPrevGdbserver()#no pid"));f=util.format("kill -9 %s 2>/dev/null",
f.join(" "));this.session.runNoHangup(f,h)},closeSession:function(a){if(!this.session)return e.verbose("This session is already terminated"),a();this.session.end();this.session=null;a()}};"undefined"!==typeof module&&module.exports&&(module.exports=m)})();