inferno-cli
===========

a command line tool for working with Inferno AR Virtual Event Platform. 
pulls snippet info from system and allows you to generate local files for 
testing an push the code snippets back up to the platform.

# Initial install from source
```sh-session
$ sudo npm install 
$ sudo npm run prepack
$ sudo npm run postpack
$ sudo npm link
```

# Usage
<!-- usage -->
```sh-session
$ inferno COMMAND
running command...
$ inferno (-v|--version|version)
inferno-cli/0.0.1 win32-x64 node-v12.14.0
$ inferno --help [COMMAND]
USAGE
  $ inferno COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`inferno diff PROJECT`](#inferno-diff-project)
* [`inferno generate [PROJECT] [FILE]`](#inferno-generate-project-file)
* [`inferno help [COMMAND]`](#inferno-help-command)
* [`inferno pull PROJECT`](#inferno-pull-project)
* [`inferno push PROJECT FILE`](#inferno-push-project-file)

## `inferno diff PROJECT`

Compare local code snippets with snippets on the server

```
USAGE
  $ inferno diff PROJECT

ARGUMENTS
  PROJECT  project name to compare snippets from

EXAMPLE
  $ inferno diff projectname
```

_See code: [src\commands\diff.ts](https://github.com/novologic/inferno-cli/blob/v0.0.1/src\commands\diff.ts)_

## `inferno generate [PROJECT] [FILE]`

Creates a new project directory if it does not exists and creates a new Code Snippet Template HTML file in the project directory

```
USAGE
  $ inferno generate [PROJECT] [FILE]

OPTIONS
  -f, --file=file        file name to create. Will be created under project folder
  -h, --help             show CLI help

  -p, --project=project  directory for project. Will be created if it does not already exist. The project name needs to
                         exist in inferno.config.js file

  -t, --test             set to test
```

_See code: [src\commands\generate.ts](https://github.com/novologic/inferno-cli/blob/v0.0.1/src\commands\generate.ts)_

## `inferno help [COMMAND]`

display help for inferno

```
USAGE
  $ inferno help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src\commands\help.ts)_

## `inferno pull PROJECT`

Pull code snippets to Inferno AR Instance associated with your login

```
USAGE
  $ inferno pull PROJECT

ARGUMENTS
  PROJECT  project name to pull from

OPTIONS
  -c, --create  create local template files from code snippets that exist on the server. Files will be placed in sub
                directories based on snippet type. local files WILL BE OVERWRITTEN if they already exist

EXAMPLE
  $ inferno pull projectname
```

_See code: [src\commands\pull.ts](https://github.com/novologic/inferno-cli/blob/v0.0.1/src\commands\pull.ts)_

## `inferno push PROJECT FILE`

Push code snippets to Inferno AR Instance associated with your login

```
USAGE
  $ inferno push PROJECT FILE

ARGUMENTS
  PROJECT  project/directory to push from
  FILE     file name to push (relative to project dir) you can use wild cards "main*.*" "Lobby*.*"
OPTIONS
  -c, --comment=comment  [default: Updated via inferno-cli] comment to add to snippet revision when pushed
  -h, --help             show CLI help
  -u, --update           if omitted, updates to the target system will not take place

EXAMPLES
  $ inferno push acme *.*
  $ inferno push acme category/lobby.html -u
  $ inferno push -p=acme -f="category/lobby.html" -c="updating breakout session links" -u
```

_See code: [src\commands\push.ts](https://github.com/novologic/inferno-cli/blob/v0.0.1/src\commands\push.ts)_
<!-- commandsstop -->


## CONFIGURATION

inferno-cli requires a config file to understand what files to process
and where to push the  code snippets to

use $ inferno pull to get a list of existing snippets and their ids

create a file in the root of the directory that will contain your project(s)
```
.inferno.config.js
```
**mono repo directory example**

allows you to run `$ inferno` command from the all-my-projects 

````
$ all-my-projects
 - project-1
   - file1.html
   - file2.html
 - project-2
   - file-a.html
   - file-b.html
 - inferno.config.js
````

**single repo directory example**

will need to `$ inferno ` command from my-project

````
$ my-project
 - file-1.html
 - file-2.html
 - file-3.html
 - inferno.config.js
````


**example contents of inferno.config.js**
```
const projects: [
    {
      name: 'my-project',
      username: 'xxxxxxxxxx',
      password: 'xxxxxxxxxx',
      dueDate: '2021-01-19T08:00'
    },
  ];

try {
  module.exports = {
    projects
  }
} catch {
  // do nothing
}

``` 


- projects: [an array of projects], each project can bet set up with different InfernoAR credentials, and set of snippets to manage
  - name: is the [project] name you want to refer to when running the inferno commands
  - username: inferno AR username with admin access credentials
  - password: inferno AR password

## IMPORTANT ##
Since **inferno.config.js** contains usernames and passwords, be sure to keep the file 
locally secure and add it to gitgnore or other repo ignore systems.
