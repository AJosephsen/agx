import { ReferenceInfo, Scope, ScopeProvider, AstUtils, LangiumCoreServices, AstNodeDescriptionProvider, MapScope, EMPTY_SCOPE } from "langium";
import {  isModel, isANode, ANode, isAEdge } from "./generated/ast.js";


// refactoring component to node ... and greeting to edge


const logValidation = (...message: Array<unknown>) => {
    process.stderr.write(`[scope provider] ${message.join(' ')}\n`);
};

export class NodeReferenceScopeProvider implements ScopeProvider {
    private astNodeDescriptionProvider: AstNodeDescriptionProvider;
    constructor(services: LangiumCoreServices) {
        //get some helper services
        this.astNodeDescriptionProvider = services.workspace.AstNodeDescriptionProvider;
    }

    getScope(context: ReferenceInfo): Scope {
        logValidation('Getting scope for', context.container.$type, 'property', context.property);
        //make sure which cross-reference you are handling right now


        // provide the scope for the kind of node (types)
        if (isANode(context.container) && context.property === 'kind') 
        {
            const model = AstUtils.getContainerOfType(context.container, isModel)!;
            const types =model.types;

            const descriptions = Array.from(types.map(type => this.astNodeDescriptionProvider.createDescription(type, type.name)));
             return new MapScope(descriptions);




        }

        // provide scope for the source of an edge 
        if (isAEdge(context.container) && context.property === 'source') {

            // get the scope of the cross-reference - by finding the parrent node
            var parrent = context.container.$container;

            logValidation('Parent node is', parrent?.$type);


            //get the root node of the document
            const model = AstUtils.getContainerOfType(context.container, isModel)!;
            //select all nodes from this document 
            // this should be done recursively to also include nodes from nested structures, but for the sake of simplicity we just take the top-level ones here
            const nodes = this.getAllComponents(model.nodes);
            var reftext = context.reference.$refText;
            logValidation('Available nodes are', nodes.map(c => c.name).join(', '), 'and we are looking for', reftext);
            // filter the nodes to those that starts with the same text as the reference we are trying to resolve, this is important for performance reasons, especially if you have a large model
            const filteredNodes = nodes.filter(c => c.name.startsWith(reftext));

            // create an empty list of AST node descriptions

            // should be a dictionary 
            var scope = new Map<string, ANode>();

            const addChildrenToScope = (children : ANode[], path: string): void => {
                for (const child of children) {
                    const childPath = path ? `${path}.${child.name}` : child.name;
                    // if desc already contains a component with the same name, we skip it to avoid duplicates in the scope, this is important for performance reasons, especially if you have a large model with many nested components
                    if ( childPath.startsWith(reftext)) 
                    {
                      if (!scope.has(childPath)) { 
                        scope.set(childPath, child);
                      }
                    }
                    if (child.nodes) {
                        addChildrenToScope(child.nodes, childPath);
                    }
                }
            };

            addChildrenToScope(parrent.nodes, '');
            // add the filteredComponents to scope
            for (const c of filteredNodes) {
                if (!scope.has(c.name)) {
                    scope.set(c.name, c);
                }
            }

            const descriptions = Array.from(scope.entries()).map(([name, component]) => this.astNodeDescriptionProvider.createDescription(component, name));

            //transform desc into node descriptions

//            const descriptions = filteredComponents.map(c => this.astNodeDescriptionProvider.createDescription(c, c.name));


            // log the descriptions we are returning for debugging purposes
            logValidation('Returning descriptions for', reftext, ':', descriptions.map(d => d.name).join(', '));

            //create the scope                   
            return new MapScope(descriptions);
        }
        logValidation('No specific scope found for', context.container.$type, 'property', context.property, 'returning empty scope');
        return EMPTY_SCOPE;


    }

    // build a list recursively to include nested components as well
    getAllComponents(cs: ANode[]): ANode[] {
        let result: ANode[] = [];
        for (const c of cs) {
            result.push(c);
            if (c.nodes) {
                result = result.concat(this.getAllComponents(c.nodes));
            }
        }
        return result;
    }
}