import { SessionManager } from '../lib/session-manager.js';
import { Exporter } from '../lib/exporter.js';
import { selectExportFormat } from '../lib/interactive.js';
import { ui } from '../lib/ui.js';

export async function exportCommand(sessionId: string, options: { format?: string }) {
  try {
    const sessionManager = new SessionManager();

    // If no session ID provided, show list to select
    if (!sessionId) {
      const sessions = await sessionManager.listSessions();

      if (sessions.length === 0) {
        ui.warningMsg('No sessions found.');
        return;
      }

      const { selectSession } = await import('../lib/interactive.js');
      const selectedId = await selectSession(sessions);

      if (!selectedId) {
        return;
      }

      sessionId = selectedId;
    }

    // Load session
    const session = await sessionManager.loadSession(sessionId);

    if (!session) {
      ui.errorMsg(`Session not found: ${sessionId}`);
      return;
    }

    ui.header('Export Session');
    ui.keyValue('Session ID', session.id);
    ui.keyValue('Idea', session.idea.substring(0, 50) + '...');
    ui.keyValue('Created', session.createdAt.toLocaleDateString());
    console.log();

    // Determine format
    let format: 'markdown' | 'json' | 'both';

    if (options.format) {
      if (!['markdown', 'json', 'both'].includes(options.format)) {
        ui.errorMsg('Invalid format. Use: markdown, json, or both');
        return;
      }
      format = options.format as 'markdown' | 'json' | 'both';
    } else {
      format = await selectExportFormat();
    }

    // Export
    const exporter = new Exporter();
    const exportedFiles = await exporter.exportSession(session, format);

    ui.box(['Export complete!', '', ...exportedFiles.map((file) => `📄 ${file}`)], 'Success');
  } catch (error) {
    ui.errorMsg(
      `Failed to export session: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  }
}
