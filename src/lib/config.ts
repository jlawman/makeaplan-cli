import Conf from 'conf';
import { Config } from '../types/index.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { homedir } from 'os';
import { join } from 'path';

const defaultConfig: Config = {
  defaultProvider: 'anthropic',
  sessionsDir: join(homedir(), '.makeaplan', 'sessions'),
};

export const config = new Conf<Config>({
  projectName: 'makeaplan',
  defaults: defaultConfig,
});

export async function getApiKey(provider: 'anthropic' | 'gemini'): Promise<string> {
  // Check environment variables first
  const envKey =
    provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.GEMINI_API_KEY;

  if (envKey) {
    return envKey;
  }

  // Check stored config
  const storedKey =
    provider === 'anthropic' ? config.get('anthropicApiKey') : config.get('geminiApiKey');

  if (storedKey) {
    return storedKey;
  }

  // Ask user for API key
  console.log(
    chalk.yellow(`\n${provider.charAt(0).toUpperCase() + provider.slice(1)} API key not found.`)
  );
  console.log(chalk.gray(`You can set it as an environment variable or enter it now.`));
  console.log(
    chalk.gray(
      `Environment variable: ${provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'GEMINI_API_KEY'}\n`
    )
  );

  const { apiKey, saveKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: `Enter your ${provider} API key:`,
      validate: (input) => input.length > 0 || 'API key is required',
    },
    {
      type: 'confirm',
      name: 'saveKey',
      message: 'Save this API key for future use?',
      default: true,
    },
  ]);

  if (saveKey) {
    if (provider === 'anthropic') {
      config.set('anthropicApiKey', apiKey);
    } else {
      config.set('geminiApiKey', apiKey);
    }
    console.log(chalk.green('✓ API key saved'));
  }

  return apiKey;
}

export function clearApiKeys(): void {
  config.delete('anthropicApiKey');
  config.delete('geminiApiKey');
  console.log(chalk.green('✓ API keys cleared'));
}
