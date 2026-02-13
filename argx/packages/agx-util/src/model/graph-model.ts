import { GraphAttribute } from './graph-attribute.js';
import { GraphEdge } from './graph-edge.js';
import { GraphNode } from './graph-node.js';
import { GraphType } from './graph-type.js';

/**
 * The root graph model — the result of parsing an .agx file.
 * Contains top-level types, nodes, edges, and attributes.
 */
export class GraphModel {
    readonly types: GraphType[];
    readonly nodes: GraphNode[];
    readonly edges: GraphEdge[];
    readonly attributes: GraphAttribute[];

    constructor(
        types: GraphType[] = [],
        nodes: GraphNode[] = [],
        edges: GraphEdge[] = [],
        attributes: GraphAttribute[] = [],
    ) {
        this.types = types;
        this.nodes = nodes;
        this.edges = edges;
        this.attributes = attributes;
    }

    /** All nodes recursively (top-level + nested). */
    allNodes(): GraphNode[] {
        const result: GraphNode[] = [];
        for (const node of this.nodes) {
            result.push(node);
            result.push(...node.allDescendants());
        }
        return result;
    }

    /** All edges recursively (top-level + inside nested nodes). */
    allEdges(): GraphEdge[] {
        const result: GraphEdge[] = [...this.edges];
        for (const node of this.nodes) {
            result.push(...node.allEdges());
        }
        return result;
    }

    /** Find a node by name (searches recursively). */
    findNode(name: string): GraphNode | undefined {
        return this.allNodes().find(n => n.name === name);
    }

    /** Find a type by name. */
    findType(name: string): GraphType | undefined {
        return this.types.find(t => t.name === name);
    }

    /** Find nodes by their kind/type name. */
    findNodesByKind(kindName: string): GraphNode[] {
        return this.allNodes().filter(n => n.kind?.name === kindName);
    }
}
