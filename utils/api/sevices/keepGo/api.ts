import {KeepGoResponse} from "./types";
import {getErrorMessage} from "../../errorsHandeling";
import {ErrorWithMessage} from "../../types";

export default class KeepGoApi {
    private readonly baseUrl: string
    private readonly apiKey: string
    private readonly accessToken: string
    private readonly authHeaders: Record<string, string>

    constructor(baseUrl: string | undefined, apiKey: string | undefined, accessToken: string | undefined) {
        if (!baseUrl || !apiKey || !accessToken) {
            throw new Error('Missing required parameters')
        }
        this.baseUrl = baseUrl
        this.apiKey = apiKey
        this.accessToken = accessToken
        this.authHeaders = {
            apiKey: this.apiKey,
            accessToken: this.accessToken
        }
    }

    public async getLines(page: number = 1, perPage: number = 25): Promise<KeepGoResponse | Error> {
        try {
            const params: Record<string, string> = {
                page: page.toString(),
                per_page: perPage.toString()
            }
            const response = await fetch(`${this.baseUrl}/lines?${new URLSearchParams(params)}`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return await response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getFilters(): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/lines/filter_data`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getLineDetails(id: string): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/line/${id}/get_details`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getAvailableRefills(id: string): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/line/${id}/available_refills`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getTransactions(id: string): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/line/${id}/transactions`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async createLine(data: { refillMb: number, refillDays: number, bundleId: number }): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/line/create`, {
                method: 'POST',
                headers: {
                    ...this.authHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refill_mb: data.refillMb,
                    refill_days: data.refillDays,
                    bundle_id: data.bundleId
                })
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async refillLine(id: string, data: { amountMb: number, amountDays: number }): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/line/${id}/refill`, {
                method: 'POST',
                headers: {
                    ...this.authHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount_mb: data.amountMb,
                    amount_days: data.amountDays
                })
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async updateNotes(id: string, notes: string): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/line/${id}/update_notes`, {
                method: 'PUT',
                headers: {
                    ...this.authHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notes
                })
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async updateDeactivationDate(id: string, deactivationDate: string): Promise<KeepGoResponse | Error> {
        try {
            // deactivationDate format: YYYY-MM-DD
            // TODO: validate date format
            const response = await fetch(`${this.baseUrl}/line/${id}/deactivation_date`, {
                method: 'PUT',
                headers: {
                    ...this.authHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deactivation_date: deactivationDate
                })
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getProductTypes(): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/product_types`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getBundles(): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/bundles`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getBundle(id: number): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/bundle/${id}`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getTransactionsByDateRange(sortField: string, sortOrder: string, commonFilter: string): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/transactions?sort_field=${sortField}&sort_order=${sortOrder}&common_filter=${commonFilter}`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getNetworkProviders(): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/network_providers`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getCountries(): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/countries`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getRegions(): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/regions`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

    public async getEsimDevices(): Promise<KeepGoResponse | Error> {
        try {
            const response = await fetch(`${this.baseUrl}/esim_enabled_devices`, {
                headers: {
                    ...this.authHeaders
                }
            })
            return response.json()
        } catch (error) {
            return getErrorMessage(error)
        }
    }

}
