import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { AchitectureGraphAstType, ANode, AType } from './generated/ast.js';
import type { AchitectureGraphServices } from './achitecture-graph-module.js';

const logValidation = (...message: Array<unknown>) => {
    process.stderr.write(`[validator] ${message.join(' ')}\n`);
};

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: AchitectureGraphServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.AchitectureGraphValidator;
    const checks: ValidationChecks<AchitectureGraphAstType> = {
        AType: [
            validator.checkComponentStartsWithCapital
        ]
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class AchitectureGraphValidator {

    checkComponentStartsWithCapital(component: AType, accept: ValidationAcceptor): void {
        logValidation('Checking capital rule for', component.name ?? '<unknown>');
        if (component.name) {
            const firstChar = component.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                logValidation('Capital rule triggered for', component.name);
                accept('warning', 'Type name should start with a capital.', { node: component, property: 'name' });
            }
        }
    }

}
