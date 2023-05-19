import {CustomHttp} from "../services/custom-http";
import {words} from "./words";
import {Auth} from "../services/auth";
import {SidebarManager} from "../services/sidebar-manager";
import {EnterFieldType} from "../types/enter-field.type";
import {DefaultResponseType} from "../types/default-response.type";
import {SignupResponseType} from "../types/signup-response.type";
import {LoginResponseType} from "../types/login-response.type";

const $ = require('../modules/jquery-3.6.4.min');

export class Enter {
    static authError = false;

    private readonly page: 'login' | 'signup';
    private title: JQuery;
    private formDetails: JQuery;
    private name: JQuery | undefined = undefined;
    readonly email: JQuery;
    readonly password: JQuery;
    private repeatPassword: JQuery | undefined = undefined;
    private rememberMe: JQuery;
    private divChange: JQuery;
    private formProcess: JQuery;
    private sidebar: JQuery;
    private fields: EnterFieldType[];

    constructor(page: 'login' | 'signup') {
        this.page = page;
        this.title = $('#title-enter');
        this.formDetails = $('#form-details');
        this.email = $('#input-email');
        this.password = $('#input-password');
        this.rememberMe = $('#form-remember-me');
        this.divChange = $('#enter-change-type');
        this.formProcess = $('#form-process');
        this.sidebar = $('#sidebar');

        if (localStorage.userInfo) {
            location.href = '#/';
        } else {
            this.sidebar.hide();
            // SidebarManager.exists = false;
        }


        this.fields = [{
            name: words.email,
            id: words.email,
            element: this.email,
            regex: /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i,
            valid: true,
            message: 'Неверная почта'
        }, {
            name: words.password,
            id: words.password,
            element: this.password,
            regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/,
            valid: true,
            message: 'Пароль должен содержать минимум 6 символов, содержать цифры, спецсимволы и буквы в верхнем и нижнем регистрах'
        }];


        if (this.page === 'signup') {
            if (!this.changePage()) {
                throw new Error('changePage Error');
            }
        }

        this.formDetails.on('change', () => {
            if (!this.fields.some(item => {
                return !((item.element.val() as string).trim())
            })) {
                if (this.validateFields()) {
                    $('.error-message').remove();
                    this.formProcess.removeAttr('disabled');
                }
            } else {
                this.formProcess.attr('disabled', 'disabled');
            }
        })


        this.formProcess.on('click', () => {
            this.enter();
        })

    }

    private changePage(): boolean {
        this.title.text("Создайте аккаунт");

        this.formDetails.prepend(`
                    <div class=\"form-group\">
                        <label class=\"form-icon\" for=\"input-name\">
                            <svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
                                <path d=\"M8 8C9.06087 8 10.0783 7.57857 10.8284 6.82843C11.5786 6.07828 12 5.06087 12 4C12 2.93913 11.5786 1.92172 10.8284 1.17157C10.0783 0.421427 9.06087 0 8 0C6.93913 0 5.92172 0.421427 5.17157 1.17157C4.42143 1.92172 4 2.93913 4 4C4 5.06087 4.42143 6.07828 5.17157 6.82843C5.92172 7.57857 6.93913 8 8 8ZM10.6667 4C10.6667 4.70724 10.3857 5.38552 9.88562 5.88562C9.38552 6.38572 8.70724 6.66667 8 6.66667C7.29276 6.66667 6.61448 6.38572 6.11438 5.88562C5.61428 5.38552 5.33333 4.70724 5.33333 4C5.33333 3.29276 5.61428 2.61448 6.11438 2.11438C6.61448 1.61428 7.29276 1.33333 8 1.33333C8.70724 1.33333 9.38552 1.61428 9.88562 2.11438C10.3857 2.61448 10.6667 3.29276 10.6667 4ZM16 14.6667C16 16 14.6667 16 14.6667 16H1.33333C1.33333 16 0 16 0 14.6667C0 13.3333 1.33333 9.33333 8 9.33333C14.6667 9.33333 16 13.3333 16 14.6667ZM14.6667 14.6613C14.6653 14.3333 14.4613 13.3467 13.5573 12.4427C12.688 11.5733 11.052 10.6667 8 10.6667C4.94667 10.6667 3.312 11.5733 2.44267 12.4427C1.53867 13.3467 1.336 14.3333 1.33333 14.6613H14.6667Z\" fill=\"#6C757D\"/>
                            </svg>
                        </label>
                        <input id=\"input-name\" type=\"text\" placeholder=\"ФИО\">
                    </div>`);


        this.name = $('#input-name');
        if (!this.name) return false;

        $(`<div class="form-group">
                <label class="form-icon" for="input-password-repeat">
                    <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.4 0C4.1944 0 2.4 1.7944 2.4 4V6.4H1.6C0.7176 6.4 0 7.1176 0 8V14.4C0 15.2824 0.7176 16 1.6 16H11.2C12.0824 16 12.8 15.2824 12.8 14.4V8C12.8 7.1176 12.0824 6.4 11.2 6.4H10.4V4C10.4 1.7944 8.6056 0 6.4 0ZM11.2 8L11.2016 14.4H1.6V8H11.2ZM4 6.4V4C4 2.6768 5.0768 1.6 6.4 1.6C7.7232 1.6 8.8 2.6768 8.8 4V6.4H4Z" fill="#6C757D"/>
                    </svg>
                </label>
                <input id="input-password-repeat" type="password" placeholder="Подтверждение пароля">
            </div>`)
            .insertBefore($('#form-remember-me'));

        this.repeatPassword = $('#input-password-repeat');
        if (!this.repeatPassword) return false;

        this.rememberMe.hide();

        this.divChange.html('Уже есть аккаунт?\n' + '            <a id="button-change-type" href="#/login">\n' + '                Войдите в систему\n' + '            </a>')

        this.fields.unshift({
            name: words.name,
            id: words.name,
            element: this.name,
            regex: /^[А-Я][а-яё]{2,}\s*[А-Я][а-яё]{2,}\s*[А-Я]{0,1}[а-яё]*$/,
            valid: true,
            message: 'Поле "ФИО" должно содержать как минимум фамилию и имя. Они должны начинаться с заглавной буквы и состоять минимум из 3 символов.'
        });

        this.fields.push({
            name: words.passwordConfirm,
            id: words.passwordConfirm,
            element: this.repeatPassword,
            regex: /\s*/,
            valid: true,
            message: 'Пароли не совпадают'
        });

        return true;
    }

