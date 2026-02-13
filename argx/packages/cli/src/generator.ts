import type { AEdge, ANode, AType, Attribute, Model } from 'achitecture-graph-language';
import { expandToNode, joinToNode, toString } from 'langium/generate';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractDestinationAndName } from './util.js';

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    const fileNode = expandToNode`
        "use strict";

        ${joinToNode(model.edges, edge => `console.log('From, ${edge.source.ref?.name}!');`, { appendNewLineIfNotEmpty: true })}
    `.appendNewLineIfNotEmpty();

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}

export function generateXML(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.xml`;

    const xmlContent = modelToXML(model);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, xmlContent);
    return generatedFilePath;
}

function modelToXML(model: Model): string {
    const indent = '  ';
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<Model>\n';

    // Generate types
    for (const type of model.types) {
        xml += generateAType(type, 1, indent);
    }

    // Generate nodes
    for (const node of model.nodes) {
        xml += generateANode(node, 1, indent);
    }

    // Generate edges
    for (const edge of model.edges) {
        xml += generateAEdge(edge, 1, indent);
    }

    // Generate attributes
    for (const attr of model.attributes) {
        xml += generateAttribute(attr, 1, indent);
    }

    xml += '</Model>\n';
    return xml;
}

function generateAType(type: AType, level: number, indent: string): string {
    const indentation = indent.repeat(level);
    let xml = `${indentation}<AType name="${escapeXML(type.name)}"`;

    // Add supertype references
    if (type.supers && type.supers.length > 0) {
        const superNames = type.supers
            .map(s => s.ref?.name)
            .filter(name => name !== undefined)
            .join(', ');
        if (superNames) {
            xml += ` supers="${escapeXML(superNames)}"`;
        }
    }

    if (type.attributes.length === 0) {
        xml += ' />\n';
    } else {
        xml += '>\n';
        for (const attr of type.attributes) {
            xml += generateAttribute(attr, level + 1, indent);
        }
        xml += `${indentation}</AType>\n`;
    }

    return xml;
}

function generateANode(node: ANode, level: number, indent: string): string {
    const indentation = indent.repeat(level);
    let xml = `${indentation}<ANode name="${escapeXML(node.name)}"`;

    // Add kind reference
    if (node.kind.ref) {
        xml += ` kind="${escapeXML(node.kind.ref.name)}"`;
    }

    const hasChildren = node.attributes.length > 0 || node.nodes.length > 0 || node.edges.length > 0;

    if (!hasChildren) {
        xml += ' />\n';
    } else {
        xml += '>\n';

        // Generate attributes
        for (const attr of node.attributes) {
            xml += generateAttribute(attr, level + 1, indent);
        }

        // Generate nested nodes
        for (const childNode of node.nodes) {
            xml += generateANode(childNode, level + 1, indent);
        }

        // Generate nested edges
        for (const edge of node.edges) {
            xml += generateAEdge(edge, level + 1, indent);
        }

        xml += `${indentation}</ANode>\n`;
    }

    return xml;
}

function generateAEdge(edge: AEdge, level: number, indent: string): string {
    const indentation = indent.repeat(level);
    let xml = `${indentation}<AEdge`;

    if (edge.source.ref) {
        xml += ` source="${escapeXML(edge.source.ref.name)}"`;
    }

    if (edge.target.ref) {
        xml += ` target="${escapeXML(edge.target.ref.name)}"`;
    }

    if (edge.kind?.ref) {
        xml += ` kind="${escapeXML(edge.kind.ref.name)}"`;
    }

    xml += ' />\n';

    return xml;
}

function generateAttribute(attr: Attribute, level: number, indent: string): string {
    const indentation = indent.repeat(level);
    return `${indentation}<Attribute name="${escapeXML(attr.name)}" value="${escapeXML(attr.value)}" />\n`;
}

function escapeXML(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
