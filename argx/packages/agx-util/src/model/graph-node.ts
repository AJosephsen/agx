import { GraphAttribute } from './graph-attribute.js';
import { GraphEdge } from './graph-edge.js';
import { GraphType } from './graph-type.js';

/**
 * A node in the architecture graph.
 * Nodes have a kind (type), can contain child nodes, edges, and attributes.
 */
export class GraphNode {
    readonly name: string;
    readonly kind: GraphType | undefined;
    readonly children: GraphNode[];
    readonly edges: GraphEdge[];
    readonly attributes: GraphAttribute[];
    readonly parent: GraphNode | undefined;

    constructor(
        name: string,
        kind: GraphType | undefined,
        children: GraphNode[] = [],
        edges: GraphEdge[] = [],
        attributes: GraphAttribute[] = [],
        parent?: GraphNode,
    ) {
        this.name = name;
        this.kind = kind;
        this.children = children;
        this.edges = edges;
        this.attributes = attributes;
        this.parent = parent;
    }

    /** Qualified name using dot notation (e.g. "Parent.Child"). */
    get qualifiedName(): string {
        if (this.parent) {
            return `${this.parent.qualifiedName}.${this.name}`;
        }
        return this.name;
    }

    /** Get an attribute value by name. */
    getAttribute(name: string): string | number | boolean | undefined {
        return this.attributes.find(a => a.name === name)?.value;
    }

    /** Recursively collect all descendant nodes. */
    allDescendants(): GraphNode[] {
        const result: GraphNode[] = [];
        for (const child of this.children) {
            result.push(child);
            result.push(...child.allDescendants());
        }
        return result;
    }

    /** All edges from this node and its descendants. */
    allEdges(): GraphEdge[] {
        const result: GraphEdge[] = [...this.edges];
        for (const child of this.children) {
            result.push(...child.allEdges());
        }
        return result;
    }

    toString(): string {
        const kindStr = this.kind ? `${this.kind.name} ` : '';
        return `${kindStr}${this.name}`;
    }
}
