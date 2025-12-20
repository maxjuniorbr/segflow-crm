import { getRowValue } from './entityMapper.js';

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
            id: getRowValue(row, ['id']),
            corporateName: getRowValue(row, ['corporateName', 'corporatename', 'corporate_name']),
            tradeName: getRowValue(row, ['tradeName', 'tradename', 'trade_name']),
            cnpj: getRowValue(row, ['cnpj']),
            susepCode: getRowValue(row, ['susepCode', 'susepcode', 'susep_code']),
            contactName: getRowValue(row, ['contactName', 'contactname', 'contact_name']),
            email: getRowValue(row, ['email']),
            phone: getRowValue(row, ['phone']),
            mobile: getRowValue(row, ['mobile']),
            createdAt: getRowValue(row, ['createdAt', 'createdat', 'created_at'])
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
