
export type LocalSnippet = {
  id: string,
  file: string,
  code: string,
}

export type InfernoSnippet = {
  id: string,
  file: string,
  type?: string,
  comment?: string,
  code: string,
}

// this is  a hack to get synchronous calling of data for each code snippet.
 export async function asyncForEach(array: any, callback: any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
