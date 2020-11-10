const chalk = require('chalk');

export default class Messages {
  command = '';

 constructor(command: string) {
   this.command = command.toUpperCase();
 }
  starting = '\n' + chalk.yellow(`************* Starting Inferno CLI ${this.command} *************`) + '\n'
  finished = '\n' + chalk.yellow(`************* Complete Inferno CLI ${this.command} *************`) + '\n'


}
