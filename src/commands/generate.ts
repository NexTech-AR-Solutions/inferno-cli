import {Command, flags} from '@oclif/command'
import NovoUtils from '../utilities/novo-utils';

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

export default class Generate extends Command {
  static description = 'Creates a new project directory if it does not exists and creates a new Code Snippet Template HTML file in the project directory';

  static flags = {
    help: flags.help({char: 'h'}),
    project: flags.string({char: 'p', description: 'project to create file in'}),
    file: flags.string({char: 'f', description: 'file name to create in the project folder'}),
    test: flags.boolean({char: 't', default: false, description: 'set to test'}),
  }
  static args = [{name: 'project'}, {name: 'file'}, {name: 'test', default: false}];
  util: NovoUtils = new NovoUtils();

  async run() {
    const {args, flags} = this.parse(Generate)

    const projectName = flags.project ?? args.project;
    let filename = flags.file ?? args.file;

    if (!filename.includes('.html')) {
      filename += '.html';
    }

    const project = await this.util.getConfig(projectName);
    const templateTargetPath = path.join(this.util.basePath, projectName, filename);
    const cssTargetPath = path.join(this.util.basePath, projectName, 'inferno-client.css');

    if (flags.test || args.test) {
      this.log(chalk.yellow('\ngenerating new Inferno AR Code Snippet template file '), chalk.blue(templateTargetPath));
      if (fs.existsSync(templateTargetPath)) {
        this.log(chalk.magentaBright('WARNING'), chalk.yellow('file would not be generated, it already exists'));
      }
      this.log('\n');
      return;
    }

    const templatePath = path.join(__dirname, '../assets/template.html');
    const css = path.join(__dirname, '../assets/inferno-client.css');

    try {
      this.log('copying from ' + templatePath, ' to ' + templateTargetPath);

      fs.copySync(templatePath, templateTargetPath, {
        overwrite: false,
        errorOnExist: true,
      });
      this.log('copying from ' + css, ' to ' + cssTargetPath);
      fs.copySync(css, cssTargetPath, {
        overwrite: false,
        errorOnExist: false,
      });
      this.log(chalk.yellowBright('\nGENERATED '), chalk.magentaBright(templateTargetPath));
    } catch (e) {
      this.log(chalk.red('\n', e));
    }

    this.log('\n');

  }

}
