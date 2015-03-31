'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var getRootDir = require('../helpers/get-root-dir');
var path = require('path');

var ModuleGenerator = module.exports = function ModuleGenerator() {
  // By calling `NamedBase` here, we get the argument to the subgenerator call
  // as `this.name`.
  yeoman.generators.NamedBase.apply(this, arguments);

  var fileJSON = this.config.get('config');

  // options
  this.projectName = fileJSON.projectName;
  this.jsFramework = fileJSON.jsFramework;
  this.singlePageApplication = fileJSON.singlePageApplication;
  this.jsOption = fileJSON.jsOption;
  this.jsTemplate = fileJSON.jsTemplate;
  this.cssOption = fileJSON.cssOption;
  this.sassSyntax = fileJSON.sassSyntax;
  this.testFramework = fileJSON.testFramework;
  this.useTesting = fileJSON.useTesting;
  this.useJsx = fileJSON.useJsx;
  this.htmlOption = fileJSON.htmlOption;
  this.useDashboard = fileJSON.useDashboard;
  this.useServer = fileJSON.useServer;
  this.useServerTesting = fileJSON.useServerTesting;

  this.moduleLocation = this.moduleLocation || 'client';

};

util.inherits(ModuleGenerator, yeoman.generators.NamedBase);

// Prompts
ModuleGenerator.prototype.ask = function ask() {

  var self = this;
  var done = this.async();
  var prompts = [{
    when: function() {
      return self.useServer;
    },
    type: 'list',
    name: 'moduleLocation',
    message: 'Where would you like to create this module?',
    choices: ['Client', 'Server'],
    filter: function(val) {
      var filterMap = {
        'Client': 'client',
        'Server': 'server'
      };

      this.moduleLocation = filterMap[val];

      return filterMap[val];
    }
  }, {
    when: function() {
      return self.htmlOption === 'jade' || self.htmlOption === 'swig';
    },
    type: 'list',
    name: 'type',
    message: 'What type of module do you want to create?',
    choices: ['Page', 'Layout', 'Module'],
    filter: function(val) {
      var filterMap = {
        'Page': 'page',
        'Layout': 'layout',
        'Module': 'module'
      };

      return filterMap[val];
    }
  }, {
    when: function(answers) {
      return self.singlePageApplication;
    },
    name: 'moduleFile',
    message: 'Where would you like to create this module?',
    default: this.moduleLocation + '/app'
  },  {
    when: function(answers) {
      return answers.type === 'page';
    },
    name: 'moduleFile',
    message: 'Where would you like to create this module?',
    default: this.moduleLocation + '/app'
  }, {
    when: function(answers) {
      return answers.type === 'page';
    },
    name: 'useLayout',
    message: 'What layout would you like to extend from?',
    default: 'layouts/base'
  }, {
    when: function(answers) {
      return answers.type === 'module';
    },
    name: 'moduleFile',
    message: 'Where would you like to create this module?',
    default: this.moduleLocation + '/app/modules'
  }, {
    when: function(answers) {
      return answers.type === 'layout';
    },
    name: 'moduleFile',
    message: 'Where would you like to create this module?',
    default: this.moduleLocation + '/app/layout'
  }, {
    when: function(answers) {
      return self.jsFramework === 'angular';
    },
    name: 'moduleURL',
    message: 'URL of new module?',
    default: '/someurl'
  }];

  this.prompt(prompts, function(answers) {

    this.type = answers.type;
    this.useLayout = answers.useLayout || false;

    this.moduleLocation = answers.moduleLocation;

    this.templateFile = path.join(
        answers.moduleFile,
        this._.slugify(this.name.toLowerCase())
      );

    this.packageFile = path.join(
        answers.moduleFile,
        this._.slugify(this.name.toLowerCase()),
        'package'
      );

    // Get root directory
    this.rootDir = getRootDir(answers.moduleFile);

    this.moduleFile = path.join(
        answers.moduleFile,
        this._.slugify(this.name.toLowerCase()),
        this._.slugify(this.name.toLowerCase())
      );
    this.testFile = path.join(
        answers.moduleFile,
        this._.slugify(this.name.toLowerCase()),
        '__tests__',
        this._.slugify(this.name.toLowerCase())
      );

    this.moduleURL = answers.moduleURL;

    this.htmlURL = path.join(
        answers.moduleFile.replace('client', ''),
        this._.slugify(this.name.toLowerCase()),
        this._.slugify(this.name.toLowerCase()),
        '.html'
      );

    done();
  }.bind(this));
};

