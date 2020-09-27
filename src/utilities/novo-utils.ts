const notifier = require('node-notifier');
const path = require('path');
const chalk = require('chalk');
const {cosmiconfig} = require('cosmiconfig');

export default class NovoUtils {

  basePath: string | undefined;
  wrapperElement: string | null | undefined;

  public async getConfig(projectName: string) {
    const explorer = cosmiconfig('inferno');
    const cosmic = await explorer.search();

    if (cosmic === null) {
      notifier.notify({
        title: 'CONFIG ERROR',
        message: 'Looks like inferno.config.js config file is missing',
        icon: path.join(__dirname, '../assets/error-icon.png'),
      });
      console.error(chalk.red('ERROR') + ' ' + 'Looks like inferno.config.js is missing');
      return;
    }

    this.basePath = path.parse(cosmic.filepath).dir;
    const conf = this.getProjectConfig(cosmic, projectName);
    this.wrapperElement = conf.wrapperElement;
    return conf;

  }

  private getProjectConfig(cosmic: any, projectName: string) {
    let projects = cosmic.config.projects;
    let project = projects.filter((item: any) => {
      return item.name.toLowerCase() === projectName.toLowerCase()
    });

    if (!project.length) {
      notifier.notify({
        title: 'NO PROJECT',
        message: 'Project ' + projectName + ' does not exist in the config file',
        icon: path.join(__dirname, '../assets/error-icon.png'),
      });
      console.error(chalk.red('ERROR') + ' ' + 'Project ' + projectName + ' does not exist in the config file');
      return {};
    }
    return project[0];
  }
}
