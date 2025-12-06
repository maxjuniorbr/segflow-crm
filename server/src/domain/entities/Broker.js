/**
 * Broker Entity
 * Represents an insurance broker/corretora
 */
export class Broker {
    constructor({
        id,
        corporateName,
        tradeName,
        cnpj,
        susepCode,
        contactName,
        email,
        phone,
        mobile,
        createdAt = new Date()
    }) {
        this.id = id;
        this.corporateName = corporateName;
        this.tradeName = tradeName;
        this.cnpj = cnpj;
        this.susepCode = susepCode;
        this.contactName = contactName;
        this.email = email;
        this.phone = phone;
        this.mobile = mobile;
        this.createdAt = createdAt;
    }

    static fromDatabase(row) {
        return new Broker({
            id: row.id,
            corporateName: row.corporatename || row.corporateName,
            tradeName: row.tradename || row.tradeName,
            cnpj: row.cnpj,
            susepCode: row.susepcode || row.susepCode,
            contactName: row.contactname || row.contactName,
            email: row.email,
            phone: row.phone,
            mobile: row.mobile,
            createdAt: row.createdat || row.createdAt
        });
    }

    toJSON() {
        return {
            id: this.id,
            corporateName: this.corporateName,
            tradeName: this.tradeName,
            cnpj: this.cnpj,
            susepCode: this.susepCode,
            contactName: this.contactName,
            email: this.email,
            phone: this.phone,
            mobile: this.mobile,
            createdAt: this.createdAt
        };
    }
}