ModuleGenerator.prototype.files = function files() {

  if (!this.singlePageApplication) {

    if (this.htmlOption === 'jade') {
      if (this.type === 'module') {
        this.template('module.jade', this.moduleFile + '.jade');
      }
      else if (this.type === 'layout') {
        this.template('module.jade', this.moduleFile + '.jade');
      }
      // Default to page type
      else {
        this.template('module.jade', this.moduleFile + '.jade');
      }
    }
    else if (this.htmlOption === 'swig') {
      if (this.type === 'module') {
        this.template('module.swig', this.moduleFile + '.swig');
      }
      else if (this.type === 'layout') {
        this.template('module.swig', this.moduleFile + '.swig');
      }
      // Default to page type
      else {
        this.template('module.swig', this.moduleFile + '.swig');
      }
    }

    if (this.moduleLocation === 'client') {
      if (this.jsOption === 'requirejs') {
        this.template(this.moduleLocation + '/requirejs/module.js', this.moduleFile + '.js');
        if (this.useTesting) {
          this.template(this.moduleLocation + '/requirejs/module.spec.js', this.testFile + '.spec.js');
        }
      }
      else if (this.jsOption === 'browserify') {
        this.template(this.moduleLocation + '/browserify/module.js', this.moduleFile + '.js');
        if (this.useTesting) {
          this.template(this.moduleLocation + '/browserify/module.spec.js', this.testFile + '.spec.js');
        }
      }
      // Default to vanilla JS
      else {
        this.template(this.moduleLocation + '/js/module.js', this.moduleFile + '.js');
        if (this.useTesting) {
          this.template(this.moduleLocation + '/js/module.spec.js', this.testFile + '.spec.js');
        }
      }
    }

    if (this.moduleLocation === 'server') {
      this.template('server/package.json', this.packageFile + '.json');
      this.template('server/module.js', this.moduleFile + '.js');
      this.template('server/module.controller.js', this.moduleFile + '.controller.js');
      if (this.useServerTesting) {
        this.template('server/module.spec.js', this.testFile + '.spec.js');
      }
    }
  }
  else if (this.jsFramework === 'angular') {
    this.template('angular/module.js', this.moduleFile + '.js');
    this.template('angular/module.controller.js', this.moduleFile + '.controller.js');
    this.template('angular/module.html', this.moduleFile + '.html');

    if (this.useTesting) {
      this.template('angular/module.spec.js', this.testFile + '.controller.spec.js');
    }
  }
  else if (this.jsFramework === 'react') {
    if (this.useJsx) {
      this.template('react/module.jsx', this.moduleFile + '.jsx');
    }
    else {
      this.template('react/module.js', this.moduleFile + '.js');
    }

    if (this.useTesting) {
      this.template('react/module.spec.js', this.testFile + '.spec.js');
    }
  }
  else if (this.jsFramework === 'backbone') {
    if (this.jsOption === 'requirejs') {
      this.template('backbone/requirejs/module.js', this.moduleFile + '.js');
      if (this.useTesting) {
        this.template('backbone/requirejs/module.spec.js', this.testFile + '.spec.js');
      }
    }
    else if (this.jsOption === 'browserify') {
      this.template('backbone/browserify/module.js', this.moduleFile + '.js');
      if (this.useTesting) {
        this.template('backbone/browserify/module.spec.js', this.testFile + '.spec.js');
      }
    }
    // Default to Vanilla JS
    else {
      this.template('backbone/js/module.js', this.moduleFile + '.js');
      if (this.useTesting) {
        this.template('backbone/js/module.spec.js', this.testFile + '.spec.js');
      }
    }

    if (this.jsTemplate === 'handlebars') {
      this.template('backbone/module.html', this.moduleFile + '.hbs');
    }
    else if (this.jsTemplate === 'jade') {
      this.template('backbone/module.html', this.moduleFile + '.jade');
    }
    // Default to underscore templates
    else {
      this.template('backbone/module.html', this.moduleFile + '.jst');
    }
  }

  if (this.cssOption === 'sass') {
    if (this.sassSyntax === 'sass') {
      this.template('module.css', this.moduleFile + '.sass');
    }
    else {
      this.template('module.css', this.moduleFile + '.scss');
    }
  }
  else if (this.cssOption === 'less') {
    this.template('module.css', this.moduleFile + '.less');
  }
  else if (this.cssOption === 'stylus') {
    this.template('module.css', this.moduleFile + '.styl');
  }
  else {
    this.template('module.css', this.moduleFile + '.css');
  }
};
