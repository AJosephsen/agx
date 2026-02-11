import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { clearDocuments, parseHelper } from "langium/test";
import type { Model } from "achitecture-graph-language";
import { createAchitectureGraphServices, isModel } from "achitecture-graph-language";

let services: ReturnType<typeof createAchitectureGraphServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    services = createAchitectureGraphServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.AchitectureGraph);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

afterEach(async () => {
    document && clearDocuments(services.shared, [ document ]);
});

describe('Linking tests', () => {

    test('linking of greetings', async () => {
        document = await parse(`
            component Langium
            Hello Langium!
        `);

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the cross references we're interested in by checking
            //  the referenced AST element as well as for a potential error message;
            checkDocumentValid(document)
                || document.parseResult.value.greetings.map(g => g.component.ref?.name || g.component.error?.message).join('\n')
        ).toBe(s`
            Langium
        `);
    });

    test('linking of greetings2', async () => {

        document = await parse(`
            component John
            {
                component Jane
            }
            Hello John!
            Hello Jane!
        `);

        //assert
        const model = document.parseResult.value;
        expect(model.components).toHaveLength(1);
        expect(model.greetings).toHaveLength(2);
        expect(model.greetings[0].component.ref).toBe(model.components[0]);
        expect(model.greetings[1].component.ref).toBe(model.components[0].components[0]);

    });

    
    test('linking ', async () => {

        document = await parse(`
            component John
            {
                component Jane
            }
            Hello J!
            Hello Jane!
        `);

        //assert
        const model = document.parseResult.value;
        expect(model.components).toHaveLength(1);
        expect(model.greetings).toHaveLength(2);
        //expect(model.greetings[0].component.ref).toBe(model.components[0]);
        expect(model.greetings[1].component.ref).toBe(model.components[0].components[0]);

    });

    test('nested scope ', async () => {

        document = await parse(`
            component A
            {
                component B
                
            }
            Hello A.B!
        `);

        //assert
        const model = document.parseResult.value;
        expect(model.components).toHaveLength(1);
        expect(model.greetings).toHaveLength(1);
        expect(model.greetings[0].component.ref).toBe(model.components[0].components[0]);
//        expect(model.greetings[0].component.ref).toBe(model.components[0].components[0]);

    });


});

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || !isModel(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a 'Model'.`
        || undefined;
}

