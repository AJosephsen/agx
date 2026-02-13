import type { Model, AType, ANode, AEdge, Attribute } from 'achitecture-graph-language';
import { GraphModel } from './model/graph-model.js';
import { GraphNode } from './model/graph-node.js';
import { GraphEdge } from './model/graph-edge.js';
import { GraphType } from './model/graph-type.js';
import { GraphAttribute } from './model/graph-attribute.js';

/**
 * Converts a Langium AST Model into a clean GraphModel structure.
 */
export function convertToGraph(ast: Model): GraphModel {
    const typeMap = new Map<AType, GraphType>();
    const nodeMap = new Map<ANode, GraphNode>();

    // Pass 1: Convert all types (need to handle forward refs for supers)
    const graphTypes = convertTypes(ast.types, typeMap);

    // Pass 2: Convert all top-level nodes (recursively handles children)
    const graphNodes = convertNodes(ast.nodes, typeMap, nodeMap, undefined);

    // Pass 3: Convert all top-level edges (resolve refs via nodeMap)
    const graphEdges = convertEdges(ast.edges, typeMap, nodeMap);

    // Pass 4: Convert edges inside nested nodes
    resolveNestedEdges(ast.nodes, typeMap, nodeMap);

    // Convert top-level attributes
    const graphAttrs = convertAttributes(ast.attributes);

    return new GraphModel(graphTypes, graphNodes, graphEdges, graphAttrs);
}

function convertTypes(astTypes: AType[], typeMap: Map<AType, GraphType>): GraphType[] {
    // First pass: create all types without supers
    for (const astType of astTypes) {
        const gt = new GraphType(astType.name, [], convertAttributes(astType.attributes));
        typeMap.set(astType, gt);
    }

    // Second pass: wire up supers
    for (const astType of astTypes) {
        const gt = typeMap.get(astType)!;
        for (const superRef of astType.supers) {
            const resolved = superRef.ref;
            if (resolved) {
                const superType = typeMap.get(resolved);
                if (superType) {
                    gt.supers.push(superType);
                }
            }
        }
    }

    return astTypes.map(t => typeMap.get(t)!);
}

function convertNodes(
    astNodes: ANode[],
    typeMap: Map<AType, GraphType>,
    nodeMap: Map<ANode, GraphNode>,
    parent: GraphNode | undefined,
): GraphNode[] {
    return astNodes.map(astNode => {
        const kind = astNode.kind.ref ? typeMap.get(astNode.kind.ref) : undefined;
        const attrs = convertAttributes(astNode.attributes);

        // Create the node first (children/edges empty, filled next)
        const graphNode = new GraphNode(astNode.name, kind, [], [], attrs, parent);
        nodeMap.set(astNode, graphNode);

        // Recursively convert children
        const children = convertNodes(astNode.nodes, typeMap, nodeMap, graphNode);
        graphNode.children.push(...children);

        return graphNode;
    });
}

function convertEdges(
    astEdges: AEdge[],
    typeMap: Map<AType, GraphType>,
    nodeMap: Map<ANode, GraphNode>,
): GraphEdge[] {
    return astEdges.map(astEdge => {
        const source = astEdge.source.ref ? nodeMap.get(astEdge.source.ref) : undefined;
        const target = astEdge.target.ref ? nodeMap.get(astEdge.target.ref) : undefined;
        const kind = astEdge.kind?.ref ? typeMap.get(astEdge.kind.ref) : undefined;

        return new GraphEdge(source, target, kind, astEdge.source.$refText, astEdge.target.$refText);
    });
}

function resolveNestedEdges(
    astNodes: ANode[],
    typeMap: Map<AType, GraphType>,
    nodeMap: Map<ANode, GraphNode>,
): void {
    for (const astNode of astNodes) {
        const graphNode = nodeMap.get(astNode);
        if (graphNode && astNode.edges.length > 0) {
            const edges = convertEdges(astNode.edges, typeMap, nodeMap);
            graphNode.edges.push(...edges);
        }
        // Recurse into children
        resolveNestedEdges(astNode.nodes, typeMap, nodeMap);
    }
}

function coerceValue(raw: string): string | number | boolean {
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    // Strip surrounding quotes for strings
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
        return raw.slice(1, -1);
    }
    const num = Number(raw);
    if (!isNaN(num)) return num;
    return raw;
}

function convertAttributes(astAttrs: Attribute[]): GraphAttribute[] {
    return astAttrs.map(a => new GraphAttribute(a.name, coerceValue(a.value)));
}
