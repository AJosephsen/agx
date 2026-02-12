export class AgxParseError extends Error {
    readonly errors: string[];

    constructor(errors: string[]) {
        super(`Parse errors:\n${errors.join('\n')}`);
        this.name = 'AgxParseError';
        this.errors = errors;
    }
}

export interface ValidationIssue {
    message: string;
    line: number;
    column: number;
}

export class AgxValidationError extends Error {
    readonly issues: ValidationIssue[];

    constructor(issues: ValidationIssue[]) {
        super(`Validation errors:\n${issues.map(i => `  line ${i.line}: ${i.message}`).join('\n')}`);
        this.name = 'AgxValidationError';
        this.issues = issues;
    }
}
