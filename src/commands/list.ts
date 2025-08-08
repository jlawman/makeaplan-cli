import { SessionManager } from '../lib/session-manager.js';
import { ui } from '../lib/ui.js';
import { SessionStep } from '../types/index.js';
import chalk from 'chalk';

export async function listCommand() {
  try {
    const sessionManager = new SessionManager();
    const sessions = await sessionManager.listSessions();

    ui.header('Your Sessions');

    if (sessions.length === 0) {
      ui.infoMsg('No sessions found. Start a new session with: makeaplan new');
      return;
    }

    const sessionList = sessions.map((session) => {
      const stepLabel = getStepLabel(session.step);
      const stepColor = getStepColor(session.step);

      return [
        chalk.gray(session.id),
        session.idea,
        stepColor(stepLabel),
        chalk.gray(formatDate(session.updatedAt)),
      ];
    });

    // Create table
    console.log();
    console.log(
      chalk.gray(
        '  ID        Idea                                      Status              Updated'
      )
    );
    console.log(
      chalk.gray(
        '  ────────  ────────────────────────────────────────  ──────────────────  ─────────'
      )
    );

    sessionList.forEach((row) => {
      console.log(`  ${row[0]}  ${padEnd(row[1], 40)}  ${padEnd(row[2], 18)}  ${row[3]}`);
    });

    console.log();
    ui.infoMsg(`Total sessions: ${sessions.length}`);
    console.log();
    console.log(chalk.gray('Resume a session with: makeaplan resume'));
    console.log(chalk.gray('Export a session with: makeaplan export <session-id>'));
  } catch (error) {
    ui.errorMsg(
      `Failed to list sessions: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  }
}

function getStepLabel(step: SessionStep): string {
  const labels = {
    [SessionStep.INITIAL_IDEA]: 'Initial',
    [SessionStep.QUESTIONS_ROUND_1]: 'Questions 1/3',
    [SessionStep.QUESTIONS_ROUND_2]: 'Questions 2/3',
    [SessionStep.QUESTIONS_ROUND_3]: 'Questions 3/3',
    [SessionStep.FINAL_WRITEUP]: 'Writeup',
    [SessionStep.GENERATE_FILE_STRUCTURE]: 'File Structure',
    [SessionStep.CONVERT_TO_JSON]: 'Complete',
  };

  return labels[step] || 'Unknown';
}

function getStepColor(step: SessionStep) {
  switch (step) {
    case SessionStep.INITIAL_IDEA:
      return chalk.yellow;
    case SessionStep.QUESTIONS_ROUND_1:
    case SessionStep.QUESTIONS_ROUND_2:
    case SessionStep.QUESTIONS_ROUND_3:
      return chalk.blue;
    case SessionStep.FINAL_WRITEUP:
    case SessionStep.GENERATE_FILE_STRUCTURE:
      return chalk.cyan;
    case SessionStep.CONVERT_TO_JSON:
      return chalk.green;
    default:
      return chalk.gray;
  }
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  } else if (days === 1) {
    return 'yesterday';
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function padEnd(str: string, length: number): string {
  if (str.length > length) {
    return str.substring(0, length - 3) + '...';
  }
  return str + ' '.repeat(length - str.length);
}
