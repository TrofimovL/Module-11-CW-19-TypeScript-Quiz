export type OperationsPeriodResponseType = {
    id: number,
    type: string,
    category: string,
    amount: number,
    date: string,
    comment: string,
    color?: string, // рисование кругов в main, drawCircle
}