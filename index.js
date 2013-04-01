var editor,project;




var initLayout = function() {
    $('#layout').w2layout({
        name: 'layout',
        panels: [
            { 
                type: 'top',
                size: 60,
                style: '', 
                content: '<div id="top"><div id="menu"></div><div id="tabs"></div></div>' 
            },
            {
                type: 'main', 
                style: '', 
                content: '<div id="editor"></div>' 
            }
        ]
    });
};
var initEditor = function() {
    editor = ace.edit("editor");
    var session = editor.getSession();
    session.setMode("ace/mode/javascript");
    //var fontSize = 14;
    //editor.setFontSize(fontSize);
    editor.setShowPrintMargin(false);
    editor.on('change', function() {
        if(!project.curFile().get('changed')) {
                project.curFile().set('changed',true);
                renderTabs();
        }
    });
}

var selectNextTab = function() {
    var index = project.get('files').indexOf(project.curFile());
    if(project.get('files').length > index + 1) {
        project.curFile(project.get('files').at(index + 1));
    } else {
        project.curFile(project.get('files').at(0))
    }
};

var selectPrevTab = function() {
    var index = project.get('files').indexOf(project.curFile());
    if(index === 0) {
        project.curFile(project.get('files').at(project.get('files').length-1));
    } else {
        project.curFile(project.get('files').at(index-1));
    }
};
    
var initKeyCommands = function() {
    
    
    
    
    //font size --> ctrl-"=", ctrl-"-"
    document.addEventListener('keydown', function(e) {
        //plus
        if(e.keyCode === 187 && e.ctrlKey) {
            
            chrome.storage.sync.get('fontSize', function(obj) {
                var fontSize = obj.fontSize+1;
                editor.setFontSize(fontSize);
                chrome.storage.sync.set({fontSize: fontSize});
            });
            
            
        }
        if(e.keyCode === 189 && e.ctrlKey) {
            chrome.storage.sync.get('fontSize', function(obj) {
                var fontSize = obj.fontSize-1;
                editor.setFontSize(fontSize);
                chrome.storage.sync.set({fontSize: fontSize});
            });
        }
    });

    //init keyboard shortcuts
    key('ctrl+s', function(){ 
        if(key.shift) {
            saveAsFile();
        } else {
            saveFile();
        }
    });
    editor.commands.addCommand({
        name: 'save',
        bindKey: {win: 'Ctrl-s',  mac: 'Command-s'},
        exec: function(editor) {
            if(key.shift) {
                saveAsFile();
            } else {
                saveFile();
            }
        },
        //readOnly: true // false if this command should not apply in readOnly mode
    });
    
    key('ctrl+shift+s', function(){ 
        if(key.shift) {
            saveAsFile();
        } else {
            saveFile();
        }
    });
    editor.commands.addCommand({
        name: 'saveAs',
        bindKey: {win: 'Ctrl-Shift-s',  mac: 'Command-Shift-s'},
        exec: function(editor) {
            if(key.shift) {
                saveAsFile();
            } else {
                saveFile();
            }
        },
        //readOnly: true // false if this command should not apply in readOnly mode
    });
    
    key('ctrl+o', function(){ 
        openFile();
    });
    editor.commands.addCommand({
        name: 'open',
        bindKey: {win: 'Ctrl-o',  mac: 'Command-o'},
        exec: function(editor) {
            openFile();
        },
        //readOnly: true // false if this command should not apply in readOnly mode
    });
    
    key('ctrl+w', function(e){ 
        e.preventDefault();
        closeFile();
    });
    editor.commands.addCommand({
        name: 'close',
        bindKey: {win: 'Ctrl-w',  mac: 'Command-w'},
        exec: function(editor) {
            closeFile();
        },
        //readOnly: true // false if this command should not apply in readOnly mode
    });
    
    key('ctrl+t', function(e){ 
        e.preventDefault();
        newFile();
    });
    editor.commands.addCommand({
        name: 'new',
        bindKey: {win: 'Ctrl-t',  mac: 'Command-t'},
        exec: function(editor) {
            newFile();
        },
        //readOnly: true // false if this command should not apply in readOnly mode
    });
    
    
    
    //move tab
    key('ctrl+]', function(){
        selectNextTab();
    });
    editor.commands.addCommand({
        name: 'tab-right',
        bindKey: {win: 'Ctrl-]',  mac: 'Command-]'},
        exec: function(editor) {
            selectNextTab();
        },
        //readOnly: true // false if this command should not apply in readOnly mode
    });
    
    
    
    key('ctrl+[', function(){
        selectPrevTab();
    });
    
    editor.commands.addCommand({
        name: 'tab-left',
        bindKey: {win: 'Ctrl-[',  mac: 'Command-['},
        exec: function(editor) {
            selectPrevTab();
        },
        //readOnly: true // false if this command should not apply in readOnly mode
    });


};
var initToolbar = function() {
    
    var tabClick = function(id,data) {
        var val = data.event.target.childNodes[0].textContent;
        if(val.toLowerCase().indexOf('open') !== -1) {
                openFile();
        } else if(val.toLowerCase().indexOf('new') !== -1) {
                newFile();
        } else if(val.toLowerCase().indexOf('close') !== -1) {
                closeFile();
        } else if(val.toLowerCase().indexOf('save as') !== -1) {
                saveAsFile();
        } else if(val.toLowerCase().indexOf('save') !== -1) {
                saveFile();
        }
        data.event.preventDefault();
    };
    
    //init the toolbar
    $('#menu').w2toolbar({
        name: 'toolbar',
    	items: [
    		{ 
                type: 'menu',
                id: 'item2', 
                caption: 'File', 
                img: 'icon-folder', 
                items: [
    			    { 
                        text: 'New', 
                        icon: 'icon-page' 
                    }, 
    			    { 
                        text: 'Open...', 
                        id: "open",
                        value: "open",
                        icon: 'icon-page'
            		}, 
    			    { 
                        text: 'Save', 
                        value: 'Item Three', 
                        icon: 'icon-page' 
                    },
    			    { 
                        text: 'Save as...', 
                        value: 'Item Three', 
                        icon: 'icon-page' 
                    },
    			    { 
                        text: 'Close', 
                        value: 'Item Three',
                        icon: 'icon-page' 
                    }
    		    ]
            }
    	],
        onClick: tabClick
    });
};


