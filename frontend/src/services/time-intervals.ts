import {ConfigEnum} from "../enums/config.enum";
import {CustomHttp} from "./custom-http";
import {IncomeAndExpenses} from "../components/income-and-expenses";
import {Main} from "../components/main";
import {OperationsPeriodResponseType} from "../types/operations-period-response.type";

const $ = require('../modules/jquery-3.6.4.min');


export class TimeIntervals {
    public static exists: boolean = false;

    private timeFromDate: JQuery;
    private timeBeforeDate: JQuery;
    private static timeFromInput: JQuery = $('#time-from');
    private static timeBeforeInput: JQuery = $('#time-before');

    private static page: string;

    constructor() {
        this.timeFromDate = $('#time-from-date');
        this.timeBeforeDate = $('#time-before-date');

        const from = TimeIntervals.timeFromInput;
        const before = TimeIntervals.timeBeforeInput;

        from.on('click', () => {
            const val: string | number | string[] | undefined = from.val();

            if ((val as string)) {
                this.timeFromDate.text((val as string));
                before.attr("min", (val as string));
            } else {
                this.timeFromDate.text("Дата");
                before.attr("min", "");
            }
        });

        before.on('click', () => {
            const val: string | number | string[] | undefined = before.val();

            if ((val as string)) {
                this.timeBeforeDate.text((val as string));
                from.attr("max", (val as string));
            } else {
                this.timeBeforeDate.text("Дата");
                from.attr("max", "");
            }

        });
    }

    public static createTimeIntervals() {
        this.page = location.href.split('#/')[1];

        const now: Date = new Date();

        // start of this day
        const today: Date = new Date(new Date((new Date).setUTCHours(0, 0, 0, 0)));
        $('#today').click(() => {
            $('.time-chosen').removeClass('time-chosen');
            $('#today').addClass('time-chosen');
            this.setTimeFilter(today);
        })

        // start of this week
        const week: Date = new Date(now.setDate(now.getDate() - now.getDay()));
        $('#week').click(() => {
            $('.time-chosen').removeClass('time-chosen');
            $('#week').addClass('time-chosen');
            this.setTimeFilter(week);
        })

        // start of this month
        const month: Date = new Date(now.getFullYear(), now.getMonth(), 1);
        $('#month').click(() => {
            $('.time-chosen').removeClass('time-chosen');
            $('#month').addClass('time-chosen');
            this.setTimeFilter(month);
        })

        // start of this year
        const year: Date = new Date(now.getFullYear(), 0, 1);
        $('#year').click(() => {
            $('.time-chosen').removeClass('time-chosen');
            $('#year').addClass('time-chosen');
            this.setTimeFilter(year);
        })

        $('#all').click(() => {
            $('.time-chosen').removeClass('time-chosen');
            $('#all').addClass('time-chosen');
            this.getOperations('all')
                .then(value => {
                    if (value){
                        if (this.page === '') {
                            this.getOperations().then((array) => {
                                if(array){
                                    Main.initialize(array);
                                }
                            })
                        } else {
                            IncomeAndExpenses.showOperations(value);
                        }
                    }
                });
        })


        const timeInput = (): void => {
            $('.time-chosen').removeClass('time-chosen');
            $('#interval').addClass('time-chosen');
            if (this.timeFromInput.val() && this.timeBeforeInput.val()) return this.setTimeFilter((this.timeFromInput.val() as string), (this.timeBeforeInput.val() as string));
        }
        this.timeFromInput.on('click', timeInput);
        this.timeBeforeInput.on('click', timeInput);
    }


    private static formatDate(inputDate: Date): string {
        const date: Date = new Date(inputDate);
        let day: string = date.getDate().toString();
        let month: string = (date.getMonth() + 1).toString();

        if (+day < 10) day = '0' + day;

        if (+month < 10) month = '0' + month;

        return `${date.getFullYear()}-${month}-${day}`
    }

    private static setTimeFilter(start: Date | string, finish: string = ''): void {
        let str = `interval`;

        if (typeof start === 'object') {
            str += `&dateFrom=${this.formatDate(start)}`;
        } else {
            str += `&dateFrom=${start}`;
        }

        if (finish) {
            str += `&dateTo=${finish}`;
        } else {
            str += `&dateTo=${this.formatDate(new Date())}`;

            $('#time-before-date').text('Дата');
            $('#time-from-date').text('Дата');
        }

        this.getOperations(str).then(array => {
            if (array){
                if (this.page === '') {
                    Main.initialize(array);
                } else {
                    IncomeAndExpenses.showOperations(array);
                }
            }
        });
    }

    public static async getOperations(filter: string = 'all'): Promise<OperationsPeriodResponseType[] | undefined> {
        try {
            return await CustomHttp.request(ConfigEnum.backendHost + 'operations?period=' + filter, 'GET')
        } catch (e) {
            console.log(e)
        }
    }

    public static async deleteOperation(id: number): Promise<void> {
        try {
            await CustomHttp.request(`${ConfigEnum.backendHost}operations/${id}`, 'DELETE');
        } catch (e) {
            console.log(e);
        }
    }


}




















