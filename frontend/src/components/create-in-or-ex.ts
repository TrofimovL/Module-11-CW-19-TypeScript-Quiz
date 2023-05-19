import {SidebarManager} from "../services/sidebar-manager";
import {CustomHttp} from "../services/custom-http";
import {DefaultResponseType} from "../types/default-response.type";
import {CategoriesResponseType} from "../types/categories-response.type";
import {InExEnum} from "../enums/in-ex.enum";
import {ConfigEnum} from "../enums/config.enum";

const $ = require('../modules/jquery-3.6.4.min');

export class CreateInOrEx {

    private readonly page: 'income' | 'expense' | 'edit_income' | 'edit_expense';
    private readonly pageWithoutEdit: string;

    private type: JQuery;
    private id: string = '';
    private category: JQuery;
    private categoryId: number | null = null;
    private sum: JQuery;
    private date: JQuery;
    private comment: JQuery;
    private cardTitles: string[] | null = null;
    private actionBtn: JQuery;
    private readonly method: string | undefined;

    readonly btnNoClick: string = 'btn-no-click';



    constructor(page: InExEnum.income | InExEnum.expense | InExEnum.edit_income | InExEnum.edit_expense) {

        if (!SidebarManager.exists) {
            new SidebarManager();
            SidebarManager.exists = true;
        }

        if (page === InExEnum.income) $('h1').text('Создание дохода');
        if (page === InExEnum.expense) $('h1').text('Создание расхода');
        if (page === InExEnum.edit_income) $('h1').text('Редактирование дохода');
        if (page === InExEnum.edit_expense) $('h1').text('Редактирование расхода');


        this.page = page;
        this.pageWithoutEdit = this.page.replace('edit_', '');

        this.type = $('#create-in-or-ex-type');
        this.type.val(this.pageWithoutEdit);
        this.type.prop('disabled', true);

        this.category = $('#create-in-or-ex-category');

        this.sum = $('#create-in-or-ex-sum');
        this.date = $('#create-in-or-ex-date');
        this.comment = $('#create-in-or-ex-comment');
        this.actionBtn = $('#btn-create');


        if (this.page === InExEnum.edit_income || this.page === InExEnum.edit_expense) {
            const urlParams = window.location.href
                .split('?')[1]
                .split('&')
                .map(item => {
                    return item.split('=')[1]
                });
            const [id, category, amount, date, comment] = urlParams;

            this.id = id;
            if(this.id) this.id = '/' + this.id
            this.category.val(category);
            this.sum.val(amount);
            this.date.val(date);
            this.comment.val(comment);
            this.actionBtn.text('Сохранить');

            this.method = 'PUT';

        } else {
            this.actionBtn.addClass(this.btnNoClick);
            this.method = 'POST';
        }


        $('#btn-go-back').click(() => {
            window.location.href = '#/income_expenses'
        });


        // this.cards.call(this).then(result => {
        this.cards().then(result => {
            if ((result as DefaultResponseType).error !== undefined) return;

            this.cardTitles = (result as CategoriesResponseType[]).map(item => {
                return item.title;
            })
        })

        this.actionBtn.on('click', () => {
            if (this.validateFields()) {
                this.create().then(()=>{
                    window.location.href = '#/income_expenses';
                });
            }
        });

        this.category.on('change', () => this.validateFields());
        this.sum.on('change', () => this.validateFields());
        this.date.on('change', () => this.validateFields());
        this.comment.on('change', () => this.validateFields());

    }

    private validateFields(): boolean {
        let isValid = true;

        if (!this.cardTitles) {
            this.actionBtn.addClass(this.btnNoClick);
            return false;
        }

        let match = this.cardTitles.some(item => item.toLowerCase() === (this.category.val()! as string).toLowerCase());
        let errorMessage = $('#show-category-error');
        if (!match) {
            if (!errorMessage.length) {
                this.showCategoryError();
            }
            isValid = false;
        } else {
            if (errorMessage.length) {
                errorMessage.remove();
                this.category.css('border-color', '#CED4DA');
            }
        }

        if (!this.sum.val()) isValid = false;

        if (!this.date.val()) isValid = false;

        if (!this.comment.val()) isValid = false;

        if (isValid) {
            this.actionBtn.removeClass(this.btnNoClick);
        } else {
            this.actionBtn.addClass(this.btnNoClick);
        }

        return isValid;

    }


    private showCategoryError(): void {
        this.category.after(
            `<div id="show-category-error" style='color: red; padding-bottom: 10px;'>Указанной категории нет</div>`
        );
        this.category.css('border-color', 'red');
    }

    private async create(): Promise<void> {
        try {
            this.getCategoryId().then((value: number | undefined) => {
                if (value !== undefined) {
                    this.categoryId = value

                    this.addInOrEx();
                }


            })
        } catch (e) {
            console.log(e)
        }


    }

    private async addInOrEx(): Promise<void> {
        const body = {
            "type": this.pageWithoutEdit,
            "amount": Number(this.sum.val()),
            "date": this.date.val(),
            "comment": this.comment.val(),
            "category_id": this.categoryId,
        }

        await CustomHttp.request(ConfigEnum.backendHost + 'operations' + this.id, this.method, body)
            .then(value => {
                console.log(`addInOrEx ${value}`);
            })
    }


    private async getCategoryId(): Promise<number | undefined> {
        let categoryName: CategoriesResponseType | undefined = undefined;
        let categoryId: number | undefined = undefined;
        try {
            await CustomHttp.request(ConfigEnum.backendHost + 'categories/' + this.pageWithoutEdit, 'GET')
                .then((array: CategoriesResponseType[]) => {
                    categoryName = array.find(item => {
                        if (item.title.toLowerCase() === (this.category.val() as string).toLowerCase()) {
                            categoryId = item.id;
                            return true;
                        }

                    })
                })
        } catch (e) {
            console.log(e)
        }
        return categoryId;
    }

    private async cards(): Promise<DefaultResponseType | CategoriesResponseType[]> {
        return await CustomHttp.request(ConfigEnum.backendHost + 'categories/' + this.pageWithoutEdit, 'GET')
    }
}

