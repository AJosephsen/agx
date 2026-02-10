import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { AchitectureGraphAstType, Person } from './generated/ast.js';
import type { AchitectureGraphServices } from './achitecture-graph-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: AchitectureGraphServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.AchitectureGraphValidator;
    const checks: ValidationChecks<AchitectureGraphAstType> = {
        Person: [
            validator.checkPersonStartsWithCapital,
            validator.checkPersonIsNotMe
        ]
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class AchitectureGraphValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }
    checkPersonIsNotMe(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const pre = person.name.substring(0, 2);
            if (pre.toLowerCase() === 'me') {
                accept('warning', 'Person name should not start with "Me".', { node: person, property: 'name' });
            }
        }
    }


}
