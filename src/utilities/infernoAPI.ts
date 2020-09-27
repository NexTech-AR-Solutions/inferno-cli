import axios from 'axios';
const chalk = require('chalk');

export class InfernoAPI {

  static baseUrl = 'https://ingress.infernocore.jolokia.com/api/';
  accessToken: string | undefined;
  clientId: string | undefined;
  userRoles: Array<string> | undefined;

  constructor() {
  }

  async init(username: string | undefined, password: string | undefined) {
    const endPoint = 'token';
    const url = InfernoAPI.baseUrl + endPoint;
    const response = await axios.post(url, {email: username, password: password,});
    this.accessToken = `Bearer ${response.data.AccessToken}`;
    this.userRoles = response.data.Roles;
    this.clientId = response.data.ClientId;
  }

  public async fetchSnippets() {
    const endPoint = 'Snippets';
    const url = InfernoAPI.baseUrl + endPoint;
    return await axios.get(url, {
      headers: {
        Authorization: this.accessToken
      }
    })
      .then(res => res.data)
      .catch((error) => {
        console.error(chalk.red(`fetchSnippets : ${url}`));
        console.error(chalk.yellow(error));
      });

  }

  public async postSnippet(snippet: any) {
    const endPoint = 'Snippets/AddRevision';
    const url = InfernoAPI.baseUrl + endPoint;
    return await axios.post(url, snippet, {
      headers: {
        Authorization: this.accessToken
      }
    })
      .then(res => res.data)
      .catch((error) => {
        console.error(chalk.red(`postSnippet : ${url}`));
        console.error(chalk.yellow(error));
      });

  }

}
