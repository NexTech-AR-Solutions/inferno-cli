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

export default class Build extends Command {
  static description = 'Build inferno Project index page and index JSON data file';
  static examples = [
    '$ inferno build projectname',
  ]

  static args = [{name: 'project', required: true, description: 'project name to pull from'}];

  util: NovoUtils = new NovoUtils();

  async run() {

    const {args} = this.parse(Build);
    const message = new Messages('BUILD');
    this.log(message.starting);

    const project = await this.util.getConfig(args.project);

    this.createMenuJs();

    this.log(message.finished);
  }

  private createMenuJs() {
    this.log('creating data file');
  }


}
