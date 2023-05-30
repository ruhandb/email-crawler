export default {
    sites:{
        empresas: {
            url: "https://guiaempresas.universia.pt/freguesia/",
            waitSelector: ".ranking_einf", 
            selector: "table.ranking_einf td.textleft a"
        },
        google: {
            url:"https://www.google.com/search?q=",
            waitSelector: "div.yuRUbf", 
            selector: "div.yuRUbf a"
        }
    },
    blackList: [
        "geral@iberinform.pt",
        "clientes@einforma.pt",
        "info+quantcast@webdados.pt",
        "605a7baede844d278b89dc95ae0a9123@sentry-next.wixpress.com",
        "login@login.com",
        "Contact@goodlayers.com"
    ],
    notEndWith: [
        ".jpg",
        ".png",
        ".jpeg"
    ]
};