import {SidebarManager} from "../services/sidebar-manager";
import {CustomHttp} from "../services/custom-http";
import {InExEnum} from "../enums/in-ex.enum";
import {ConfigEnum} from "../enums/config.enum";

const $ = require('../modules/jquery-3.6.4.min');

export class CreateCategoryInOrEx {
    //    create income or expense

    private input: JQuery;
    private actionBtn: JQuery;
    readonly btnNoClick: string = 'btn-no-click';

    constructor(page: InExEnum.income | InExEnum.expense | InExEnum.edit_income | InExEnum.edit_expense) {

        this.input = $('#create-in-or-ex-input');
        this.actionBtn = $('#btn-create');
        if (page === InExEnum.income || page === InExEnum.expense){
            this.actionBtn.addClass(this.btnNoClick);
        }

        this.input.on('change', () => {
            if (this.input.val()) {
                this.actionBtn.removeClass(this.btnNoClick);
            } else {
                this.actionBtn.addClass(this.btnNoClick);
            }
        })

        if (!SidebarManager.exists) {
            new SidebarManager();
            SidebarManager.exists = true;
        }

        $('#btn-go-back').click(() => {
            history.back();
        })

        if (page === InExEnum.income) $('h1').text('Создание категории доходов');
        if (page === InExEnum.expense) $('h1').text('Создание категории расходов');
        if (page === InExEnum.edit_income) $('h1').text('Редактирование категории доходов');
        if (page === InExEnum.edit_expense) $('h1').text('Редактирование категории расходов');

        if (page === InExEnum.income || page === InExEnum.expense) {
            this.actionBtn.on('click',() => {
                if (!this.actionBtn.hasClass(this.btnNoClick)) {
                    const result = this.request(page, '', 'POST', this.input.val() as string);
                    history.back();
                }


            })
        }


        if (page === InExEnum.edit_income || page === InExEnum.edit_expense) {

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
        await CustomHttp.request(ConfigEnum.backendHost + 'categories/' + page + order, method, {
            title: value
        })
    }


}