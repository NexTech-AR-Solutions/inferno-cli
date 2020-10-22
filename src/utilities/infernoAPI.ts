import axios from 'axios';

const chalk = require('chalk');

export class InfernoAPI {

  static baseUrl = 'https://ingress.infernocore.jolokia.com/api/';
  accessToken: string | undefined;
  clientId: string | undefined;
  userRoles: Array<string> | undefined;
  domain: string | undefined;

  constructor() {
  }

  async init(username: string | undefined, password: string | undefined, domain: string | undefined) {
    this.domain = domain;
    const endPoint = 'token';
    const url = InfernoAPI.baseUrl + endPoint;
    const response: any = await axios.post(url, {
        email: username,
        password: password,
      },
      {
        headers: {
          'X-InfernoCore-Domain': this.domain
        }
      }
    ).then(resp => resp)
      .catch(err => {
        console.log('Error Authenticating', err);
      });
    this.accessToken = `Bearer ${response.data.AccessToken}`;
    this.userRoles = response.data.Roles;
    this.clientId = response.data.ClientId;
  }

  public async fetchSnippets() {
    const endPoint = 'Snippets';
    const url = InfernoAPI.baseUrl + endPoint;
    return await axios.get(url, {
      headers: {
        Authorization: this.accessToken,
        'X-InfernoCore-Domain': this.domain
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
        Authorization: this.accessToken,
        'X-InfernoCore-Domain': this.domain
      }
    })
      .then(res => res.data)
      .catch((error) => {
        console.error(chalk.red(`postSnippet : ${url}`));
        console.error(chalk.yellow(error));
      });

  }

}
