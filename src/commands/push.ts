import {Command, flags} from '@oclif/command'
import {InfernoAPI} from '../utilities/infernoAPI'
import NovoUtils, {Project} from '../utilities/novo-utils';
import Messages from '../utilities/messages'
import cli from 'cli-ux';

const cheerio = require('cheerio');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const FileSet = require('file-set');
const moment = require('moment');

// beautify currently breaks files with liquid in them we will skipp doing this for now
// const beautify = require('js-beautify').html;

export type Snippet = {
  file: string,
  id: string,
  comment: string,
  code: string,
}

export default class Push extends Command {
  static description = 'Push code snippets to Inferno AR Instance associated with your login'

  static examples = [
    '$ inferno push acme *.*',
    '$ inferno push acme category/lobby.html -u',
    '$ inferno push -p=acme -f="category/lobby.html" -c="updating breakout session links" -u',
  ]

  static paramDesc = {
    project: 'project/directory to push from',
    file: 'file name to push (relative to project dir) or *all to push all files in project sub dir',
    comment: 'comment to add to snippet revision when pushed',
    update: 'if omitted, updates to the target system will not take place',
  }

  static flags = {
    help: flags.help({char: 'h'}),
    comment: flags.string({char: 'c', default: "Updated via inferno-cli", description: Push.paramDesc.comment}),
    update: flags.boolean({char: 'u', default: false, description: Push.paramDesc.update}),
  }

  static args = [
    {name: 'project', required: true, description: Push.paramDesc.project},
    {name: 'file', required: true, description: Push.paramDesc.file},
  ]

  message: Messages = new Messages();
  util: NovoUtils = new NovoUtils();
  inferno: InfernoAPI = new InfernoAPI();
  snippets: Array<Snippet>;
  project: Project;
  comment: string;

  async run() {
    const {args, flags} = this.parse(Push);

    this.log(this.message.starting);
    this.project = await this.util.getConfig(args.project);
    this.comment = flags.comment;
    this.snippets = this.getSnippets(args.file);

    if (!flags.update) {
      this.displaySnippets();
      this.log(this.message.finished);
      return;
    }

    await this.inferno.init(this.project.username, this.project.password);
    this.snippets.forEach((snippet: any) => {
      this.putSnippets(snippet);
    })

  }

  private getSnippets(filePath: string): Array<Snippet> {
    const snippets: Array<Snippet> = [];
    const files = this.getFiles(filePath);

    files.forEach((file: string) => {
      snippets.push(this.getSnippet(file));
    });

    return snippets;
  }

  private getFiles(filepath: string) {
    const searchpath = this.getGlobPath(filepath);
    const fileSet = new FileSet(searchpath);
    return fileSet.files.filter((file: string) => file.includes('.htm'));
  }

  private getGlobPath(fileName: string): string {
    const fullPath = path.join(this.util.basePath, this.project.name) + '/**/' + fileName;
    // convert windows path delimiter to unix/windows compatible
    return fullPath.replace(/\\/g, "/");
  }

  private displaySnippets() {
    const columns = {
      file: {
        header: 'Local File',
        get: (row: any) => chalk.yellowBright(row.file)
      },
      id: {
        header: 'To Snippet ID',
        get: (row: any) => row.id ? chalk.blue(row.id) : chalk.redBright('not found')
      },
      comment: {
        header: 'Revision Comment',
        get: (row: any) => chalk.reset(row.comment)
      },
      code: {
        header: 'Code Found',
        get: (row: any) => row.code ? chalk.greenBright('TRUE') : chalk.redBright('FALSE')
      }
    };

    const options = {
      sort: 'Local File',
      printLine: this.log
    }

    cli.table(this.snippets, columns, options);
    console.log(chalk.bold('\n use => -u flag') + ' to actually commit files to the server');
  }

  private putSnippets(snippet: any) {
    if (!snippet.code) {
      const warningMessage = chalk.red('Skipping -') +
        chalk.reset(' no code snippet exists or element ') +
        chalk.yellowBright(` <${this.util.wrapperElement}> `) +
        chalk.reset(` does not exist in ${snippet.file}`);
      this.log(chalk.yellowBright('WARNING : '), warningMessage);
      return;
    }

    if (!snippet.id) {
      const warningMessage = chalk.red('Skipping -') +
        chalk.reset(` code snippet id does not exist on element `) +
        chalk.yellowBright(` <${this.util.wrapperElement} id=""> `) +
        chalk.reset(` in ${snippet.file}`);
      this.log(chalk.yellowBright('WARNING : '), warningMessage);
      return;
    }


    const newSnippet = {
      codeSnippetId: snippet.id,
      comments: snippet.comment,
      id: "00000000-0000-0000-0000-000000000000",
      revisionDate: moment().format(),
      snippet: snippet.code
    }

    this.inferno.postSnippet(newSnippet)
      .then((res: any) => {
        const successMessage = chalk.blueBright(`Processed - `) +
          chalk.reset(snippet.file) +
          chalk.blueBright(` | id: ${snippet.id} `) +
          chalk.reset(` | revision id: ${res.id} `);
          this.log(chalk.cyanBright('UPDATED : '), successMessage);
      })
      .catch(error => {
        this.log(chalk.red('ERROR : '), chalk.redBright(` updating ${snippet.file}`));
        this.log(error);
      });


  }

  private getSnippet(file: string): Snippet {
    const contents = fs.readFileSync(file).toString();
    const $ = cheerio.load(contents,  {decodeEntities: false});
    const wrapper = $(this.util.wrapperElement);
    return {
      file: file,
      id: (wrapper && wrapper.attr('id')) ? wrapper.attr('id') : null,
      comment: this.comment + " - " + this.util.username,
      code: wrapper ? wrapper.html() : null
    }
  }

}

