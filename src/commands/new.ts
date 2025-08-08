import { Session, SessionStep, QuestionRound } from '../types/index.js';
import { AIClient } from '../lib/ai-client.js';
import { SessionManager } from '../lib/session-manager.js';
import { Exporter } from '../lib/exporter.js';
import {
  askForIdea,
  askQuestions,
  confirmContinue,
  selectExportFormat,
  askSessionConfig,
} from '../lib/interactive.js';
import { ui } from '../lib/ui.js';
import chalk from 'chalk';

export async function newCommand(options: { idea?: string; skipQuestions?: boolean }) {
  try {
    ui.welcome();

    // Get idea
    const idea = options.idea || (await askForIdea());

    // Get session configuration
    ui.subheader('Configuration');
    const sessionConfig = options.skipQuestions
      ? {
          firstRoundQuestions: 5,
          subsequentRoundQuestions: 5,
          answersPerQuestion: 4,
          provider: 'anthropic' as const,
        }
      : await askSessionConfig();

    // Create session
    const sessionManager = new SessionManager();
    const session = await sessionManager.createSession(idea, sessionConfig);

    ui.successMsg(`Session created: ${chalk.gray(session.id)}`);

    // Initialize AI client
    const aiClient = new AIClient(sessionConfig.provider);
    await aiClient.initialize();

    // Start the workflow
    await runWorkflow(session, aiClient, sessionManager);
  } catch (error) {
    ui.errorMsg(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

export async function runWorkflow(
  session: Session,
  aiClient: AIClient,
  sessionManager: SessionManager
): Promise<void> {
  const currentSession = session;

  // Continue until workflow is complete
  let workflowComplete = false;

  while (!workflowComplete) {
    ui.step(currentSession.currentStep);

    switch (currentSession.currentStep) {
      case SessionStep.INITIAL_IDEA:
        // Move to first round of questions
        currentSession.currentStep = SessionStep.QUESTIONS_ROUND_1;
        await sessionManager.saveSession(currentSession);
        break;

      case SessionStep.QUESTIONS_ROUND_1:
      case SessionStep.QUESTIONS_ROUND_2:
      case SessionStep.QUESTIONS_ROUND_3: {
        const roundNumber =
          currentSession.currentStep === SessionStep.QUESTIONS_ROUND_1
            ? 1
            : currentSession.currentStep === SessionStep.QUESTIONS_ROUND_2
              ? 2
              : 3;

        // Get previous Q&A for context
        const previousQA = currentSession.questionRounds.flatMap((round) =>
          round.questions.map((q, i) => ({
            question: q.question,
            answer: round.answers[i] || '',
          }))
        );

        // Generate questions
        const questionsCount =
          roundNumber === 1
            ? currentSession.config.firstRoundQuestions
            : currentSession.config.subsequentRoundQuestions;

        const questions = await aiClient.generateQuestions(
          currentSession.idea,
          roundNumber,
          previousQA,
          {
            questionsCount,
            answersPerQuestion: currentSession.config.answersPerQuestion,
          }
        );

        // Ask questions
        const answers = await askQuestions(questions, roundNumber);

        // Save round
        const round: QuestionRound = {
          roundNumber,
          questions,
          answers,
          timestamp: new Date(),
        };
        currentSession.questionRounds.push(round);

        // Progress to next step
        if (currentSession.currentStep === SessionStep.QUESTIONS_ROUND_1) {
          currentSession.currentStep = SessionStep.QUESTIONS_ROUND_2;
        } else if (currentSession.currentStep === SessionStep.QUESTIONS_ROUND_2) {
          currentSession.currentStep = SessionStep.QUESTIONS_ROUND_3;
        } else {
          currentSession.currentStep = SessionStep.FINAL_WRITEUP;
        }

        await sessionManager.saveSession(currentSession);

        if (!(await confirmContinue())) {
          ui.infoMsg('Session saved. You can resume later with: makeaplan resume');
          return;
        }
        break;
      }

      case SessionStep.FINAL_WRITEUP: {
        // Generate writeup
        const allQuestions = currentSession.questionRounds.flatMap((round) =>
          round.questions.map((q) => q.question)
        );
        const allAnswers = currentSession.questionRounds.flatMap((round) => round.answers);

        currentSession.writeup = await aiClient.generateWriteup(
          currentSession.idea,
          allQuestions,
          allAnswers
        );

        currentSession.currentStep = SessionStep.GENERATE_FILE_STRUCTURE;
        await sessionManager.saveSession(currentSession);

        ui.box(
          [
            'Technical specification generated!',
            `Length: ${currentSession.writeup.length} characters`,
            `Sections: ${(currentSession.writeup.match(/^#{1,3} /gm) || []).length}`,
          ],
          'Specification Complete'
        );

        if (!(await confirmContinue('Generate file structure?'))) {
          await exportAndExit(currentSession);
          return;
        }
        break;
      }

      case SessionStep.GENERATE_FILE_STRUCTURE: {
        if (!currentSession.writeup) {
          throw new Error('No writeup found');
        }

        currentSession.fileStructure = await aiClient.generateFileStructure(currentSession.writeup);

        ui.box(
          [
            'File structure generated!',
            `Files/Dirs: ${(currentSession.fileStructure.match(/[│├└]/g) || []).length}`,
          ],
          'File Structure Complete'
        );

        if (!(await confirmContinue('Convert to JSON format?'))) {
          await sessionManager.saveSession(currentSession);
          await exportAndExit(currentSession);
          return;
        }

        // Convert to JSON
        currentSession.fileStructureJson = await aiClient.convertToJson(
          currentSession.fileStructure
        );
        currentSession.currentStep = SessionStep.CONVERT_TO_JSON;
        await sessionManager.saveSession(currentSession);

        ui.successMsg('Workflow complete! 🎉');
        workflowComplete = true;
        break;
      }
    }
  }

  // Export results
  await exportAndExit(currentSession);
}

async function exportAndExit(session: Session): Promise<void> {
  ui.header('Export Results');

  const format = await selectExportFormat();
  const exporter = new Exporter();
  const exportedFiles = await exporter.exportSession(session, format);

  ui.box(
    [
      'Your product specification is ready!',
      '',
      ...exportedFiles.map((file) => `📄 ${file}`),
      '',
      `Session ID: ${session.id.substring(0, 8)}`,
    ],
    'Export Complete'
  );

  ui.goodbye();
}
