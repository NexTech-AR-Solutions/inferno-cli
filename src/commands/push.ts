import {Command} from '@oclif/command'
import {InfernoAPI} from '../utilities/infernoAPI'
import NovoUtils from '../utilities/novo-utils';
import Messages from '../utilities/messages'
import cli from 'cli-ux';

const cheerio = require('cheerio');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const beautify = require('js-beautify').html;

export default class Push extends Command {
  static description = 'Push code snippets to Inferno AR Instance associated with your login'

  static examples = [
    '$ inferno push projectname',
  ]

  static args = [
    {name: 'project', required: true, description: 'project name to push'},
    {name: 'update', default: '', description: 'if = "update", then push code to server, otherwise just output test'}
  ]

  message: Messages = new Messages();
  util: NovoUtils = new NovoUtils();
  inferno: InfernoAPI = new InfernoAPI();
  projectName: string | null | undefined;

  async run() {
    this.log(this.message.starting);

    const {args} = this.parse(Push);
    const project = await this.util.getConfig(args.project);
    this.projectName = args.project;
    const snippets = project.snippets;

    if (args.update.toLowerCase() !== 'update') {
      this.displaySnippets(snippets);
      this.log(this.message.finished);
      return;
    }

    await this.inferno.init(project.username, project.password);
    snippets.forEach((snippet: any) => {
      if(snippet.update) {
        this.putSnippets(snippet);
      } else {
        this.log(chalk.yellow('Skipping Update - '), snippet.file);
      }
    })

  }

  private getFullPath(fileName: string) {
    return path.join(this.util.basePath, this.projectName, fileName);
  }

  private displaySnippets(snippets: any) {
    const columns = {
      update: {
        header: 'Update',
        get: (row: any) => row.update ? 'UPDATE' : 'SKIP'
      },
      file: {
        header: 'Local File',
        get: (row: any) => chalk.yellow(this.getFullPath(row.file))
      },
      id: {
        header: 'To Snippet ID',
        get: (row: any) => chalk.blue(row.id)
      }
    };

    const options = {
      sort: 'Local File',
      printLine: this.log
    }

    cli.table(snippets, columns, options);
    console.log(chalk.bold('\n use => inferno push {project} update') + ' to actually commit files to the server');
  }

  private putSnippets(snippet: any) {
    const codeSnippet = this.getSnippetCode(snippet.file);
    if (!codeSnippet) {
      const warningMessage = chalk.reset('skipping ' + this.getSnippetCode(snippet.file)) +
        ' no code snippet exists or element <' + this.util.wrapperElement + '> does not exist in the file';
      this.log(chalk.yellowBright('WARNING : '), warningMessage);
      return;
    }

    const newSnippet = {
      codeSnippetId: snippet.id,
      comments: "Updated via inferno-cli",
      id: "00000000-0000-0000-0000-000000000000",
      revisionDate: moment().format(),
      snippet: codeSnippet
    }

    this.inferno.postSnippet(newSnippet)
      .then((res: any) => {
        const successMessage = chalk.reset(this.getFullPath(snippet.file)) +
          ' - id: ' + res.id;
        this.log(chalk.cyanBright('UPDATED '), successMessage);
      })
      .catch(error => {
        this.log(chalk.red('ERROR updating ' + snippet.file));
        this.log(error);
      });

  }

  private getSnippetCode(fileName: string) {
    const contents = fs.readFileSync(this.getFullPath(fileName)).toString();
    const $ = cheerio.load(contents);
    const rawCode = $(this.util.wrapperElement).html();
    return beautify(rawCode);
  }

}

