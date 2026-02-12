import { GraphAttribute } from './graph-attribute.js';

/**
 * A type declaration in the architecture graph.
 * Types can have supertypes and attributes.
 */
export class GraphType {
    readonly name: string;
    readonly supers: GraphType[];
    readonly attributes: GraphAttribute[];

    constructor(name: string, supers: GraphType[] = [], attributes: GraphAttribute[] = []) {
        this.name = name;
        this.supers = supers;
        this.attributes = attributes;
    }

    /** Check if this type extends (directly or transitively) the given type name. */
    extends(typeName: string): boolean {
        for (const sup of this.supers) {
            if (sup.name === typeName || sup.extends(typeName)) {
                return true;
            }
        }
        return false;
    }

    toString(): string {
        const ext = this.supers.length > 0 ? ` : ${this.supers.map(s => s.name).join(', ')}` : '';
        return `type ${this.name}${ext}`;
    }
}
