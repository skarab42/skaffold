export interface Options {
  packageName: string | undefined;
}

export function skaffold(options: Options): void {
  console.log(options);
}
