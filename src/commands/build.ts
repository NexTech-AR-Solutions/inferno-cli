import {Command} from '@oclif/command'
import Messages from '../utilities/messages'
import NovoUtils, {Project} from '../utilities/novo-utils';
import {LocalSnippet} from './diff';
import cli from 'cli-ux'
const FileSet = require('file-set');
const fs = require('fs-extra');
const path = require('path');
const {cosmiconfig} = require('cosmiconfig');
const chalk = require('chalk');
const cheerio = require('cheerio');

export default class Build extends Command {
  static description = 'Build inferno Project index page and index JSON data file';
  static examples = [
    '$ inferno build projectname',
  ]

  static args = [{name: 'project', required: true, description: 'project name to pull from'}];

  util: NovoUtils = new NovoUtils();
  project: Project;
  async run() {

    const {args} = this.parse(Build);
    const message = new Messages('BUILD');
    this.log(message.starting);
    this.project = await this.util.getConfig(args.project);

    this.createMenuJs();

    this.log(message.finished);
  }

  private createMenuJs() {
    const snippets = this.getLocalSnippets('*.*');
    const target = path.join(this.util.basePath, this.project.name, '/menu.js');
    fs.outputFile(target, 'window.localTemplateMenuItems = ' + JSON.stringify(snippets));
  }

  getLocalSnippets(filePath: string): Array<LocalSnippet> {
    const snippets: Array<LocalSnippet> = [];
    const files = this.getFiles(filePath);
    const total = files.length;
    const progressBar = cli.progress({
      format: 'PROCESSING LOCAL FILES | {bar} | {value}/{total} Files',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    })
    progressBar.start(total, 0)

    let count = 0;
    files.forEach((file: string) => {
      progressBar.update(count++);
      const  snippet = this.getLocalSnippet(file);
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
      .replace(/(?: |\b)(\w)/g, function(key) { return key.toUpperCase()});
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



}
