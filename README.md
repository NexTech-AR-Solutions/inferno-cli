inferno-cli
===========

A command line tool for working with Inferno AR Virtual Event Platform

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
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
