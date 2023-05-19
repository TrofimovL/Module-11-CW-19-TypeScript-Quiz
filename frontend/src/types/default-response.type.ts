export type DefaultResponseType = {
    error: boolean,
    message: string,
    validation?: Array<{
        key: any, // ?
        message: string
    }> | undefined
}