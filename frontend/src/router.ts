import {CreateCategoryInOrEx} from "./components/create-category-in-or-ex";
import {CreateInOrEx} from "./components/create-in-or-ex";
import {Enter} from "./components/enter";
import {Main} from "./components/main";
import {Auth} from "./services/auth";
import {IncomeAndExpenses} from "./components/income-and-expenses";
import {Category} from "./components/category";
import {RouteType} from "./types/route.type";
import {AuthEnum} from "./enums/auth.enum";
import {InExEnum} from "./enums/in-ex.enum";
import {UserInfoEnum} from "./enums/user-info.enum";


export class Router {

    private readonly contentElement: HTMLElement | null;
    private readonly titleElement: HTMLElement | null;

    private routes: RouteType[];

    constructor() {
        this.contentElement = document.getElementById('content');
        this.titleElement = document.getElementById('title-element');

        this.routes = [
            {
                route: '#/login',
                title: 'Вход',
                template: 'templates/enter.html',
                load: () => new Enter(AuthEnum.login)
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/enter.html',
                load: () => new Enter(AuthEnum.signup)
            },
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/main.html',
                load: () => new Main()
            },
            {
                route: '#/income_expenses',
                title: 'Доходы & расходы',
                template: 'templates/income_expenses.html',
                load: () => new IncomeAndExpenses()
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: 'templates/category.html',
                load: () => new Category(InExEnum.income)
            },
            {
                route: '#/expenses',
                title: 'Расходы',
                template: 'templates/category.html',
                load: () => new Category(InExEnum.expense)
            },
            {
                route: '#/create_category_income',
                title: 'Создание категории доходов',
                template: 'templates/category_in_or_ex.html',
                load: () => new CreateCategoryInOrEx(InExEnum.income)
            },
            {
                route: '#/create_category_expense',
                title: 'Создание категории расходов',
                template: 'templates/category_in_or_ex.html',
                load: () => new CreateCategoryInOrEx(InExEnum.expense)
            },
            {
                route: '#/create_category_expense_edit',
                title: 'Редактирование категории расходов',
                template: 'templates/category_in_or_ex.html',
                load: () => new CreateCategoryInOrEx(InExEnum.edit_expense)
            },
            {
                route: '#/create_category_income_edit',
                title: 'Редактирование категории доходов',
                template: 'templates/category_in_or_ex.html',
                load: () => new CreateCategoryInOrEx(InExEnum.edit_income)
            },
            {
                route: '#/create_income',
                title: 'Создание дохода',
                template: 'templates/create_in_or_ex.html',
                load: () => new CreateInOrEx(InExEnum.income)
            },
            {
                route: '#/create_expense',
                title: 'Создание расхода',
                template: 'templates/create_in_or_ex.html',
                load: () => new CreateInOrEx(InExEnum.expense)
            },
            {
                route: '#/create_income_edit',
                title: 'Редактирование дохода',
                template: 'templates/create_in_or_ex.html',
                load: () => new CreateInOrEx(InExEnum.edit_income)
            },
            {
                route: '#/create_expense_edit',
                title: 'Редактирование расхода',
                template: 'templates/create_in_or_ex.html',
                load: () => new CreateInOrEx(InExEnum.edit_expense)
            },
        ]

    }

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];

        if (urlRoute === '#/logout') {
            const result = await Auth.logout();
            localStorage.removeItem(UserInfoEnum.userInfo);
            localStorage.removeItem(UserInfoEnum.userInfo);
            window.location.href = '#/login';
            return;
        }

        const newRoute: RouteType | undefined = this.routes.find(item => {
            return item.route === window.location.hash.split('?')[0];
        });

        if (!newRoute) {
            window.location.href = '#/login';
            return;
        }


        if (this.contentElement) {
            this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        }

        if (this.titleElement) {
            this.titleElement.innerText = newRoute.title;
        }


        newRoute.load();


    }


}


































































































