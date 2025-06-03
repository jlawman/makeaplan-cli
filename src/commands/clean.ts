import { SessionManager } from '../lib/session-manager.js';
import { ui } from '../lib/ui.js';
import inquirer from 'inquirer';

export async function cleanCommand(options: { days?: string; force?: boolean }) {
  try {
    const sessionManager = new SessionManager();
    const daysToKeep = options.days ? parseInt(options.days) : 30;

    if (isNaN(daysToKeep) || daysToKeep < 0) {
      ui.errorMsg('Invalid days value. Must be a positive number.');
      return;
    }

    ui.header('Clean Old Sessions');

    // Show what will be cleaned
    const sessions = await sessionManager.listSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const sessionsToDelete = sessions.filter((session) => session.updatedAt < cutoffDate);

    if (sessionsToDelete.length === 0) {
      ui.infoMsg(`No sessions older than ${daysToKeep} days found.`);
      return;
    }

    console.log();
    ui.warningMsg(`Found ${sessionsToDelete.length} sessions older than ${daysToKeep} days:`);
    console.log();

    sessionsToDelete.forEach((session) => {
      console.log(`  • ${session.idea} (${formatAge(session.updatedAt)})`);
    });

    console.log();

    // Confirm deletion
    let confirm = options.force;

    if (!confirm) {
      const { shouldDelete } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldDelete',
          message: `Delete ${sessionsToDelete.length} old sessions?`,
          default: false,
        },
      ]);
      confirm = shouldDelete;
    }

    if (!confirm) {
      ui.infoMsg('Cleanup cancelled.');
      return;
    }

    // Delete sessions
    const deletedCount = await sessionManager.cleanOldSessions(daysToKeep);

    ui.successMsg(`Deleted ${deletedCount} old sessions.`);
  } catch (error) {
    ui.errorMsg(
      `Failed to clean sessions: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  }
}

function formatAge(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'today';
  } else if (days === 1) {
    return 'yesterday';
  } else {
    return `${days} days ago`;
  }
}
