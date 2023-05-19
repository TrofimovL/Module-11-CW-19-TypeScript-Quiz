export type RefreshResponseType = {
    error?: boolean,
    message?: string,
    validation?: any,
    tokens?: {
        accessToken: string,
        refreshToken: string,
    }
}