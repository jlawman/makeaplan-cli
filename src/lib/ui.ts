import chalk from 'chalk';
import { SessionStep } from '../types/index.js';

export const ui = {
  // Brand colors
  primary: chalk.hex('#6366F1'), // Indigo
  secondary: chalk.hex('#8B5CF6'), // Purple
  success: chalk.hex('#10B981'), // Emerald
  warning: chalk.hex('#F59E0B'), // Amber
  error: chalk.hex('#EF4444'), // Red
  info: chalk.hex('#3B82F6'), // Blue

  // Styled components
  logo: () => {
    console.log();
    console.log(chalk.bold(ui.gradient('╔══════════════════════════════════════╗')));
    console.log(chalk.bold(ui.gradient('║          MakeAPlan CLI               ║')));
    console.log(chalk.bold(ui.gradient('║   AI-Powered Product Specification   ║')));
    console.log(chalk.bold(ui.gradient('╚══════════════════════════════════════╝')));
    console.log();
  },

  gradient: (text: string) => {
    // Create a gradient effect from indigo to purple
    const chars = text.split('');
    const gradientSteps = ['#6366F1', '#6D5FF0', '#7758EF', '#8251EE', '#8B4BED', '#8B5CF6'];

    return chars
      .map((char, i) => {
        const colorIndex = Math.floor((i / chars.length) * gradientSteps.length);
        return chalk.hex(gradientSteps[colorIndex])(char);
      })
      .join('');
  },

  header: (text: string) => {
    console.log();
    console.log(ui.primary('━'.repeat(50)));
    console.log(ui.primary.bold(`  ${text}`));
    console.log(ui.primary('━'.repeat(50)));
    console.log();
  },

  subheader: (text: string) => {
    console.log();
    console.log(ui.secondary.bold(`▸ ${text}`));
    console.log();
  },

  step: (step: SessionStep) => {
    const steps = [
      { step: SessionStep.INITIAL_IDEA, label: 'Initial Idea', icon: '💡' },
      { step: SessionStep.QUESTIONS_ROUND_1, label: 'Discovery Round 1', icon: '🔍' },
      { step: SessionStep.QUESTIONS_ROUND_2, label: 'Discovery Round 2', icon: '🎯' },
      { step: SessionStep.QUESTIONS_ROUND_3, label: 'Technical Round', icon: '⚙️' },
      { step: SessionStep.FINAL_WRITEUP, label: 'Specification', icon: '📄' },
      { step: SessionStep.GENERATE_FILE_STRUCTURE, label: 'File Structure', icon: '📁' },
      { step: SessionStep.CONVERT_TO_JSON, label: 'Export', icon: '✅' },
    ];

    console.log();
    console.log(ui.info('Progress:'));

    steps.forEach((s) => {
      const isActive = s.step === step;
      const isPast =
        Object.values(SessionStep).indexOf(s.step) < Object.values(SessionStep).indexOf(step);

      let line = '  ';

      if (isActive) {
        line += ui.primary.bold(`${s.icon} ${s.label}`);
      } else if (isPast) {
        line += ui.success(`✓ ${s.label}`);
      } else {
        line += chalk.gray(`○ ${s.label}`);
      }

      console.log(line);
    });
    console.log();
  },

  divider: () => {
    console.log(chalk.gray('─'.repeat(50)));
  },

  successMsg: (message: string) => {
    console.log(ui.success(`✓ ${message}`));
  },

  errorMsg: (message: string) => {
    console.log(ui.error(`✗ ${message}`));
  },

  warningMsg: (message: string) => {
    console.log(ui.warning(`⚠ ${message}`));
  },

  infoMsg: (message: string) => {
    console.log(ui.info(`ℹ ${message}`));
  },

  box: (content: string[], title?: string) => {
    const maxLength = Math.max(...content.map((line) => line.length), title?.length || 0);
    const width = maxLength + 4;

    console.log();
    console.log(chalk.gray('┌' + '─'.repeat(width) + '┐'));

    if (title) {
      const padding = Math.floor((width - title.length) / 2);
      console.log(
        chalk.gray('│ ') +
          ' '.repeat(padding - 1) +
          ui.primary.bold(title) +
          ' '.repeat(width - padding - title.length - 1) +
          chalk.gray(' │')
      );
      console.log(chalk.gray('├' + '─'.repeat(width) + '┤'));
    }

    content.forEach((line) => {
      const paddedLine = line + ' '.repeat(width - line.length - 2);
      console.log(chalk.gray('│ ') + paddedLine + chalk.gray(' │'));
    });

    console.log(chalk.gray('└' + '─'.repeat(width) + '┘'));
    console.log();
  },

  list: (items: string[], ordered: boolean = false) => {
    items.forEach((item, index) => {
      const prefix = ordered ? `${index + 1}.` : '•';
      console.log(`  ${ui.secondary(prefix)} ${item}`);
    });
  },

  keyValue: (key: string, value: string) => {
    console.log(`  ${chalk.gray(key)}: ${ui.primary(value)}`);
  },

  welcome: () => {
    ui.logo();
    console.log(chalk.gray('Transform your ideas into actionable technical specifications.'));
    console.log(chalk.gray('Using AI to guide you through a structured discovery process.'));
    console.log();
  },

  goodbye: () => {
    console.log();
    console.log(ui.gradient('Thanks for using MakeAPlan! 🚀'));
    console.log();
  },
};
