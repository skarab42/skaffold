/* eslint-disable no-console */
import chalk from 'chalk';

export const infoLabel = chalk.bold.hex('#111').bgBlueBright(' INFO ');
export const warningLabel = chalk.bold.hex('#111').bgYellow(' WARNING ');
export const errorLabel = chalk.bold.hex('#111').bgRed(' ERROR ');

export type PrintOptions = {
  colors: boolean;
  newLine: boolean;
};

export function printNewLine(): void {
  console.log();
}

export function printInfo(message: string, colors = true, newLine = true): void {
  console.log(colors ? infoLabel : 'INFO:', message);
  newLine && printNewLine();
}

export function printWarning(message: string, colors = true, newLine = true): void {
  console.log(colors ? warningLabel : 'WARNING:', message);
  newLine && printNewLine();
}

export function printError(message: string, colors = true, newLine = true): void {
  console.error(colors ? errorLabel : 'ERROR:', colors ? chalk.red(message) : message);
  newLine && printNewLine();
  process.exitCode = 1;
}

export function printErrorHint(command = '', colors = true, newLine = true): void {
  command = ['skaffold', command, '--help'].join(' ');
  console.error(`For help, run ${colors ? chalk.gray(command) : command}.`);
  newLine && printNewLine();
}

export type Printer = {
  info(message: string, newLine?: boolean): void;
  warning(message: string, newLine?: boolean): void;
  error(message: string, newLine?: boolean): void;
  errorHint(command: string, newLine?: boolean): void;
};

export function printer(colors = true): Printer {
  return {
    info: (message, newLine) => printInfo(message, colors, newLine),
    warning: (message, newLine) => printWarning(message, colors, newLine),
    error: (message, newLine) => printError(message, colors, newLine),
    errorHint: (command, newLine) => printErrorHint(command, colors, newLine),
  };
}
