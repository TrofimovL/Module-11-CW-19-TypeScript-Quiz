import {SidebarManager} from "../services/sidebar-manager";
import {TimeIntervals} from "../services/time-intervals";
import {OperationsPeriodResponseType} from "../types/operations-period-response.type";
import {words} from "./words";
import {MainCirclesEnum} from "../enums/main-circles.enum";

const $ = require('../modules/jquery-3.6.4.min');

export class Main {
    constructor() {
        if (!localStorage.accessToken) {
            window.location.href = '#/login';
        }

        if (!SidebarManager.exists) {
            new SidebarManager();
            SidebarManager.exists = true;
        }

        if (!TimeIntervals.exists) {
            new TimeIntervals();
            TimeIntervals.exists = true;
        }

        this.request();
    }

    private async request(): Promise<void> {
        await SidebarManager.setBalance();

        await TimeIntervals.getOperations().then((array: OperationsPeriodResponseType[] | undefined) => {
            if (array) {
                Main.initialize(array);
            }
        })

        await TimeIntervals.createTimeIntervals();
    }

    private static createArray(myArray: OperationsPeriodResponseType[]): OperationsPeriodResponseType[] {
        let known_category: string[] = [];
        return myArray.filter((item, index, array) => {
            if (!known_category.includes(item.category)) {
                known_category.push(item.category);
                let amount = 0;

                array.forEach((localItem) => {
                    if (localItem.category === item.category) {
                        amount += localItem.amount;
                    }
                })
                return {
                    category: item.category,
                    amount: amount
                }

            }
        })
    }

    public static initialize(array: OperationsPeriodResponseType[]): void {

        let denote_income: HTMLElement | null = document.getElementById('main-denote-income');
        let denote_expense: HTMLElement | null = document.getElementById('main-denote-expense');

        let context_income: CanvasRenderingContext2D | null = null;
        let context_expense: CanvasRenderingContext2D | null = null;

        const context_income_elem: HTMLCanvasElement | undefined = document.getElementById('canvas-income') as HTMLCanvasElement;
        if (context_income_elem) {
            context_income = context_income_elem.getContext('2d');
        }

        const context_expense_elem: HTMLCanvasElement | undefined = document.getElementById('canvas-expense') as HTMLCanvasElement;
        if (context_expense_elem) {
            context_expense = context_expense_elem.getContext('2d');
        }

        if (!denote_income || !denote_expense || !context_income || !context_expense) return;

        let array_income_raw: OperationsPeriodResponseType[] = [];
        let array_expense_raw: OperationsPeriodResponseType[] = [];

        array.forEach((item: OperationsPeriodResponseType) => {
            if (item.type === words.income) {
                array_income_raw.push(item);
            } else if (item.type === words.expense) {
                array_expense_raw.push(item);
            }
        })

        let array_income: OperationsPeriodResponseType[] = this.createArray(array_income_raw);
        let array_expense: OperationsPeriodResponseType[] = this.createArray(array_expense_raw);

        $('h5').remove('h5');

        array_income.length !== 0 ? initSuccess('income') : initNotSuccess('income');
        array_expense.length !== 0 ? initSuccess('expense') : initNotSuccess('expense');

        function initSuccess(key: 'income' | 'expense'): void {
            context_income_elem!.style.display = 'block';
            denote_income!.style.display = 'block';
            if (key === 'income') Main.drawCircle(array_income, context_income as CanvasRenderingContext2D, "income")
            if (key === 'expense') Main.drawCircle(array_expense, context_expense as CanvasRenderingContext2D, "expense")
        }

        function initNotSuccess(key: 'income' | 'expense'): void {
            // context_income_elem!.style.display = 'none';
            // denote_income!.style.display = 'none';
            const title = $(`#main-${key} h2`);
            title.after(`<h5>Здесь будут отображены ваши ${title.text()}</h5>`)
        }
    }


    static drawCircle(array: OperationsPeriodResponseType[], context: CanvasRenderingContext2D, page: 'income' | 'expense') {
        const radius = MainCirclesEnum.radius;

        let sum_income: number = 0;
        array.forEach(item => sum_income += item.amount);

        let angles: number[] = []
        array.forEach((item) => {
            angles.push(item.amount / sum_income * 2 * Math.PI);
            item.color = Main.randomColor();
        })

        let html = '';
        array.forEach(item => {
            html += `<div style="background-color: ${item.color};"></div>
                     <span>${item.category}</span>`
        });
        $(`#main-denote-${page}`).html(html);


        let start_angle: number = 0;
        array.forEach((item, index, array) => {
            if (item.color) {
                context.fillStyle = item.color;
            }

            context.beginPath(); // circle sector
            context.arc(radius, radius, radius, -start_angle, -start_angle - angles[index], true);
            context.fill();

            start_angle += angles[index];
        })

        start_angle = 0;
        array.forEach((item, index, array) => {
            if(item.color){
                context.fillStyle = item.color;
            }

            if (angles[index] < Math.PI) {
                context.beginPath(); // triangle
                // Сделано (radius+2), чтобы не было пробелов между частями сектора.
                // Поэтому есть выход за границы круга. Надо замаскировать это дополнительным кругом
                context.moveTo(radius, radius);
                context.lineTo(radius + (radius + 2) * Math.cos(start_angle), radius - (radius + 2) * Math.sin(start_angle))
                context.lineTo(radius + (radius + 2) * Math.cos(start_angle + angles[index]), radius - (radius + 2) * Math.sin(start_angle + angles[index]))
                context.fill();
            }

            if (array.length !== 1) {
                context.beginPath(); // border line
                context.moveTo(radius, radius);
                context.lineTo(radius + radius * Math.cos(start_angle), radius - radius * Math.sin(start_angle))
                context.lineWidth = 4;
                context.strokeStyle = 'white';
                context.stroke();

                context.beginPath(); // somehow 1st line is thinner
                context.moveTo(radius, radius);
                context.lineTo(radius + radius * Math.cos(start_angle + angles[index]), radius - radius * Math.sin(start_angle + angles[index]))
                context.lineWidth = 4;
                context.strokeStyle = 'white';
                context.stroke();
            }

            start_angle += angles[index];
        })

        // Маскировка выходов за границы
        context.beginPath();
        context.arc(radius, radius, radius, 0, 2 * Math.PI);
        context.lineWidth = 5;
        context.strokeStyle = 'white';
        context.stroke();
    }

    static randomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }


}