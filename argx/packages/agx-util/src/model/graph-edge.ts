import type { GraphNode } from './graph-node.js';
import type { GraphType } from './graph-type.js';

/**
 * A directed edge between two nodes in the architecture graph.
 */
export class GraphEdge {
    readonly source: GraphNode | undefined;
    readonly target: GraphNode | undefined;
    readonly kind: GraphType | undefined;

    /** The raw reference text for source (e.g. "Parent.Child1"). */
    readonly sourceRef: string;
    /** The raw reference text for target. */
    readonly targetRef: string;

    constructor(
        source: GraphNode | undefined,
        target: GraphNode | undefined,
        kind: GraphType | undefined,
        sourceRef: string,
        targetRef: string,
    ) {
        this.source = source;
        this.target = target;
        this.kind = kind;
        this.sourceRef = sourceRef;
        this.targetRef = targetRef;
    }

    toString(): string {
        const src = this.source?.name ?? this.sourceRef;
        const tgt = this.target?.name ?? this.targetRef;
        const kindStr = this.kind ? ` : ${this.kind.name}` : '';
        return `${src} -> ${tgt}${kindStr}`;
    }
}
