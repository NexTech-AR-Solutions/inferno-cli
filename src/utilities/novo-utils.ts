const notifier = require('node-notifier');
const path = require('path');
const chalk = require('chalk');
const {cosmiconfig} = require('cosmiconfig');

export type Project = {
  name: string,
  username: string,
  password: string,
  wrapperElement?: string
}

export default class NovoUtils {

  basePath: string = './';
  wrapperElement: string | null | undefined;
  username: string | null | undefined;

  public async getConfig(name: string) : Promise<Project> {
    const explorer = cosmiconfig('inferno');
    const cosmic = await explorer.search();

    if (cosmic === null) {
      console.error(chalk.red('ERROR getConfig()') + ' Looks like inferno.config.js is missing');
      throw Error;
    }

    this.basePath = path.parse(cosmic.filepath).dir;
    const conf: Project = this.getProjectConfig(cosmic, name);
    this.wrapperElement = conf.wrapperElement ?? 'inferno-snippet-content';
    this.username = conf.username;
    return conf;

  }

  private getProjectConfig(cosmic: any, name: string) : Project {
    let projects = cosmic.config.projects;
    let project: [Project] = projects.filter((item: any) => {
      return item.name.toLowerCase() === name.toLowerCase()
    });

    if (!project.length) {
      console.error(chalk.red('ERROR') + ' ' + 'Project ' + name + ' does not exist in the config file');
      throw Error;
    }
    return project[0];
  }
}

