import {Router} from "./router";

class App {
    private router: Router;

    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this))
        window.addEventListener('popstate', this.handleRouteChanging.bind(this))
    }

    handleRouteChanging() {
        this.router.openRoute();
    }
}

(new App());



































































































