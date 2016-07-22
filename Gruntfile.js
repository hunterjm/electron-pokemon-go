var packagejson = require('./package.json');
var electron = require('electron-prebuilt');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  var target = grunt.option('target') || 'development';
  var env = process.env;
  env.NODE_PATH = '..:' + env.NODE_PATH;
  env.NODE_ENV = target;

  var BASENAME = 'Pokemon Go';
  var OSX_APPNAME = BASENAME + ' (Beta)';
  var WINDOWS_APPNAME = BASENAME + ' (Beta)';
  var LINUX_APPNAME = BASENAME + ' (Beta)';
  var OSX_OUT = './dist';
  var OSX_OUT_X64 = OSX_OUT + '/' + OSX_APPNAME + '-darwin-x64';
  var OSX_FILENAME = OSX_OUT_X64 + '/' + OSX_APPNAME + '.app';

  grunt.initConfig({
    IDENTITY: 'Developer ID Application: Jason Hunter',
    OSX_FILENAME: OSX_FILENAME,
    OSX_FILENAME_ESCAPED: OSX_FILENAME.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),

    // electron
    electron: {
      windows: {
        options: {
          name: BASENAME,
          dir: 'build/',
          out: 'dist',
          version: packagejson['electron-version'],
          platform: 'win32',
          arch: 'x64',
          asar: false,
          icon: 'util/pokemongo.ico'
        }
      },
      osx: {
        options: {
          name: OSX_APPNAME,
          dir: 'build/',
          out: 'dist',
          version: packagejson['electron-version'],
          platform: 'darwin',
          arch: 'x64',
          asar: true,
          'app-version': packagejson.version
        }
      },
      linux: {
        options: {
          name: LINUX_APPNAME,
          dir: 'build/',
          out: 'dist',
          version: packagejson['electron-version'],
          platform: 'linux',
          arch: 'x64',
          asar: true,
          'app-bundle-id': 'com.hunterjm.pokemongo',
          'app-version': packagejson.version
        }
      }
    },

    rcedit: {
      exes: {
        files: [{
          expand: true,
          cwd: 'dist/' + BASENAME + '-win32-x64',
          src: [BASENAME + '.exe']
        }],
        options: {
          icon: 'util/pokemongo.ico',
          'file-version': packagejson.version,
          'product-version': packagejson.version,
          'version-string': {
            'CompanyName': 'Jason Hunter',
            'ProductVersion': packagejson.version,
            'ProductName': WINDOWS_APPNAME,
            'FileDescription': WINDOWS_APPNAME,
            'InternalName': BASENAME + '.exe',
            'OriginalFilename': BASENAME + '.exe',
            'LegalCopyright': 'Copyright 2016 Jason Hunter. All rights reserved.'
          }
        }
      }
    },

    // images
    copy: {
      dev: {
        files: [{
          expand: true,
          cwd: '.',
          src: ['package.json', 'settings.json', 'index.html'],
          dest: 'build/'
        }, {
          expand: true,
          cwd: 'images/',
          src: ['**/*'],
          dest: 'build/'
        }, {
          expand: true,
          cwd: 'fonts/',
          src: ['**/*'],
          dest: 'build/'
        }]
      },
      windows: {
        files: [{
          expand: true,
          cwd: 'resources',
          src: [],
          dest: 'dist/' + BASENAME + '-win32-x64/resources/resources'
        }],
        options: {
          mode: true
        }
      },
      osx: {
        files: [{
          expand: true,
          cwd: 'resources',
          src: [],
          dest: '<%= OSX_FILENAME %>/Contents/Resources/resources/'
        }, {
          src: 'util/pokemongo.icns',
          dest: '<%= OSX_FILENAME %>/Contents/Resources/electron.icns'
        }],
        options: {
          mode: true
        }
      }
    },

    rename: {
      installer: {
        src: 'dist/Setup.exe',
        dest: 'dist/' + BASENAME + 'Setup-' + packagejson.version + '-Windows-Beta.exe'
      }
    },

    // styles
    less: {
      options: {
        sourceMapFileInline: true
      },
      dist: {
        files: {
          'build/main.css': 'styles/main.less'
        }
      }
    },

    // javascript
    babel: {
      options: {
        sourceMap: 'inline'
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.js'],
          dest: 'build/',
        }]
      }
    },

    eslint: {
      target: ['src/**']
    },

    shell: {
      electron: {
        command: electron + ' ' + 'build',
        options: {
          async: true,
          execOptions: {
            env: env
          }
        }
      },
      sign: {
        options: {
          failOnError: false,
        },
        command: [
          'codesign --deep -v -f -s "<%= IDENTITY %>" <%= OSX_FILENAME_ESCAPED %>/Contents/Frameworks/*',
          'codesign -v -f -s "<%= IDENTITY %>" <%= OSX_FILENAME_ESCAPED %>',
          'codesign -vvv --display <%= OSX_FILENAME_ESCAPED %>',
          'codesign -v --verify <%= OSX_FILENAME_ESCAPED %>'
        ].join(' && '),
      },
      zip: {
        command: 'ditto -c -k --sequesterRsrc --keepParent "<%= OSX_FILENAME %>" "release/' + BASENAME + '-Mac.zip"',
      },
      install: {
        command: 'npm install --production',
        options: {
          execOptions: {
            cwd: 'build/'
          }
        }
      }
    },

    clean: {
      release: ['build/', 'dist/'],
    },

    compress: {
      windows: {
        options: {
	        archive: './release/' +  BASENAME + '-Windows.zip',
          mode: 'zip'
        },
        files: [{
          expand: true,
          dot: true,
          cwd: './dist/Pokemon Go-win32-x64',
          src: '**/*'
        }]
	    },
    },

    // livereload
    watchChokidar: {
      options: {
        spawn: true
      },
      livereload: {
        options: {livereload: true},
        files: ['build/**/*']
      },
      js: {
        files: ['src/**/*.js'],
        tasks: ['newer:babel']
      },
      less: {
        files: ['styles/**/*.less'],
        tasks: ['less']
      },
      copy: {
        files: ['images/*', 'index.html', 'fonts/*'],
        tasks: ['newer:copy:dev']
      }
    }
  });

  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('default', ['newer:babel', 'eslint', 'less', 'newer:copy:dev', 'shell:install', 'shell:electron', 'watchChokidar']);
  grunt.registerTask('release', ['clean:release', 'babel', 'eslint', 'less', 'copy:dev', 'shell:install', 'electron:osx', 'copy:osx', 'shell:sign', 'shell:zip']);
  // grunt.registerTask('release', ['clean:release', 'babel', 'eslint', 'less', 'copy:dev', 'shell:install', 'electron', 'copy:osx', 'shell:sign', 'shell:zip', 'copy:windows', 'rcedit:exes', 'compress']);

  process.on('SIGINT', function () {
    grunt.task.run(['shell:electron:kill']);
    process.exit(1);
  });
};
