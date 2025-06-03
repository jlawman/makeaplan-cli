import { SessionManager } from '../lib/session-manager.js';
import { AIClient } from '../lib/ai-client.js';
import { selectSession } from '../lib/interactive.js';
import { ui } from '../lib/ui.js';
import { newCommand } from './new.js';

export async function resumeCommand() {
  try {
    const sessionManager = new SessionManager();
    const sessions = await sessionManager.listSessions();

    if (sessions.length === 0) {
      ui.warningMsg('No sessions found. Starting a new session...');
      return newCommand({});
    }

    ui.header('Resume Session');

    const sessionId = await selectSession(sessions);

    if (!sessionId) {
      // User selected "Back"
      return;
    }

    const session = await sessionManager.loadSession(sessionId);

    if (!session) {
      ui.errorMsg('Failed to load session');
      return;
    }

    ui.successMsg(`Resuming session: ${session.idea.substring(0, 50)}...`);

    // Initialize AI client with session's provider
    const aiClient = new AIClient(session.config.provider);
    await aiClient.initialize();

    // Continue workflow from where it left off
    const { runWorkflow } = await import('./new.js');
    await runWorkflow(session, aiClient, sessionManager);
  } catch (error) {
    ui.errorMsg(
      `Failed to resume session: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  }
}
