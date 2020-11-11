import {Command, flags} from '@oclif/command'
import NovoUtils from '../utilities/novo-utils';

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

export default class Generate extends Command {
  static description = 'Creates a new project directory if it does not exists and creates a new Code Snippet Template HTML file in the project directory';

  static flags = {
    help: flags.help({char: 'h'}),
    project: flags.string({char: 'p', description: 'directory for project. Will be created if it does not already exist. The project name needs to exist in inferno.config.js file'}),
    file: flags.string({char: 'f', description: 'file name to create. Will be created under project folder'}),
    test: flags.boolean({char: 't', default: false, description: 'set to test'}),
  }
  static args = [{name: 'project'}, {name: 'file'}];
  util: NovoUtils = new NovoUtils();
  name: string;
  file: string;

  async run() {
    const {args, flags} = this.parse(Generate)

    this.name = flags.project ?? args.project;
    this.file = flags.file ?? args.file;

    if (!this.file.includes('.html')) {
      this.file += '.html';
    }

    const project = await this.util.getConfig(this.name);
    const templateTargetPath = path.join(this.util.basePath, project.name, this.file);
    const cssTargetPath = path.join(this.util.basePath, project.name, 'inferno-client.css');
    const jsonTargetPath = path.join(this.util.basePath, project.name, 'liquid.json');

    if (flags.test) {
      this.log(chalk.yellow('\ngenerating new Inferno AR Code Snippet template file '), chalk.blue(templateTargetPath));
      if (fs.existsSync(templateTargetPath)) {
        this.log(chalk.magentaBright('WARNING'), chalk.yellow('file would not be generated, it already exists'));
      }
      this.log('\n ');
      return;
    }

    const templatePath = path.join(__dirname, '../assets/category.html');
    const css = path.join(__dirname, '../assets/inferno-client.css');
    const json = path.join(__dirname, '../assets/liquid.json');

    fs.copy(templatePath, templateTargetPath, {overwrite: false, errorOnExist: true})
      .then(() => {
        this.log(chalk.greenBright(`\nFile ${templateTargetPath} Generated`));
        this.log('\n ');
      })
      .catch((err: any) => {
        this.log(chalk.red('\n', err));
        this.log('\n ');
      })

    fs.copy(css, cssTargetPath, {overwrite: false, errorOnExist: true})
      .then(() => {
        this.log(chalk.greenBright(`\nFile ${cssTargetPath} Generated`));
      })
      .catch((err: any) => {
        // do nothing
      })

    fs.copy(json, jsonTargetPath, {overwrite: false, errorOnExist: true})
      .then(() => {
        this.log(chalk.greenBright(`\nFile ${jsonTargetPath} Generated`));
      })
      .catch((err: any) => {
        // do nothing
      })


  }

}
