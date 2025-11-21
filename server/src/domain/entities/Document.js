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
            id: row.id,
            clientId: row.clientid || row.clientId,
            type: row.type,
            company: row.company,
            documentNumber: row.documentnumber || row.documentNumber,
            startDate: row.startdate || row.startDate,
            endDate: row.enddate || row.endDate,
            status: row.status,
            attachmentName: row.attachmentname || row.attachmentName,
            notes: row.notes,
            createdAt: row.created_at || row.createdAt,
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
