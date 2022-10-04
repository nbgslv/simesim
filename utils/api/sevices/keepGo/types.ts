type Line = {
    iccid: string,
    productId: string,
    deactivationDate: string,
    expiredAt: string,
    allowedUsageKb: number,
    remainingUsageKb: number,
    remainingDays: number,
    status: number,
    bundle: string,
    notes: string,
    dataBundles?: [DataBundle]
}

type Pagination = {
    from: number,
    to: number,
    lastPage: number,
    perPage: number,
    total: number,
    currentPage: number,
}

enum BundleStatus {
    NON_ACTIVE = 0,
    ACTIVE = 1,
    FINISHED = 2,
    EXPIRED = 3,
}

type Bundle = {
    id: number,
    typeId: number,
    name: string,
    description: string,
    coverage: [string],
    refills: [Refill],
}

type DataBundle = {
    id: number,
    status: BundleStatus,
    allowedUsageKb: number,
    activeKb: number,
    remainingUsageKb: number,
    validity: number,
    assignedAt: string,
    activatedAt?: string,
    terminatedAt?: string,
    expireAt: string,
}

type FilterData = {
    statusId: [string],
    autoRefillsStatusId: [string],
}

type CreateLine = {
    iccid: string,
    qrCode: string,
    lpaCode: string,
}

type LineDetails = Omit<Line, 'expiredAt'> & {
    msisdn: string,
    autoRefillTurnedOn: number,
    autoRefillAmountMb: string,
    autoRefillPrice: number,
    autoRefillCurrency: string,
    autoRefillList: [Refill],
}

type Refill = {
    title: string,
    amountMb: number,
    amountDays: number,
    priceUsd: number,
    priceEur: number
}

type Transaction = {
    createdAt: string,
    status: string,
    amount: string,
    currency: string,
    type: string,
    invoiceHash: string,
    refillAmountMb: number,
    reason: string,
    productId: string,
}

type Transactions = {
    transaction: {
        data: [Transaction]
    },
}

export type KeepGoResponse = unknown | Partial<Pagination> & {
    ack: string,
    sim_cards?: [Line]
    filters?: [FilterData]
    sim_card?: [LineDetails] | CreateLine
    available_refills?: [Refill]
    transactions?: Transactions
    products_types?: [string]
    bundles?: [Bundle]
    bundle: [Bundle]
    network_providers?: [string]
    countries?: [string]
    regions?: [string]
    data: [string]
}
