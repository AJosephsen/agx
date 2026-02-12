import { describe, expect, test } from 'vitest';
import { AgxReader, AgxParseError, GraphModel } from 'agx-util';

describe('AgxReader.parseString', () => {

    test('parse simple types and nodes', async () => {
        const graph = await AgxReader.parseString(`
            type Person;
            Person Alice;
            Person Bob;
            Alice -> Bob;
        `);

        expect(graph).toBeInstanceOf(GraphModel);
        expect(graph.types).toHaveLength(1);
        expect(graph.types[0].name).toBe('Person');
        expect(graph.nodes).toHaveLength(2);
        expect(graph.nodes[0].name).toBe('Alice');
        expect(graph.nodes[1].name).toBe('Bob');
        expect(graph.edges).toHaveLength(1);
        expect(graph.edges[0].source?.name).toBe('Alice');
        expect(graph.edges[0].target?.name).toBe('Bob');
    });

    test('parse nested nodes', async () => {
        const graph = await AgxReader.parseString(`
            type System;
            type Application;
            System CEPOS {
                Application Risk;
                Application Payments;
                Risk -> Payments;
            }
        `);

        expect(graph.nodes).toHaveLength(1);
        expect(graph.nodes[0].name).toBe('CEPOS');
        expect(graph.nodes[0].kind?.name).toBe('System');
        expect(graph.nodes[0].children).toHaveLength(2);
        expect(graph.nodes[0].children[0].name).toBe('Risk');
        expect(graph.nodes[0].children[0].kind?.name).toBe('Application');
        expect(graph.nodes[0].children[1].name).toBe('Payments');

        // Nested edge
        expect(graph.nodes[0].edges).toHaveLength(1);
        expect(graph.nodes[0].edges[0].source?.name).toBe('Risk');
        expect(graph.nodes[0].edges[0].target?.name).toBe('Payments');
    });

    test('parse attributes', async () => {
        const graph = await AgxReader.parseString(`
            type Server;
            Server Web {
                Port = 8080;
                Name = "web-server";
                Active = true;
            }
        `);

        const node = graph.nodes[0];
        expect(node.attributes).toHaveLength(3);
        expect(node.getAttribute('Port')).toBe(8080);
        expect(node.getAttribute('Name')).toBe('web-server');
        expect(node.getAttribute('Active')).toBe(true);
    });

    test('allNodes returns all nodes recursively', async () => {
        const graph = await AgxReader.parseString(`
            type T;
            T Parent {
                T Child1;
                T Child2;
            }
            T Standalone;
        `);

        expect(graph.nodes).toHaveLength(2);
        expect(graph.allNodes()).toHaveLength(4); // Parent, Child1, Child2, Standalone
    });

    test('allEdges returns all edges recursively', async () => {
        const graph = await AgxReader.parseString(`
            type T;
            T A {
                T B;
                T C;
                B -> C;
            }
            T D;
            A -> D;
        `);

        expect(graph.edges).toHaveLength(1); // A -> D at top level
        expect(graph.allEdges()).toHaveLength(2); // A -> D + B -> C
    });

    test('findNode searches recursively', async () => {
        const graph = await AgxReader.parseString(`
            type T;
            T Root {
                T Deep;
            }
        `);

        expect(graph.findNode('Deep')?.name).toBe('Deep');
        expect(graph.findNode('Nonexistent')).toBeUndefined();
    });

    test('findNodesByKind filters by type', async () => {
        const graph = await AgxReader.parseString(`
            type App;
            type DB;
            App Frontend;
            App Backend;
            DB Postgres;
        `);

        expect(graph.findNodesByKind('App')).toHaveLength(2);
        expect(graph.findNodesByKind('DB')).toHaveLength(1);
    });

    test('type inheritance', async () => {
        // Skip validation: the scope provider doesn't yet resolve AType.supers references
        const graph = await AgxReader.parseString(`
            type Base;
            type Child : Base;
        `, { validate: false });

        expect(graph.types).toHaveLength(2);
        const childType = graph.findType('Child');
        expect(childType?.supers).toHaveLength(1);
        expect(childType?.supers[0].name).toBe('Base');
        expect(childType?.extends('Base')).toBe(true);
    });

    test('node qualifiedName includes parent', async () => {
        const graph = await AgxReader.parseString(`
            type T;
            T Parent {
                T Child;
            }
        `);

        const child = graph.findNode('Child');
        expect(child?.qualifiedName).toBe('Parent.Child');
    });

    test('parse error throws AgxParseError', async () => {
        await expect(
            AgxReader.parseString(`this is not valid agx !!!`)
        ).rejects.toThrow(AgxParseError);
    });

    test('skip validation when option is false', async () => {
        // lowercase type name triggers a validation warning, but we skip validation
        const graph = await AgxReader.parseString(`
            type lowercase;
        `, { validate: false });

        expect(graph.types).toHaveLength(1);
        expect(graph.types[0].name).toBe('lowercase');
    });

    test('edge with kind', async () => {
        // Skip validation: the scope provider doesn't yet resolve AEdge.kind references
        const graph = await AgxReader.parseString(`
            type Node;
            type Rel;
            Node A;
            Node B;
            A -> B : Rel;
        `, { validate: false });

        expect(graph.edges[0].kind?.name).toBe('Rel');
    });
});