var Project = Backbone.Model.extend({
    defaults: {
        currentFile: false
    },
    initialize: function() {
      this.set('files',new Files());  
      this.bind('change:currentFile', function() {
          renderTabs();
      });
      var files = this.get('files');
      files.bind('add', renderTabs);
      files.bind('remove', function() {
          if(!files.length) {
              files.add({});
          }
      });
      files.bind('remove',renderTabs);
    },
    findById: function(id) {
        //return this.get('files').findById(id);
        return this.get('files').select(function(file) {
            return file.getId() === id;
        })[0];
    },
    curFile: function(file) {
        var curFile = this.get('currentFile');
        if(file && curFile === file) return;
        if(file) {
            this.set('currentFile',file);
            file.renderText();
        } else if(!this.get('currentFile')) {
            if(!this.get('files').length) {
                this.get('files').add({});
            }
            this.set('currentFile',this.get('files').at(0));
        }
        return this.get('currentFile');
    }
});


var filesCount = 0;
var File = Backbone.Model.extend({
    defaults: {
        changed: true,
        text: '',
        name: "Untitled"
    },
    readEntry: function() {
        var that = this;
        var entry = this.get('entry');
        console.log(entry);
        this.set({
            name: entry.name,
            path: entry.fullPath
        });
        this.get('entry').file(function(file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                console.log(e);
                that.set('text',e.target.result);
                that.get('session').setValue(e.target.result);
            }
            reader.readAsText(file);
        });
    },
    initialize: function(settings) {
        console.log('File.initialize',arguments);
        this.set('session',ace.createEditSession(this.get('text'))); 
        if(typeof settings === 'object' && 'entry' in settings) {
            this.readEntry();
        } else {
            if(this.get('name') === 'Untitled') {
                if(filesCount) {
                    this.set('name',"Untitled" + filesCount);
                }
                filesCount++;
            }
            if(!this.get('path')) {
                this.set('path',("" + Math.random()).substring(2));
            }
        }
        this.bind('change:changed', function() {
            renderTabs();
        });
        this.bind('change:name', function() {
            renderTabs();
        });
        this.bind('change:text', function() {
            this.renderText();
        },this);
        this.bind('change:entry', function(model,entry) {
            this.set({
                name: entry.name,
                path: entry.fullPath
            });
            console.log('change',arguments);
        });
        
    },
    getId: function() {
        var id = this.get('path').replace('/','').replace('.','');
        return id;
    },
    renderText: function() {
        var session = this.get('session');
        var modes = {
            'js': "ace/mode/javascript",
            'md': "ace/mode/markdown",
            'markdown': "ace/mode/markdown",
            'html': "ace/mode/html",
        };
        var name = this.get('name');
        var ext = name.substring(name.lastIndexOf('.')+1).toLowerCase();
        if(ext in modes) {
            session.setMode(modes[ext]);
        }
        setTimeout(function() { 
            $("textarea").blur();
            $("textarea").focus();
            editor.setSession(session);
        },30);
    },
    save: function() {
        var that = this;
        chrome.fileSystem.getWritableEntry(this.get('entry'), function(entry) {
            entry.createWriter(function(writer) {
                writer.onerror = function(e) {
                        console.log("Write failed: " + e.toString());
                };
                writer.onwriteend = function(e) {
                        writer.onwriteend = function(e) {
                            //showFile();
                            getStat('saves', function(saves) {
                                if(typeof saves !== 'number') {
                                    saves = 0;
                                }
                                saves++;
                                setStat('saves',saves);
                            });
                        }
                        writer.truncate(blob.size);
                };
                var text = editor.getValue();
                that.set('text',text);
                var blob = new Blob([text]);
                writer.seek(0);
                waitForIO(writer,function() {
                        writer.write(blob);
                });
            }, function(e) {
                    console.log('error on createWriter',e);
            });
        });
    }
});

var Files = Backbone.Collection.extend({
    model: File,
    findById: function(id) {
        
    }
});

