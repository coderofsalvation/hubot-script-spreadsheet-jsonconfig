hubot-script-spreadsheet-jsonconfig
===================================

mirrors a google spreadsheet to a static json file, to be used json store (handy for shared global configuration usin symlinks e.g.)

<img alt="" src="https://raw.githubusercontent.com/coderofsalvation/hubot-script-spreadsheet-jsonconfig/master/cat.gif"/>

### environment

    export GOOGLE_SPREADSHEET_CONFIG_NAME="my.administration"
    export GOOGLE_SPREADSHEET_CONFIG_SHEET="config"
    export GOOGLE_SPREADSHEET_CONFIG_URL="https://docs.google.com/spreadsheet/ccc?key=0AqBbmgd8asHXc&usp=drive_web#gid=2"
    export GOOGLE_SPREADSHEET_CONFIG_JSONFILE="../../config.json"

### commands
  
    hubot> hubot config
    Key             Value
    --------------  ----------------------------
    iplist.allow    ["127.0.0.1","192.121.12.1"]
    foo             bar
    
    edit configuration @ https://docs.google.com/spreadsheet/ccc?key=0AqBbmgd8asHXc&usp=drive_web#gid=2

( the same data is written to ../../config.json, which you can symlink to your application directories )

### Features

* you only need a spreadsheet which starts at row 2 (so you can use row 1 for the columnnames) with 2 columns (key/value)-pair
* you can either just write strings or json-syntax in the spreadsheet
* will not update jsonfile when corrupt json is present
