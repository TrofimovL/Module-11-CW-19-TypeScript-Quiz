import {SidebarManager} from "../services/sidebar-manager";
import {CustomHttp} from "../services/custom-http";
import {words} from "./words";
import {CategoriesResponseType} from "../types/categories-response.type";

const $ = require('../modules/jquery-3.6.4.min');

export class Category {
    private readonly page: 'income' | 'expense';

    constructor(page: 'income' | 'expense') {
        this.page = page;

        $('#popup-category-or-operation').text('категорию');


        if (!SidebarManager.exists) {
            new SidebarManager();
            SidebarManager.exists = true;
        }

        if (!SidebarManager.exists) {
            new SidebarManager();
            SidebarManager.exists = true;
        }

        if (page === words.expense) {
            $('h1').text('Расходы');
            $('#income-cards').attr('id', `${words.expense}-cards`);
            $('#popup-income-or-expenses').text('расходы');
        } else {
            $('#popup-income-or-expenses').text('доходы');
        }


        $('#add-category').click(() => {
            location.href = `#/create_category_${page}`;
        });

        this.requests();

    }

    private async requests(): Promise<void> {
        await SidebarManager.setBalance();
        await this.createCards(this.page);
    }

    private async createCards(page: 'income' | 'expense'): Promise<void> {
        let cardsWrapper = (page === words.income ? $('#income-cards') : $('#expense-cards'));

        const that = this;
        await CustomHttp.request(words.b_host + 'categories/' + page, 'GET')
            .then((cardsArray: CategoriesResponseType[]) => {
                try {
                    cardsArray.forEach((item) => {
                        cardsWrapper.prepend(that.cardHtml(item.title, item.id, page));

                        $(`#${page}-${item.id}-edit`).on('click', () => {
                            location.href = `#/create_category_${page}_edit?title=${item.title}&id=${item.id}`;
                        })

                        $(`#${page}-${item.id}-delete`).on('click', () => {
                            $('#category_delete').on('click', () => {
                                this.deleteCard(item.id, page);
                                location.reload();
                            })
                        })
                    })
                } catch (e) {
                    console.log(e);
                }

            })
    }

    private cardHtml(title: string, id: number, page: 'income' | 'expense'): string {
        return `
            <div class="card">
                <div class="card-body">
                    <h2 class="card-title">${title}</h2>
                    <div class="d-flex">
                        <a id="${page}-${id}-edit" class="btn-edit btn btn-primary">Редактировать</a>
                        <a id="${page}-${id}-delete" data-bs-toggle="modal" data-bs-target="#delete_category" class="btn-delete btn btn-danger">Удалить</a>
                    </div>
                </div>
            </div>`
    }

    async deleteCard(id: number, page: 'income' | 'expense') {
        try {
            await CustomHttp.request(`${words.b_host}categories/${page}/${id}`, 'DELETE');
        } catch (e) {
            console.log(e);
        }

    }


}