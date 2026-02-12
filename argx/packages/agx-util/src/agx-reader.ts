import { EmptyFileSystem, URI, type LangiumDocument } from 'langium';
import { parseHelper } from 'langium/test';
import {
    createAchitectureGraphServices,
    type Model,
    isModel,
} from 'achitecture-graph-language';
import { convertToGraph } from './converter.js';
import { GraphModel } from './model/graph-model.js';
import { AgxParseError, AgxValidationError } from './errors.js';

export interface ParseOptions {
    /** Whether to run validation checks. Defaults to true. */
    validate?: boolean;
}

/**
 * Main entry point for parsing .agx content into a GraphModel.
 */
export class AgxReader {

    /**
     * Parse a raw .agx string into a GraphModel.
     */
    static async parseString(content: string, options?: ParseOptions): Promise<GraphModel> {
        const services = createAchitectureGraphServices(EmptyFileSystem);
        const parse = parseHelper<Model>(services.AchitectureGraph);
        const document = await parse(content, {
            validation: options?.validate !== false,
        });
        return AgxReader.processDocument(document, options);
    }

    /**
     * Parse an .agx file from disk into a GraphModel.
     * Requires Node.js (uses filesystem access).
     */
    static async parseFile(filePath: string, options?: ParseOptions): Promise<GraphModel> {
        // Dynamic import to avoid bundling node fs for string-only use
        const { NodeFileSystem } = await import('langium/node');
        const services = createAchitectureGraphServices(NodeFileSystem);
        const langServices = services.AchitectureGraph;

        const { resolve } = await import('node:path');
        const resolved = resolve(filePath);

        const document = await langServices.shared.workspace.LangiumDocuments
            .getOrCreateDocument(URI.file(resolved));
        await langServices.shared.workspace.DocumentBuilder.build(
            [document],
            { validation: options?.validate !== false },
        );

        return AgxReader.processDocument(document, options);
    }

    private static processDocument(
        document: LangiumDocument,
        options?: ParseOptions,
    ): GraphModel {
        if (document.parseResult.parserErrors.length > 0) {
            throw new AgxParseError(
                document.parseResult.parserErrors.map(e => e.message),
            );
        }

        const model = document.parseResult.value;
        if (!model || !isModel(model)) {
            throw new AgxParseError(['Failed to parse: root is not a Model']);
        }

        if (options?.validate !== false) {
            const errors = (document.diagnostics ?? []).filter(d => d.severity === 1);
            if (errors.length > 0) {
                throw new AgxValidationError(
                    errors.map(e => ({
                        message: e.message,
                        line: e.range.start.line + 1,
                        column: e.range.start.character + 1,
                    })),
                );
            }
        }

        return convertToGraph(model as Model);
    }
}
