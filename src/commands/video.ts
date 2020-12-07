import {Command} from '@oclif/command'
import cli from 'cli-ux'
import {InfernoAPI} from '../utilities/infernoAPI'
import Messages from '../utilities/messages'
import NovoUtils, {Project} from '../utilities/novo-utils';

const fs = require('fs-extra');
const FileSet = require('file-set');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment');
const cheerio = require('cheerio');

export default class Pull extends Command {
  static description = 'list video event details from Inferno AR Instance associated with your login'
  static examples = [
    '$ inferno video projectname',
  ]

  static args = [
    {name: 'project', required: true, description: 'project name to pull from'},
  ];
  util: NovoUtils = new NovoUtils();
  project: Project;

  async run() {

    const {args} = this.parse(Pull);
    const message = new Messages('VIDEO');
    this.log(message.starting);

    this.project = await this.util.getConfig(args.project);

    // log into inferno and fetch the snippets
    const inferno = new InfernoAPI();
    await inferno.init(this.project.username, this.project.password, this.project.domain);
    this.log(chalk.cyan('Authenticated to Inferno: clientId = ' + inferno.clientId));
    const videos = await inferno.fetchVideos();
    this.displayVideos(videos);
    this.log(message.finished);
  }


  private displayVideos(videos: any) {
    this.log('\n\n');
    const columns = {
      name: {
        header: 'Video Event',
        get: (row: any) => chalk.yellow(row.name)
      },
      id: {
        header: 'ID',
        get: (row: any) => chalk.blue(row.id)
      },
      categories: {
        header: 'Category(s)',
        get: (row: any) => row.categories && row.categories.length ? this.categoriesList(row.categories) : chalk.reset('    ' + 0)
      },
      hasVideo: {
        header: ' Has Video',
        get: (row: any) => chalk.reset(!!(row.video && row.video.id))
      },
    };

    const options = {
      printLine: this.log,
      sort: 'Video Event'
    }

    cli.table(videos, columns, options)
  }

  private categoriesList(categories: any) {
    return Array.prototype.map.call(categories, category => category.name).toString();
  }

}
