export class InvalidInputError extends Error {
    constructor(originalErrorMessage) {
        super('Invalid input');
        this.originalErrorMessage = originalErrorMessage;
        this.name = 'InvalidInputError';
    }
}