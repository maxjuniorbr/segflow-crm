export const toDocumentResponse = ({
    id, clientId, type, company, documentNumber, startDate, endDate,
    status, attachmentName, notes, createdAt,
    clientName, clientPersonType, clientCpf, clientCnpj
}) => ({
    id, clientId, type, company, documentNumber, startDate, endDate,
    status, attachmentName, notes, createdAt,
    ...(clientName !== undefined && { clientName, clientPersonType, clientCpf, clientCnpj })
});
