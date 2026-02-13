/**
 * A key-value attribute on a node, type, or graph.
 */
export class GraphAttribute {
    readonly name: string;
    readonly value: string | number | boolean;

    constructor(name: string, value: string | number | boolean) {
        this.name = name;
        this.value = value;
    }

    get isString(): boolean { return typeof this.value === 'string'; }
    get isNumber(): boolean { return typeof this.value === 'number'; }
    get isBoolean(): boolean { return typeof this.value === 'boolean'; }

    toString(): string {
        return `${this.name} = ${JSON.stringify(this.value)}`;
    }
}
