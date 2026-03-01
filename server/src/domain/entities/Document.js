import { getRowValue } from './entityMapper.js';

/**
 * Document Entity
 * Represents an insurance document linked to a client
 */
export class Document {
    constructor({
        id,
        clientId,
        type,
        company,
        documentNumber,
        startDate,
        endDate,
        status,
        attachmentName,
        notes,
        createdAt = new Date(),
    }) {
        this.id = id;
        this.clientId = clientId;
        this.type = type;
        this.company = company;
        this.documentNumber = documentNumber;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.attachmentName = attachmentName;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    /**
     * Create a Document instance from database row
     */
    static fromDatabase(row) {
        return new Document({
            id: getRowValue(row, ['id']),
            clientId: getRowValue(row, ['clientId', 'clientid', 'client_id']),
            type: getRowValue(row, ['type']),
            company: getRowValue(row, ['company']),
            documentNumber: getRowValue(row, ['documentNumber', 'documentnumber', 'document_number']),
            startDate: getRowValue(row, ['startDate', 'startdate', 'start_date']),
            endDate: getRowValue(row, ['endDate', 'enddate', 'end_date']),
            status: getRowValue(row, ['status']),
            attachmentName: getRowValue(row, ['attachmentName', 'attachmentname', 'attachment_name']),
            notes: getRowValue(row, ['notes']),
            createdAt: getRowValue(row, ['createdAt', 'createdat', 'created_at']),
        });
    }

    /**
     * Convert to plain object for API response
     */
    toJSON() {
        return {
            id: this.id,
            clientId: this.clientId,
            type: this.type,
            company: this.company,
            documentNumber: this.documentNumber,
            startDate: this.startDate,
            endDate: this.endDate,
            status: this.status,
            attachmentName: this.attachmentName,
            notes: this.notes,
            createdAt: this.createdAt,
        };
    }
}
