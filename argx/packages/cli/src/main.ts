import type { Model } from 'achitecture-graph-language';
import { createAchitectureGraphServices, ArchitecturegraphsLanguageMetaData } from 'achitecture-graph-language';
import chalk from 'chalk';
import { Command } from 'commander';
import { extractAstNode } from './util.js';
import { generateJavaScript, generateXML } from './generator.js';
import { NodeFileSystem } from 'langium/node';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createAchitectureGraphServices(NodeFileSystem).AchitectureGraph;
    const model = await extractAstNode<Model>(fileName, services);

    const format = opts.format || 'xml';
    let generatedFilePath: string;

    if (format === 'xml') {
        generatedFilePath = generateXML(model, fileName, opts.destination);
        console.log(chalk.green(`XML generated successfully: ${generatedFilePath}`));
    } else if (format === 'js') {
        generatedFilePath = generateJavaScript(model, fileName, opts.destination);
        console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
    } else {
        console.error(chalk.red(`Unknown format: ${format}. Supported formats: xml, js`));
        process.exit(1);
    }
};

export type GenerateOptions = {
    destination?: string;
    format?: string;
}

export default function(): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    const fileExtensions = ArchitecturegraphsLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .option('-f, --format <format>', 'output format (xml, js)', 'xml')
        .description('generates code from the architecture graph model')
        .action(generateAction);

    program.parse(process.argv);
}
