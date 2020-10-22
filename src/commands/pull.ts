import {Command} from '@oclif/command'
import cli from 'cli-ux'
import {InfernoAPI} from '../utilities/infernoAPI'
import Messages from '../utilities/messages'
import NovoUtils from '../utilities/novo-utils';

const path = require('path');
const notifier = require('node-notifier');
const {cosmiconfig} = require('cosmiconfig');
const chalk = require('chalk');
const moment = require('moment');

export default class Pull extends Command {
  static description = 'Pull code snippets to Inferno AR Instance associated with your login'
  static examples = [
    '$ inferno pull projectname',
  ]

  static args = [{name: 'project', required: true, description: 'project name to pull from'}]

  async run() {

    const {args} = this.parse(Pull);
    const message = new Messages();
    this.log(message.starting);

    const util = new NovoUtils();
    const project = await util.getConfig(args.project);

    // log into inferno and fetch the snippets
    cli.action.start('Fetching Snippets', 'initializing', {stdout: true})

    this.log(chalk.blue('Starting to Pull Snippets for ') + chalk.red(project.name));
    const inferno = new InfernoAPI();
    await inferno.init(project.username, project.password, project.domain);
    this.log(chalk.cyan('Authenticated to Inferno: clientId = ' + inferno.clientId));
    const snippets = await inferno.fetchSnippets();

    cli.action.stop();

    // output the results to the console
    this.displaySnippets(snippets);
    this.log(message.finished);
  }


  private displaySnippets(snippets: any) {
    this.log('\n\n');
    const columns = {
      name: {
        header: 'Snippet',
        get: (row: any) => chalk.yellow(row.name)
      },
      id: {
        header: 'ID',
        get: (row: any) => chalk.blue(row.id)
      },
      revisions: {
        header: '    Revisions',
        get: (row: any) => row.revisions ? '    ' + chalk.reset(row.revisions.length) : chalk.reset('    ' + 0)
      },
      snippetType: {header: 'Type'},
      createDate: {
        header: 'created',
        get: (row: any) => chalk.reset(moment(row.createDate).format('lll'))
      },
    };

    const options = {
      printLine: this.log,
      sort: 'Snippet'
    }

    cli.table(snippets, columns, options)
  }
}
