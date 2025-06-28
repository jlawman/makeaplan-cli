import { config, clearApiKeys } from '../lib/config.js';
import { ui } from '../lib/ui.js';
import inquirer from 'inquirer';
import chalk from 'chalk';

export async function configCommand(action?: string) {
  try {
    if (!action) {
      // Show current configuration
      ui.header('Configuration');

      ui.keyValue('Default Provider', config.get('defaultProvider'));
      ui.keyValue('Sessions Directory', config.get('sessionsDir'));
      ui.keyValue('Output Directory', 'Current working directory');
      ui.keyValue(
        'Anthropic API Key',
        config.get('anthropicApiKey') ? '***' + config.get('anthropicApiKey')!.slice(-4) : 'Not set'
      );
      ui.keyValue(
        'Gemini API Key',
        config.get('geminiApiKey') ? '***' + config.get('geminiApiKey')!.slice(-4) : 'Not set'
      );

      console.log();
      console.log(chalk.gray('Commands:'));
      console.log(chalk.gray('  makeaplan config reset    - Reset all settings'));
      console.log(chalk.gray('  makeaplan config keys     - Manage API keys'));

      return;
    }

    switch (action) {
      case 'reset':
        await resetConfig();
        break;

      case 'keys':
        await manageKeys();
        break;

      default:
        ui.errorMsg(`Unknown config action: ${action}`);
        console.log(chalk.gray('Use: makeaplan config [reset|keys]'));
    }
  } catch (error) {
    ui.errorMsg(`Configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

async function resetConfig() {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Reset all configuration to defaults?',
      default: false,
    },
  ]);

  if (!confirm) {
    ui.infoMsg('Reset cancelled.');
    return;
  }

  config.clear();
  ui.successMsg('Configuration reset to defaults.');
}

async function manageKeys() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'API Key Management:',
      choices: [
        { name: 'Clear all API keys', value: 'clear' },
        { name: 'Update Anthropic API key', value: 'anthropic' },
        { name: 'Update Gemini API key', value: 'gemini' },
        { name: '← Back', value: 'back' },
      ],
    },
  ]);

  switch (action) {
    case 'clear':
      clearApiKeys();
      break;

    case 'anthropic':
    case 'gemini':
      await updateApiKey(action);
      break;

    case 'back':
      return;
  }
}

async function updateApiKey(provider: 'anthropic' | 'gemini') {
  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: `Enter new ${provider} API key:`,
      validate: (input) => input.length > 0 || 'API key is required',
    },
  ]);

  if (provider === 'anthropic') {
    config.set('anthropicApiKey', apiKey);
  } else {
    config.set('geminiApiKey', apiKey);
  }

  ui.successMsg(`${provider} API key updated.`);
}
