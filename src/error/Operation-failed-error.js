export class OperationFailedError extends Error {
    constructor(originalErrorMessage) {
        super('Operation failed');
        this.originalErrorMessage = originalErrorMessage;
        this.name = 'OperationFailedError';
    }
}