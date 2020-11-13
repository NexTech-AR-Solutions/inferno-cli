import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import {InfernoAPI} from '../utilities/infernoAPI'
import Messages from '../utilities/messages'
import NovoUtils, {Project} from '../utilities/novo-utils';
import {asyncForEach, LocalSnippet} from '../utilities/common';

const fs = require('fs-extra');
const FileSet = require('file-set');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment');
const cheerio = require('cheerio');

export default class Pull extends Command {
  static description = 'Pull code snippets to Inferno AR Instance associated with your login'
  static examples = [
    '$ inferno pull projectname',
  ]

  static args = [
    {name: 'project', required: true, description: 'project name to pull from'},
    {
      name: 'filter',
      required: true,
      description: 'case insensitive search filter for pulling snippets, use "*" to pull all, use "abcd*" to starts with, "abcd" for exact match'
    }
  ];
  static flags = {
    // can pass either --create or -c
    create: flags.boolean({
      char: 'c',
      description: 'create local template files from code snippets that exist on the server. Files will be placed in sub directories based on snippet type. local files WILL BE OVERWRITTEN if they already exist'
    }),
  }
  util: NovoUtils = new NovoUtils();
  project: Project;

  async run() {

    const {args, flags} = this.parse(Pull);
    const message = new Messages('PULL');
    this.log(message.starting);

    this.project = await this.util.getConfig(args.project);

    // log into inferno and fetch the snippets
    this.log(chalk.blue('Starting to Pull Snippets for ') + chalk.yellowBright(this.project.domain));
    const inferno = new InfernoAPI();
    await inferno.init(this.project.username, this.project.password, this.project.domain);
    this.log(chalk.cyan('Authenticated to Inferno: clientId = ' + inferno.clientId));
    let snippets = await inferno.fetchSnippets();

    snippets = snippets.filter((item: any) => {
      let filter = args.filter.trim().toLowerCase();

      if (filter === '*') {
        // return all
        return true;
      }

      if (filter.endsWith('*')) {
        // return items who start with the filter value
        filter = filter.replace('*', '');
        return item.name.toLowerCase().startsWith(filter);
      }

      // return items that match exactly with the filter value
      return item.name.toLowerCase() === filter;

    });

    cli.action.stop();

    if (flags.create) {
      await this.createLocalFiles(inferno, snippets);
      this.log('');
      this.createMenuJs();
    } else {
      // output the results to the console
      this.displaySnippets(snippets);
    }

    this.log(message.finished);
  }

  getLocalSnippets(filePath: string): Array<LocalSnippet> {
    const snippets: Array<LocalSnippet> = [];
    const files = this.getFiles(filePath);
    const total = files.length;
    const progressBar = cli.progress({
      format: 'BUILDING menus.js from local files | {bar} | {value}/{total} Files',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    })
    progressBar.start(total, 0)

    let count = 0;
    files.forEach((file: string) => {
      progressBar.update(count++);
      const snippet = this.getLocalSnippet(file);
      if (snippet.snippetID) {
        snippets.push(snippet);
      }
    });

    progressBar.update(count++);
    progressBar.stop();
    return snippets;
  }

  getLocalSnippet(file: string): any {
    const contents = fs.readFileSync(file).toString();
    const $ = cheerio.load(contents, {decodeEntities: false});
    const wrapper = $(this.util.wrapperElement);
    let projectPath = path.join(this.util.basePath, this.project.name) + '/';
    projectPath = projectPath.replace(/\\/g, '/');
    return {
      file: file.replace(projectPath, ""),
      snippetID: (wrapper && wrapper.attr('id')) ? wrapper.attr('id') : null,
      name: this.getFileName(file)
    }
  }

  getFileName(filePath: string) {
    return filePath
      .replace(/^.*[\\\/]/, '')
      .replace('.html', '')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/(?: |\b)(\w)/g, function (key) {
        return key.toUpperCase()
      });
  }

  getFiles(filepath: string): any {
    const searchpath = this.getGlobPath(filepath);
    const fileSet = new FileSet(searchpath);
    return fileSet.files.filter((file: string) => file.includes('.htm'));
  }

  getGlobPath(fileName: string): string {
    const fullPath = path.join(this.util.basePath, this.project.name) + '/**/' + fileName;
    // convert windows path delimiter to unix/windows compatible
    return fullPath.replace(/\\/g, "/");
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

  private async createLocalFiles(inferno: InfernoAPI, snippets: any) {
    await asyncForEach(snippets, async (snippet: any) => {
      let template = '';
      const type = snippet.snippetType.toLowerCase()
      if (type.includes('login')) {
        template = path.join(__dirname, '../assets/login.html');
      } else if (type.includes('regi')) {
        template = path.join(__dirname, '../assets/registration.html');
      } else if (type.includes('player')) {
        template = path.join(__dirname, '../assets/player.html');
      } else {
        template = path.join(__dirname, '../assets/category.html');
      }

      const fileName = snippet.name
        .replace(/[^\w]/g, '-')
        .replace(/---/g, "-")
        .replace(/--/g, "-")
        .toLowerCase()

      const templateTargetPath = path.join(this.util.basePath, this.project.name, snippet.snippetType.toLowerCase() + '/' + fileName + '.html');

      await inferno.fetchLatestSnippetCode(snippet).then(item => {
        if (!item || !item.snippet) return;

        const contents = fs.readFileSync(template).toString();
        const $ = cheerio.load(contents, {decodeEntities: false});
        const wrapper = $(this.util.wrapperElement);

        // set attribute on this element to setup auto login for API use in the template
        $('#novoProject').attr('name', this.project.name);

        wrapper.attr('id', snippet.id);
        wrapper.html(item.snippet);
        const newFile = $('html').html();
        fs.outputFile(templateTargetPath, newFile);
        this.log(chalk.green('Created '), chalk.blue(templateTargetPath));
      }).catch((err: any) => {
        this.log(chalk.redBright('ERROR - unable to create file for '), templateTargetPath);
        this.log(err);
      });

    });
  }

  private createMenuJs() {
    const snippets = this.getLocalSnippets('*.*');
    const target = path.join(this.util.basePath, this.project.name, '/menu.js');
    fs.outputFile(target, 'window.localTemplateMenuItems = ' + JSON.stringify(snippets));
  }


}
