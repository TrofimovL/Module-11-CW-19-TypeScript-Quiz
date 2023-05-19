import {SidebarManager} from "../services/sidebar-manager";
import {words} from "./words";
import {CustomHttp} from "../services/custom-http";

const $ = require('../modules/jquery-3.6.4.min');

export class CreateCategoryInOrEx {
    //    create income or expense

    private input: JQuery;
    private actionBtn: JQuery;

    constructor(page: 'income' | 'expense' | 'edit_income' | 'edit_expense') {


        this.input = $('#create-in-or-ex-input');
        this.actionBtn = $('#btn-create');
        if (page === words.income || page === words.expense){
            this.actionBtn.addClass(words.btnNoClick);
        }

        this.input.on('change', () => {
            if (this.input.val()) {
                this.actionBtn.removeClass(words.btnNoClick);
            } else {
                this.actionBtn.addClass(words.btnNoClick);
            }
        })

        if (!SidebarManager.exists) {
            new SidebarManager();
            SidebarManager.exists = true;
        }

        $('#btn-go-back').click(() => {
            history.back();
        })

        if (page === words.income) $('h1').text('Создание категории доходов');
        if (page === words.expense) $('h1').text('Создание категории расходов');
        if (page === words.edit_income) $('h1').text('Редактирование категории доходов');
        if (page === words.edit_expense) $('h1').text('Редактирование категории расходов');

        if (page === words.income || page === words.expense) {
            this.actionBtn.on('click',() => {
                if (!this.actionBtn.hasClass(words.btnNoClick)) {
                    const result = this.request(page, '', 'POST', this.input.val() as string);
                    history.back();
                }


            })
        }


        if (page === words.edit_income || page === words.edit_expense) {

            const urlParams = window.location.href
                .split('?')[1]
                .split('&')
                .map(item => {
                    return item.split('=')[1]
                });

            const [title, id] = urlParams;

            this.input.val(title);

            this.actionBtn.text('Сохранить');

            this.actionBtn.on('click',() => {
                this.request(page, `/${id}`, 'PUT', this.input.val() as string);
                history.back();
            })

        }


    }

    private async request(page: string, order: string, method:string, value:string): Promise<void> {
        page = page.replace('edit_', '');
        await CustomHttp.request(words.b_host + 'categories/' + page + order, method, {
            title: value
        })
    }


}