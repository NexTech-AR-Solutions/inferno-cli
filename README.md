inferno-cli
===========

A command line tool for working with Inferno AR Virtual Event Platform

# Usage
<!-- usage -->
```sh-session
$ npm install -g inferno-cli
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
* [`inferno generate [PROJECT] [FILE] [TEST]`](#inferno-generate-project-file-test)
* [`inferno pull PROJECT`](#inferno-pull-project)
* [`inferno push PROJECT [UPDATE]`](#inferno-push-project-update)
* [`inferno help [COMMAND]`](#inferno-help-command)

## `inferno generate [PROJECT] [FILE] [TEST]`

Creates a new project directory if it does not exists and creates a new Code Snippet Template HTML file in the project directory

```
USAGE
  $ inferno generate [PROJECT] [FILE] [TEST]

OPTIONS
  -f, --file=file        file name to create in the project folder
  -h, --help             show CLI help
  -p, --project=project  project to create file in
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

EXAMPLE
  $ inferno pull projectname
```

_See code: [src\commands\pull.ts](https://github.com/novologic/inferno-cli/blob/v0.0.1/src\commands\pull.ts)_

## `inferno push PROJECT [UPDATE]`

Push code snippets to Inferno AR Instance associated with your login

```
USAGE
  $ inferno push PROJECT [UPDATE]

ARGUMENTS
  PROJECT  project name to push
  UPDATE   if = "update", then push code to server, otherwise just output test

EXAMPLE
  $ inferno push projectname
```

_See code: [src\commands\push.ts](https://github.com/novologic/inferno-cli/blob/v0.0.1/src\commands\push.ts)_
<!-- commandsstop -->


## CONFIGURATION

inferno-cli requires a config file to understand what files to process
and where to push the  code snippets to

use $ inferno pull to get a list of existing snippets and their ids

create a file in project directory
```
inferno.config.js
```

*example contents of inferno.config.js*
```
module.exports = {
  projects: [
    {
      name: 'novo',
      wrapperElement: 'novowidget',
      username: 'xxxxxxxxxx',
      password: 'xxxxxxxxxx',
      snippets: [
        {'file': 'test/index.html', 'id': 'xxxxx-xxxxx-xxxxx-xxxxxx-xxxxxx-xxxx'},
      ],
    },
  ],
}
``` 


- projects: [an array of projects], each project can bet set up with different
InfernoAR credentials, and set of snippets to manage
  - name: is the [PROJECT] name you want to refer to when running the inferno commands
  - wrapperElement: - name of HTML element in the local html file that contains the code 
you want to push up as a snippet example <novowidget></novowidget> = 'novowidget'
  - username: inferno AR username with admin access credentials
  - password: inferno AR password
  - snippets: [ array of snippets to mamange ]
    - file: relative file path to your local file
    - id: Inferno AR internal ID for the code snippet


## IMPORTANT ##
Since **inferno.config.js** contains usernames and passwords, be sure to keep the file 
locally secure and add it to gitgnore or other repo ignore systems.
