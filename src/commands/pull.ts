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

  async run() {

    const {args, flags} = this.parse(Pull);
    const message = new Messages('PULL');
    this.log(message.starting);

    const project = await this.util.getConfig(args.project);

    // log into inferno and fetch the snippets
    this.log(chalk.blue('Starting to Pull Snippets for ') + chalk.yellowBright(project.domain));
    const inferno = new InfernoAPI();
    await inferno.init(project.username, project.password, project.domain);
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
      let template = '';
      if (snippet.snippetType.toLowerCase().includes('categor')) {
        template = path.join(__dirname, '../assets/category.html');
      } else if (snippet.snippetType.toLowerCase().includes('login')) {
        template = path.join(__dirname, '../assets/login.html');
      } else if (snippet.snippetType.toLowerCase().includes('regi')) {
        template = path.join(__dirname, '../assets/registration.html');
      } else if (snippet.snippetType.toLowerCase().includes('player')) {
        template = path.join(__dirname, '../assets/player.html');
      }

      const fileName = snippet.name
        .replace(/[^\w]/g, '-')
        .replace(/---/g, "-")
        .replace(/--/g, "-")
        .toLowerCase()

      const templateTargetPath = path.join(this.util.basePath, project.name, snippet.snippetType.toLowerCase() + '/' + fileName + '.html');

      inferno.fetchLatestSnippetCode(snippet.id, snippet.name).then(item => {
        if (!item || !item.snippet) return;

        const contents = fs.readFileSync(template).toString();
        const $ = cheerio.load(contents, {decodeEntities: false});
        const wrapper = $(this.util.wrapperElement);

        // set attribute on this element to setup auto login for API use in the template
        $('#novoProject').attr('name', project.name);

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

    });
  }


}
