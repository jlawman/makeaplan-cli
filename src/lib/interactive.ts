import inquirer from 'inquirer';
import chalk from 'chalk';
import { Question, SessionStep } from '../types/index.js';

export async function askForIdea(): Promise<string> {
  const { idea } = await inquirer.prompt([
    {
      type: 'input',
      name: 'idea',
      message: "What's your product idea?",
      validate: (input) => input.trim().length > 0 || 'Please enter a product idea',
    },
  ]);

  return idea.trim();
}

export async function askQuestions(questions: Question[], round: number): Promise<string[]> {
  console.log(chalk.cyan(`\n📝 Round ${round} Questions\n`));
  console.log(chalk.gray('💡 Tip: Type the number (1-9) to quickly select an option\n'));

  const answers: string[] = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    // Add numbered choices for list type
    const numberedChoices = question.choices.map((choice, index) => ({
      name: `${index + 1}) ${choice}`,
      value: choice,
      short: choice,
    }));

    const choices: any[] = [
      ...numberedChoices,
      new inquirer.Separator(),
      { name: '0) ✏️  Write your own answer', value: 'custom', short: 'Custom' },
      { name: 's) ⏭️  Skip this question', value: 'skip', short: 'Skipped' },
    ];

    // Use list type for better control
    const { answer } = await inquirer.prompt([
      {
        type: 'list',
        name: 'answer',
        message: `${question.question}`,
        choices,
        pageSize: 12,
        prefix: `${i + 1}/${questions.length}`,
      },
    ]);

    if (answer === 'custom') {
      const { customAnswer } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customAnswer',
          message: 'Enter your answer:',
          validate: (input) => input.trim().length > 0 || 'Please enter an answer',
        },
      ]);
      answers.push(customAnswer.trim());
    } else if (answer === 'skip') {
      answers.push('');
    } else {
      answers.push(answer);
    }
  }

  return answers;
}

export async function confirmContinue(
  message: string = 'Continue to next step?'
): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message,
      default: true,
    },
  ]);

  return confirm;
}

export async function selectSession(
  sessions: Array<{ id: string; idea: string; updatedAt: Date; step: SessionStep }>
): Promise<string | null> {
  if (sessions.length === 0) {
    console.log(chalk.yellow('No existing sessions found.'));
    return null;
  }

  const choices = sessions.map((session) => ({
    name: `${session.idea} - ${chalk.gray(getStepLabel(session.step))} - ${chalk.gray(formatDate(session.updatedAt))}`,
    value: session.id,
  }));

  choices.push(new inquirer.Separator() as any);
  choices.push({ name: '← Back', value: null } as any);

  const { sessionId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'sessionId',
      message: 'Select a session to resume:',
      choices,
      pageSize: 10,
    },
  ]);

  return sessionId;
}

export async function selectExportFormat(): Promise<'markdown' | 'json' | 'both'> {
  const { format } = await inquirer.prompt([
    {
      type: 'list',
      name: 'format',
      message: 'Export format:',
      choices: [
        { name: '📝 Markdown', value: 'markdown' },
        { name: '📊 JSON', value: 'json' },
        { name: '📦 Both', value: 'both' },
      ],
    },
  ]);

  return format;
}

export async function askSessionConfig() {
  const { firstRoundQuestions, subsequentRoundQuestions, answersPerQuestion, provider } =
    await inquirer.prompt([
      {
        type: 'number',
        name: 'firstRoundQuestions',
        message: 'Number of questions in first round:',
        default: 5,
        validate: (input) => (input >= 2 && input <= 8) || 'Please enter a number between 2 and 8',
      },
      {
        type: 'number',
        name: 'subsequentRoundQuestions',
        message: 'Number of questions in subsequent rounds:',
        default: 5,
        validate: (input) => (input >= 2 && input <= 6) || 'Please enter a number between 2 and 6',
      },
      {
        type: 'number',
        name: 'answersPerQuestion',
        message: 'Number of answer choices per question:',
        default: 4,
        validate: (input) => (input >= 2 && input <= 6) || 'Please enter a number between 2 and 6',
      },
      {
        type: 'list',
        name: 'provider',
        message: 'AI provider:',
        choices: [
          { name: '🤖 Anthropic (Claude)', value: 'anthropic' },
          { name: '🧠 Google (Gemini)', value: 'gemini' },
        ],
        default: 'anthropic',
      },
    ]);

  return {
    firstRoundQuestions,
    subsequentRoundQuestions,
    answersPerQuestion,
    provider,
  };
}

function getStepLabel(step: SessionStep): string {
  const labels = {
    [SessionStep.INITIAL_IDEA]: 'Initial Idea',
    [SessionStep.QUESTIONS_ROUND_1]: 'Round 1',
    [SessionStep.QUESTIONS_ROUND_2]: 'Round 2',
    [SessionStep.QUESTIONS_ROUND_3]: 'Round 3',
    [SessionStep.FINAL_WRITEUP]: 'Writeup',
    [SessionStep.GENERATE_FILE_STRUCTURE]: 'File Structure',
    [SessionStep.CONVERT_TO_JSON]: 'Complete',
  };

  return labels[step] || 'Unknown';
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