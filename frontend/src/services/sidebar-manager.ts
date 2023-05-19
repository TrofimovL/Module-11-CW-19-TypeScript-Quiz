import {CustomHttp} from "./custom-http";
import {ConfigEnum} from "../enums/config.enum";
const $ = require('../modules/jquery-3.6.4.min');

export class SidebarManager {

    public static exists: boolean = false;
    readonly categories: JQuery;
    private balance: JQuery;
    private userName: JQuery;


    constructor() {

        this.categories = $('#categories');
        if (this.categories) {
            this.categories.on('click', () => {
                if (this.categories.parent().attr('opened') === 'true') {
                    $('.expanded').hide();
                    this.categories.parent().attr('opened', 'false');
                } else {
                    $('.expanded').show();
                    this.categories.parent().attr('opened', 'true');
                }

            })
        }


        $('#home')?.click(() => window.location.href = '#/main');
        $('#income_expenses')?.click(() => window.location.href = '#/income_expenses');
        $('#income')?.parent()?.click(() => window.location.href = '#/income');
        $('#expenses')?.parent()?.click(() => window.location.href = '#/expenses');
        $('#logout')?.click(() => {
            window.location.href = '#/logout';
        });

        this.balance = $('#balance span');

        this.userName = $('#person-name');
        if (localStorage.userInfo) {
            this.userName.text(JSON.parse(localStorage.userInfo).fullName);
        }
    }

    public static async setBalance(): Promise<boolean> {
        try {
            const result = await CustomHttp.request(ConfigEnum.backendHost + 'balance');
            $('#money').text(result.balance);
            return true;
        } catch (e) {
            console.log(e)
        }
        return false;
    }


}













































































