    validateFields() {
        let isValid = true;
        const that = this;
        this.fields.forEach((item) => {

            let condition = !item.regex.test((item.element.val() as string).trim());
            if (item.name === words.passwordConfirm) {
                condition = that.password.val() !== item.element.val();
            }

            if (item.valid && condition) {
                item.element.prev().css('border-color', 'red');
                item.element.parent().after(`<div class="error-message">${item.message}</div>`);
                item.valid = false;
                isValid = false;

            } else if (!item.valid && !condition) {
                item.element.prev().css('border-color', '#CED4DA');
                item.element.parent().next().remove();
                item.valid = true;
            }

        })

        return isValid;
    }

    async enter() {
        if (this.validateFields()) {
            if (this.page === words.signup) {
                try {
                    const nameData = (this.name!.val() as string).split(' ');
                    const result: DefaultResponseType | SignupResponseType = await CustomHttp.request(words.b_host + words.signup, 'POST', {
                        name: nameData[1],
                        lastName: nameData[0],
                        email: this.email.val(),
                        password: this.password.val(),
                        passwordRepeat: this.repeatPassword!.val()
                    });

                    if (result) {
                        if ((result as DefaultResponseType).error || !(result as SignupResponseType).user) {
                            console.log(`result error ${(result as DefaultResponseType).message}`);
                        }
                    }
                } catch (e) {
                    console.log(e)
                }
            }


            try {
                const result: DefaultResponseType| LoginResponseType = await CustomHttp.request(words.b_host + words.login, 'POST', {
                    email: this.email.val(),
                    password: this.password.val(),
                    rememberMe: this.rememberMe.prop('checked')
                })

                console.log(result)

                if (result) {
                    if (!(result as LoginResponseType).tokens.accessToken || !(result as LoginResponseType).tokens.refreshToken
                        || !(result as LoginResponseType).user.name || !(result as LoginResponseType).user.lastName || !(result as LoginResponseType).user.id) {
                        throw new Error('LoginResponseType Error')
                    }
                    if ((result as DefaultResponseType).error){
                        throw new Error((result as DefaultResponseType).message)
                    }

                    Auth.setTokens((result as LoginResponseType).tokens.accessToken, (result as LoginResponseType).tokens.refreshToken);
                    Auth.setUserInfo({
                        fullName: `${(result as LoginResponseType).user.name} ${(result as LoginResponseType).user.lastName}`,
                        userId: (result as LoginResponseType).user.id,
                        email: this.email.val()!.toString(),
                    })

                    this.sidebar.show();
                    if (!SidebarManager.exists) {
                        new SidebarManager();
                        SidebarManager.exists = true;
                    }
                    Enter.authError = false;
                    location.href = '#/';

                }


            } catch (error) {
                console.log(error)
            }


        }

    }

    static async showError(error: DefaultResponseType) {
        this.authError = true;
        $('#form-remember-me').before("<div style='color: red'>" + error.message + "</div>")
    }


}
























































































