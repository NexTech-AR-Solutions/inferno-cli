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
* `inferno help [COMMAND]`
* `inferno pull [PROJECT] [update]`
* `inferno push [PROJECT]`


## `inferno pull [PROJECT]`

```
USAGE
  $ inferno pull [project]

ARGUMENTS
  project - name of project defined in inferno.config.js file

EXAMPLE
  $ inferno pull novo
  
```

## `inferno push [PROJECT] [update]`

```
USAGE
  $ inferno push [project] update

ARGUMENTS
  project - name of project defined in inferno.config.js file
  update -  if provided will push the code to the server, 

EXAMPLE
  $ inferno push novo update

EXAMPLE
  $ inferno push novo 
  displays output of files that would be updated  

```


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
Since *inferno.config.js* contains usernames and passwords, be sure to keep the file 
locally secure and add it to gitgnore or other repo ignore systems.


