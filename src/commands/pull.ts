import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import {InfernoAPI} from '../utilities/infernoAPI'
import Messages from '../utilities/messages'
import NovoUtils from '../utilities/novo-utils';

const fs = require('fs-extra');
const path = require('path');
const notifier = require('node-notifier');
const {cosmiconfig} = require('cosmiconfig');
const chalk = require('chalk');
const moment = require('moment');
const cheerio = require('cheerio');

export default class Pull extends Command {
  static description = 'Pull code snippets to Inferno AR Instance associated with your login'
  static examples = [
    '$ inferno pull projectname',
  ]

  static args = [{name: 'project', required: true, description: 'project name to pull from'}];
  static flags = {
    // can pass either --create or -c
    create: flags.boolean({char: 'c'}),
  }
  util: NovoUtils = new NovoUtils();

  async run() {

    const {args, flags} = this.parse(Pull);
    const message = new Messages();
    this.log(message.starting);

    const project = await this.util.getConfig(args.project);

    // log into inferno and fetch the snippets
    this.log(chalk.blue('Starting to Pull Snippets for ') + chalk.yellowBright(project.domain));
    const inferno = new InfernoAPI();
    await inferno.init(project.username, project.password, project.domain);
    this.log(chalk.cyan('Authenticated to Inferno: clientId = ' + inferno.clientId));
    const snippets = await inferno.fetchSnippets();

    cli.action.stop();

    if (flags.create) {
      this.createLocalFiles(inferno, project, snippets);
    } else {
      // output the results to the console
      this.displaySnippets(snippets);
    }

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

  private createLocalFiles(inferno: InfernoAPI, project: any, snippets: any) {
    snippets.forEach((snippet: any) => {
      const template = path.join(__dirname, '../assets/template.html');
      const templateTargetPath = path.join(this.util.basePath, project.name, snippet.snippetType + '/' + snippet.name + '.html');

        inferno.fetchLatestSnippetCode(snippet.id, snippet.name).then(item => {
          if(!item || !item.snippet) return;

          const contents = fs.readFileSync(template).toString();
          const $ = cheerio.load(contents, {decodeEntities: false});
          const wrapper = $(this.util.wrapperElement);
          const newLine = '\n\r';
          wrapper.attr('id', snippet.id);
          wrapper.html(newLine + item.snippet + newLine);
          const newContents = $('html').html();
          fs.outputFile(templateTargetPath, newContents);
          this.log(chalk.green('Created '), chalk.blue(templateTargetPath));
        }).catch((err: any) => {
           this.log(chalk.redBright('ERROR - unable to create file for '), templateTargetPath);
           this.log(err);

          });

    })
  }


}
