import { Session } from '../types/index.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';

export class Exporter {
  private getOutputDir(): string {
    // Always use current working directory instead of stored config
    return process.cwd();
  }

  async exportSession(session: Session, format: 'markdown' | 'json' | 'both'): Promise<string[]> {
    const exportedFiles: string[] = [];
    const baseFileName = `${session.idea
      .substring(0, 30)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}-${session.id}`;

    if (format === 'markdown' || format === 'both') {
      const mdPath = await this.exportMarkdown(session, baseFileName);
      exportedFiles.push(mdPath);
    }

    if (format === 'json' || format === 'both') {
      const jsonPath = await this.exportJson(session, baseFileName);
      exportedFiles.push(jsonPath);
    }

    return exportedFiles;
  }

  async exportSpecificationOnly(session: Session, format: 'markdown' | 'json'): Promise<string> {
    const baseFileName = `${session.idea
      .substring(0, 30)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}-${session.id}-spec`;

    if (format === 'markdown') {
      return await this.exportSpecificationMarkdown(session, baseFileName);
    } else {
      return await this.exportSpecificationJson(session, baseFileName);
    }
  }

  async exportFileStructureOnly(session: Session, format: 'markdown' | 'json'): Promise<string> {
    const baseFileName = `${session.idea
      .substring(0, 30)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}-${session.id}-structure`;

    if (format === 'markdown') {
      return await this.exportFileStructureMarkdown(session, baseFileName);
    } else {
      return await this.exportFileStructureJson(session, baseFileName);
    }
  }

  private async exportMarkdown(session: Session, baseFileName: string): Promise<string> {
    const spinner = ora('Exporting markdown...').start();

    try {
      const content = this.generateMarkdown(session);
      const filePath = join(this.getOutputDir(), `${baseFileName}.md`);

      await fs.writeFile(filePath, content);
      spinner.succeed(`Exported to ${chalk.green(filePath)}`);

      return filePath;
    } catch (error) {
      spinner.fail('Failed to export markdown');
      throw error;
    }
  }

  private async exportJson(session: Session, baseFileName: string): Promise<string> {
    const spinner = ora('Exporting JSON...').start();

    try {
      const filePath = join(this.getOutputDir(), `${baseFileName}.json`);

      const exportData = {
        metadata: {
          id: session.id,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          config: session.config,
        },
        idea: session.idea,
        questionRounds: session.questionRounds,
        outputs: {
          writeup: session.writeup,
          fileStructure: session.fileStructure,
        },
      };

      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
      spinner.succeed(`Exported to ${chalk.green(filePath)}`);

      return filePath;
    } catch (error) {
      spinner.fail('Failed to export JSON');
      throw error;
    }
  }

  private generateMarkdown(session: Session): string {
    let md = `# ${session.idea}\n\n`;
    md += `> Generated on ${session.createdAt.toLocaleDateString()} using MakeAPlan CLI\n\n`;

    // Table of Contents
    md += `## Table of Contents\n\n`;
    md += `1. [Product Idea](#product-idea)\n`;
    md += `2. [Discovery Process](#discovery-process)\n`;
    if (session.writeup) {
      md += `3. [Technical Specification](#technical-specification)\n`;
    }
    if (session.fileStructure) {
      md += `4. [File Structure](#file-structure)\n`;
    }
    md += `\n---\n\n`;

    // Product Idea
    md += `## Product Idea\n\n`;
    md += `${session.idea}\n\n`;

    // Discovery Process
    md += `## Discovery Process\n\n`;
    md += `The following questions were asked to better understand the requirements:\n\n`;

    session.questionRounds.forEach((round) => {
      md += `### Round ${round.roundNumber}\n\n`;

      round.questions.forEach((question, qIndex) => {
        const answer = round.answers[qIndex];
        if (answer) {
          md += `**Q${qIndex + 1}: ${question.question}**\n`;
          md += `> ${answer}\n\n`;
        }
      });
    });

    // Technical Specification
    if (session.writeup) {
      md += `---\n\n## Technical Specification\n\n`;
      md += `${session.writeup}\n\n`;
    }

    // File Structure
    if (session.fileStructure) {
      md += `---\n\n## File Structure\n\n`;
      md += '```\n';
      md += `${session.fileStructure}\n`;
      md += '```\n\n';
    }

    // Configuration
    md += `---\n\n## Configuration\n\n`;
    md += `- **AI Provider**: ${session.config.provider}\n`;
    md += `- **First Round Questions**: ${session.config.firstRoundQuestions}\n`;
    md += `- **Subsequent Round Questions**: ${session.config.subsequentRoundQuestions}\n`;
    md += `- **Answers Per Question**: ${session.config.answersPerQuestion}\n`;

    return md;
  }

  private async exportSpecificationMarkdown(session: Session, baseFileName: string): Promise<string> {
    if (!session.writeup) {
      throw new Error('No specification found to export');
    }

    let content = `# ${session.idea} - Technical Specification\n\n`;
    content += `> Generated on ${session.createdAt.toLocaleDateString()} using MakeAPlan CLI\n\n`;
    content += `${session.writeup}\n\n`;
    content += `---\n\n*Session ID: ${session.id}*\n`;

    const filePath = join(this.getOutputDir(), `${baseFileName}.md`);
    await fs.writeFile(filePath, content);
    
    return filePath;
  }

  private async exportSpecificationJson(session: Session, baseFileName: string): Promise<string> {
    if (!session.writeup) {
      throw new Error('No specification found to export');
    }

    const exportData = {
      metadata: {
        id: session.id,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        type: 'specification',
      },
      idea: session.idea,
      specification: session.writeup,
    };

    const filePath = join(this.getOutputDir(), `${baseFileName}.json`);
    await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
    
    return filePath;
  }

  private async exportFileStructureMarkdown(session: Session, baseFileName: string): Promise<string> {
    if (!session.fileStructure) {
      throw new Error('No file structure found to export');
    }

    let content = `# ${session.idea} - File Structure\n\n`;
    content += `> Generated on ${session.createdAt.toLocaleDateString()} using MakeAPlan CLI\n\n`;
    content += '```\n';
    content += `${session.fileStructure}\n`;
    content += '```\n\n';
    content += `---\n\n*Session ID: ${session.id}*\n`;

    const filePath = join(this.getOutputDir(), `${baseFileName}.md`);
    await fs.writeFile(filePath, content);
    
    return filePath;
  }

  private async exportFileStructureJson(session: Session, baseFileName: string): Promise<string> {
    if (!session.fileStructure) {
      throw new Error('No file structure found to export');
    }

    const exportData = {
      metadata: {
        id: session.id,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        type: 'file-structure',
      },
      idea: session.idea,
      fileStructure: session.fileStructure,
    };

    const filePath = join(this.getOutputDir(), `${baseFileName}.json`);
    await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
    
    return filePath;
  }
}