function waitForIO(writer, callback) {
  // set a watchdog to avoid eventual locking:
  var start = Date.now();
  // wait for a few seconds
  var reentrant = function() {
    if (writer.readyState===writer.WRITING && Date.now()-start<4000) {
      setTimeout(reentrant, 100);
      return;
    }
    if (writer.readyState===writer.WRITING) {
      console.error("Write operation taking too long, aborting!"+
        " (current writer readyState is "+writer.readyState+")");
      writer.abort();
    } else {
      callback();
    }
  };
  setTimeout(reentrant, 100);
}

var ct = 0;
var renderTabs = function() {
    var tabs = [];
    project.get('files').forEach(function(file) {
            tabs.push({
                    id: file.getId(),
                    caption: file.get('name') + (file.get('changed') ? '*' : ''),
                    closable: true
            });
    });
    ct++;
    $("#tabs").w2tabs({
            name: 'tabs' + ct, //needs a unique name for some reason
            active: project.curFile().getId(),
            tabs: tabs,
            onClick: function(id, e) {
                e.preventDefault();
                project.curFile(project.findById(id));
            },
            onClose: function(id) {
                    closeFile(id);
            }
    });
    $("textarea").focus();
    project.curFile().renderText();
}

var fileCt = 0;
var newFile = function() {
        //create a new, unnamed file.
        fileCt++;
        project.get('files').add({
                changed: true
        });
        project.curFile(project.get('files').last());
};
var openFile = function() {
        try {
                chrome.fileSystem.chooseEntry(function(entry) {
                        project.get('files').add({entry:entry,changed:false});
                        project.curFile(project.get('files').last());
                        $("body").focus();
                });
        } catch(e) {
                //probably user canceled
        }
};
var closeFile = function(id) {
        var file = project.curFile();
        if(id) {
                file = project.findById(id);
        }
        
        //TODO: if not saved, prompt to save.
        
        //close
        var index = project.get('files').indexOf(file);
        var files = project.get('files');
        files.remove(file);        
        if(files.length >= index+1) {
            project.curFile(files.at(index));
        } else {
            project.curFile(files.at(index-1));
        }
};
var saveFile = function() {
        //simply overwrite the file
        if(project.curFile().get('entry')) {
                project.curFile().save();
                project.curFile().set('changed',false);
        } else {
                saveAsFile();
        }
};
var saveAsFile = function() {
        var file = project.curFile();
        //offer to save as a new file
        chrome.fileSystem.chooseEntry({
                type: "saveFile",
                suggestedName: file.get('name') || ''
        }, function(entry) {
                if(entry) {
                    file.set('entry',entry);
                    file.set('changed',false);
                    //file.readEntry();
                    saveFile();
                } else {
                    throw "No entry received from chooseEntry";
                }
        });
};

var applySettings = function() {
    chrome.storage.sync.get('theme', function(val) {
        if(val.theme) {
            editor.setTheme(val.theme);
        }
    });
    
    chrome.storage.sync.get('fontSize', function(val) {
        if(val.fontSize) {
            editor.setFontSize(val.fontSize);
        }
    });
};

var getStat = function(key,cb) {
    chrome.storage.sync.get('stats', function(obj) {
        if(!('stats' in obj)) {
            obj.stats = {};
        }
        cb(obj.stats[key]);
    });
};
var setStat = function(key,v,fn) {
    chrome.storage.sync.get('stats', function(obj) {
        var stats = obj.stats || {};
        stats[key] = v;
        chrome.storage.sync.set({
            stats: stats
        }, function() {
            if(fn && typeof fn === 'function') {
                fn();
            }
        });
    });
}

var isFirstRun = function(cb) {
    chrome.storage.sync.get('initialized', function(obj) {
        cb(!obj.initialized);
    });
}

var init = function(cb) {
    chrome.storage.sync.get('initialized', function(obj) {
        if(obj.initialized) {
            return cb();
        } else {
            chrome.storage.sync.set({
                initialized: true,
                id: ("" + 100*Math.random()) + ("" + 100*Math.random()),
                fontSize: 14
            },cb);
        }
    });
};

var go = function() {
    project = new Project();
    initLayout();
    initEditor();
    initKeyCommands();
    initToolbar();
    applySettings();
    project.get('files').add([{}]);
    project.curFile().renderText();
};

isFirstRun(function(is) {
    if(is) {
        init(go);
    } else {
        go();
    }
});



var resetSettings = function() {
    chrome.storage.sync.set({initialized: false}, function() {
        init(function() {console.log("settings reset.")});
    })
};

var notifyAbout0_8 = function() {
    chrome.notifications.create('ChIDE-0.8-update',{
        iconUrl: "chide-128.png",
        title: "ChIDE updated to 0.8",
        message: "- Fixed the bug that was screwing up the session focus!",
        type: "list"
    }, function() { console.log(arguments);});
}

var version = 0.8;

chrome.storage.sync.get('version', function(val) {
    console.log(val.version);
    if(!val.version || val.version !== version) {
        chrome.storage.sync.set({version: version}, function() {
            notifyAbout0_8();
        });
    }
});




