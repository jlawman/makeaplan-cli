import { Session, SessionConfig, SessionStep } from '../types/index.js';
import { config } from './config.js';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

export class SessionManager {
  private sessionsDir: string;

  constructor() {
    this.sessionsDir = config.get('sessionsDir');
  }

  async ensureSessionsDir(): Promise<void> {
    try {
      await fs.mkdir(this.sessionsDir, { recursive: true });
    } catch (error) {
      console.error(chalk.red('Failed to create sessions directory'));
      throw error;
    }
  }

  async createSession(idea: string, sessionConfig: SessionConfig): Promise<Session> {
    await this.ensureSessionsDir();

    const session: Session = {
      id: uuidv4().substring(0, 8),
      idea,
      currentStep: SessionStep.INITIAL_IDEA,
      questionRounds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      config: sessionConfig,
    };

    await this.saveSession(session);
    return session;
  }

  async saveSession(session: Session): Promise<void> {
    session.updatedAt = new Date();
    const sessionPath = join(this.sessionsDir, `${session.id}.json`);

    try {
      await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
    } catch (error) {
      console.error(chalk.red('Failed to save session'));
      throw error;
    }
  }

  async loadSession(sessionId: string): Promise<Session | null> {
    const sessionPath = join(this.sessionsDir, `${sessionId}.json`);

    try {
      const data = await fs.readFile(sessionPath, 'utf-8');
      const session = JSON.parse(data) as Session;

      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);
      session.questionRounds.forEach((round) => {
        round.timestamp = new Date(round.timestamp);
      });

      return session;
    } catch (error) {
      return null;
    }
  }

  async listSessions(): Promise<
    Array<{ id: string; idea: string; updatedAt: Date; step: SessionStep }>
  > {
    await this.ensureSessionsDir();

    try {
      const files = await fs.readdir(this.sessionsDir);
      const sessions = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const sessionId = file.replace('.json', '');
          const session = await this.loadSession(sessionId);

          if (session) {
            sessions.push({
              id: session.id,
              idea: session.idea.substring(0, 50) + (session.idea.length > 50 ? '...' : ''),
              updatedAt: session.updatedAt,
              step: session.currentStep,
            });
          }
        }
      }

      // Sort by most recent first
      sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return sessions;
    } catch (error) {
      console.error(chalk.red('Failed to list sessions'));
      return [];
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const sessionPath = join(this.sessionsDir, `${sessionId}.json`);

    try {
      await fs.unlink(sessionPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async cleanOldSessions(daysToKeep: number = 30): Promise<number> {
    const sessions = await this.listSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;

    for (const session of sessions) {
      if (session.updatedAt < cutoffDate) {
        if (await this.deleteSession(session.id)) {
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  getSessionFilePath(sessionId: string): string {
    return join(this.sessionsDir, `${sessionId}.json`);
  }
}
