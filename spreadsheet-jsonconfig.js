// Description:
//   mirrors a google spreadsheet to a static json file, to be used json store (handy for shared global configuration usin symlinks e.g.)
//
// environment:
//   export GOOGLE_SPREADSHEET_CONFIG_NAME="my.administration"
//   export GOOGLE_SPREADSHEET_CONFIG_SHEET="config"
//   export GOOGLE_SPREADSHEET_CONFIG_URL="http://foo.com"
//   export GOOGLE_SPREADSHEET_CONFIG_JSONFILE="../../config.json"
// 
// Commands:
//   hubot config
//
// Author:
//   coder of salvation

module.exports = function(robot) {

  var Spreadsheet = require('edit-google-spreadsheet');
  var Url         = require('url');
  var ITEMS_KEY   = "spreadsheet_urls";
  var Table       = require('easy-table');
  var MAXROWS     = 60; // prevent flooding
  var cache       = false;

  function nickname(msg, match) {
      if (!match || match.toLowerCase().trim() === "me") {
          return msg.message.user && msg.message.user.name || "unknown";
      }
      return match;
  }

  /* this is not a smart webrequests since its very slow..not adviced.. */

  robot.router.get( '/'+robot.name+'/spreadsheet/config', function(req, res){
    if( ! process.env.GOOGLE_SPREADSHEET_CONFIG_URLJSON ){
      res.writeHead(404);
      res.write("not enabled");
      return;
    }
    Spreadsheet.load({
      debug: true,
      spreadsheetName: process.env.GOOGLE_SPREADSHEET_CONFIG_NAME,
      worksheetName: process.env.GOOGLE_SPREADSHEET_CONFIG_SHEET,
      // Choose from 1 of the 3 authentication methods:
      //    1. Username and Password
      username: process.env.GOOGLE_SPREADSHEET_LOGIN,
      password: process.env.GOOGLE_SPREADSHEET_PASSWD,
    }, function sheetReady(err, spreadsheet) {
      spreadsheet.receive({ getValues: true },function(err, rows, info) {
       if(err) throw err;
       var data  = {};
       var nrows = 1; for( i in rows ) nrows++;
       var columns = rows[1];
       var start = 2;
       for( i = 2; i < nrows; i++ ){
         var value = rows[i][2];
         value = ( value[0] == "{" || value[0] == "[" ) ? JSON.parse(value) : value;
         data[ rows[i][1] ] = value;
       }
       var response = JSON.stringify(data);
       res.writeHead(200, { 'Content-Length': response.length, 'Content-Type': 'application/json' });
       res.write(response);
       res.end();
      });
    });
  });
  
  function writeFile(rows){
    var fs = require('fs');
    var file = __dirname+"/"+process.env.GOOGLE_SPREADSHEET_CONFIG_JSONFILE;
    var data  = {};
    var nrows = 1; for( i in rows ) nrows++;
    var columns = rows[1];
    var start = 2;
    for( i = 2; i < nrows; i++ ){
      var value = rows[i][2];
      if( value != undefined && value.length && (value[0] == "{" || value[0] == "[") ){
        try{ 
          value = JSON.parse(value);
        }catch(e){ return "*** WARNING ***: there's corrupt json in the spreadsheet\n\n"; }
      }
      data[ rows[i][1] ] = value;
    }
    var response = JSON.stringify(data);
    if( response == "{}" ) return console.log("sorry corrupt json"); 
    fs.writeFile( file, response, function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log(file+" was saved!");
      }
    }); 
  }

  robot.respond(/config$/i, function(msg) {
     var search = false;
     Spreadsheet.load({
       debug: true,
       spreadsheetName: process.env.GOOGLE_SPREADSHEET_CONFIG_NAME,
       worksheetName: process.env.GOOGLE_SPREADSHEET_CONFIG_SHEET,
       // Choose from 1 of the 3 authentication methods:
       //    1. Username and Password
       username: process.env.GOOGLE_SPREADSHEET_LOGIN,
       password: process.env.GOOGLE_SPREADSHEET_PASSWD,
     }, function sheetReady(err, spreadsheet) {
       spreadsheet.receive({ getValues: true },function(err, rows, info) {
         if(err) throw err;
         var warning = writeFile(rows);
         var t     = new Table; 
         var nrows = 0;
         for( i in rows ) nrows++;
         var columns = rows[1];
         var start = 2;
         var end   = search ? nrows-1 : start+MAXROWS;
         for( i = start; i < nrows; i++ ){
           t.cell( columns[1], rows[i][1] != undefined ? rows[i][1] : "" );
           t.cell( columns[2], rows[i][2] != undefined ? rows[i][2] : "" );
           t.newRow();
         }
         //for( i = start; i < end; i++ ){
         //  var empty=true;
         //  for( column in columns ){
         //    if( rows[i] != undefined && ( !search || rowContains(rows[i],search) ) ){
         //      t.cell( columns[column], rows[i][column] != undefined ? rows[i][column] : "" );
         //      empty = false;
         //    }
         //  }
         //  if(!empty) t.newRow();
         //}
         var str = (warning != undefined ? warning : "") + t.toString()+"\nedit values @ "+process.env.GOOGLE_SPREADSHEET_CONFIG_URL;
         if( process.env.GOOGLE_SPREADSHEET_CONFIG_URLJSON ) str += "\njson url: "+process.env.GOOGLE_SPREADSHEET_CONFIG_URLJSON;
         return msg.send( str );
       });
     });
  });

};
