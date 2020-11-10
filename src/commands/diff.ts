import {Command} from '@oclif/command'
import {InfernoAPI} from '../utilities/infernoAPI'
import Messages from '../utilities/messages'
import NovoUtils, {Project} from '../utilities/novo-utils';

const {cli} = require('cli-ux')
const fs = require('fs-extra');
const path = require('path');
const FileSet = require('file-set');
const notifier = require('node-notifier');
const {cosmiconfig} = require('cosmiconfig');
const chalk = require('chalk');
const moment = require('moment');
const cheerio = require('cheerio');


export type LocalSnippet = {
  file: string,
  id: string,
  code: string,
}

export type ServerSnippet = {
  id: string,
  name: string,
  type: string,
  code: string,
}


export default class Diff extends Command {
  static description = 'Compare local code snippets with snippets on the server'
  static examples = [
    '$ inferno dif projectname',
  ]

  static args = [{name: 'project', required: true, description: 'project name to compare snippets from'}];
  util: NovoUtils = new NovoUtils();
  project: Project;

  async run() {

    const {args} = this.parse(Diff);
    const message = new Messages('DIFF');
    this.log(message.starting);
    this.project = await this.util.getConfig(args.project);

    // log into inferno and fetch the snippets
    this.log(chalk.blue('Comparing code snippet differences ') + chalk.yellowBright(this.project.domain));
    const inferno = new InfernoAPI();
    await inferno.init(this.project.username, this.project.password, this.project.domain);
    this.log(chalk.cyan('Authenticated to Inferno: clientId = ' + inferno.clientId));

    const serverSnippets: Array<ServerSnippet> = await this.getServerSnippets(inferno);
    const localSnippets: Array<LocalSnippet> = this.getLocalSnippets('*.*');

    localSnippets.forEach(localSnippet => {
      const serverSnippet = serverSnippets.filter(item => {
        return item.id === localSnippet.id
      })[0];

      if (!serverSnippet) {
        this.log();
        this.log(chalk.red('DOES NOT EXIST ON SERVER') + ' ' + chalk.cyan(localSnippet.file ));
      } else if (localSnippet.id.includes('xxxxxx')) {
        this.log();
        this.log(chalk.bgWhite('NOT CONNECTED') + ' no valid snippet ID exists => ' + chalk.cyan(localSnippet.file ));
      } else if (serverSnippet.code == localSnippet.code) {
        this.log();
        this.log(chalk.bgCyan(' IS SAME ') + ' ' + chalk.yellow(serverSnippet.name) + ' === '+ chalk.cyan(localSnippet.file));
      } else {
        this.log();
        this.log(chalk.bold(chalk.bgRed(' IS DIFF ')) + ' ' +  chalk.yellow(serverSnippet.name) + ' !== '+  chalk.cyan(localSnippet.file));
      }

    });

    this.log();
    this.log('Checked (' + localSnippets.length + ') local snippets and (' + serverSnippets.length + ') Server Snippets');
    this.log();
    this.log(message.finished);
  }


  getLocalSnippets(filePath: string): Array<LocalSnippet> {
    const snippets: Array<LocalSnippet> = [];
    const files = this.getFiles(filePath);

    files.forEach((file: string) => {
      snippets.push(this.getLocalSnippet(file));
    });

    return snippets;
  }

  getFiles(filepath: string): any {
    const searchpath = this.getGlobPath(filepath);
    const fileSet = new FileSet(searchpath);
    return fileSet.files.filter((file: string) => file.includes('.htm'));
  }

  getLocalSnippet(file: string): LocalSnippet {
    const contents = fs.readFileSync(file).toString();
    const $ = cheerio.load(contents, {decodeEntities: false});
    const wrapper = $(this.util.wrapperElement);
    return {
      file: file,
      id: (wrapper && wrapper.attr('id')) ? wrapper.attr('id') : null,
      code: wrapper ? wrapper.html() : null
    }
  }

  getGlobPath(fileName: string): string {
    const fullPath = path.join(this.util.basePath, this.project.name) + '/**/' + fileName;
    // convert windows path delimiter to unix/windows compatible
    return fullPath.replace(/\\/g, "/");
  }

  private async getServerSnippets(inferno: InfernoAPI) {
    const snippets = await inferno.fetchSnippets();
    const total = snippets.length
    const progressBar = cli.progress({
      format: 'FETCHING SERVER CODE SNIPPETS | {bar} | {value}/{total} Files',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    })
    progressBar.start(total, 0)

    const serverSnippets: Array<ServerSnippet> = [];

    let count = 0;
    // this is  a hack to get synchronous calling of data for each code snippet.
    await this.asyncForEach(snippets, async (item: any) => {
      progressBar.update(count++);
      const code: any = await inferno.fetchLatestSnippetCode(item.id);
      if (code) {
        serverSnippets.push({
          id: item.id,
          name: item.name,
          type: item.snippetType,
          code: code.snippet
        });
      }
    });

    // stop the progress bar
    progressBar.update(count++);
    progressBar.stop();
    return serverSnippets;
  }

  // this is  a hack to get synchronous calling of data for each code snippet.
  private async asyncForEach(array: any, callback: any) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

}
