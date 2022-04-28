class add_near {
    constructor(near_config, wallet_config, ids_cfg) {
        this.near_config = near_config
        this.wallet_config = wallet_config
        this.ids_cfg = ids_cfg
        this.bundle_flag = null
        this.near_api_flag = null
        this.walletAccountObj = null
        this.wallet_connection = null
        var $this = this
        this.addScript('https://cdn.jsdelivr.net/gh/Danail-Irinkov/bufferUMD@master/dist/bundle.min.js', function () {
            $this.bundle_flag = true
            $this.add_near_callback()
        })
        this.addScript('https://cdn.jsdelivr.net/npm/near-api-js@0.41.0/dist/near-api-js.min.js', function () {
            $this.near_api_flag = true
            $this.add_near_callback()
        })
    }
    add_near_callback() {
        if (this.bundle_flag && this.near_api_flag) {
            this.near_start()
        }
    }
    addScript(filepath, callback) {
        if (filepath) {
            var fileref = document.createElement('script')
            fileref.onload = callback
            fileref.setAttribute("type", "text/javascript")
            fileref.setAttribute("src", filepath)
            if (typeof fileref != "undefined")
                document.getElementsByTagName("head")[0].appendChild(fileref)
        }
    }
    wheel(id) {
        document.getElementById(id).innerHTML = '<div><svg  class="near_protocol_rotating" height = "20" xmlns = "http://www.w3.org/2000/svg" viewBox = "0 0 512 512" fill="#ffffff"> <path d="M495.9 166.6C499.2 175.2 496.4 184.9 489.6 191.2L446.3 230.6C447.4 238.9 448 247.4 448 256C448 264.6 447.4 273.1 446.3 281.4L489.6 320.8C496.4 327.1 499.2 336.8 495.9 345.4C491.5 357.3 486.2 368.8 480.2 379.7L475.5 387.8C468.9 398.8 461.5 409.2 453.4 419.1C447.4 426.2 437.7 428.7 428.9 425.9L373.2 408.1C359.8 418.4 344.1 427 329.2 433.6L316.7 490.7C314.7 499.7 307.7 506.1 298.5 508.5C284.7 510.8 270.5 512 255.1 512C241.5 512 227.3 510.8 213.5 508.5C204.3 506.1 197.3 499.7 195.3 490.7L182.8 433.6C167 427 152.2 418.4 138.8 408.1L83.14 425.9C74.3 428.7 64.55 426.2 58.63 419.1C50.52 409.2 43.12 398.8 36.52 387.8L31.84 379.7C25.77 368.8 20.49 357.3 16.06 345.4C12.82 336.8 15.55 327.1 22.41 320.8L65.67 281.4C64.57 273.1 64 264.6 64 256C64 247.4 64.57 238.9 65.67 230.6L22.41 191.2C15.55 184.9 12.82 175.3 16.06 166.6C20.49 154.7 25.78 143.2 31.84 132.3L36.51 124.2C43.12 113.2 50.52 102.8 58.63 92.95C64.55 85.8 74.3 83.32 83.14 86.14L138.8 103.9C152.2 93.56 167 84.96 182.8 78.43L195.3 21.33C197.3 12.25 204.3 5.04 213.5 3.51C227.3 1.201 241.5 0 256 0C270.5 0 284.7 1.201 298.5 3.51C307.7 5.04 314.7 12.25 316.7 21.33L329.2 78.43C344.1 84.96 359.8 93.56 373.2 103.9L428.9 86.14C437.7 83.32 447.4 85.8 453.4 92.95C461.5 102.8 468.9 113.2 475.5 124.2L480.2 132.3C486.2 143.2 491.5 154.7 495.9 166.6V166.6zM256 336C300.2 336 336 300.2 336 255.1C336 211.8 300.2 175.1 256 175.1C211.8 175.1 176 211.8 176 255.1C176 300.2 211.8 336 256 336z" /></svg ></div>'
    }
    getAccountBalance(c) {
        const balance = this.walletAccountObj.getAccountBalance()
        balance.then(value => c(value))
    }
    signIn(wallet_connection) {
        wallet_connection.requestSignIn(
            this.wallet_config.con_name,
            this.wallet_config.app_name,
            this.wallet_config.success_url,
            this.wallet_config.failure_url,
        )
    }
    signOut(wallet_connection) {
        wallet_connection.signOut()
        location.reload()
    }
    if_isSignedIn(wallet_connection) {
        let UserName = document.getElementById(this.ids_cfg.text_username).innerHTML = '<span>Hi, ' + this.walletAccountObj.accountId + '!</span>'
        document.getElementById(this.ids_cfg.btn_signin).style.display = 'none'
        document.getElementById(this.ids_cfg.btn_signout).style.display = 'flex'
        document.getElementById(this.ids_cfg.text_username).style.display = 'flex'
        document.getElementById(this.ids_cfg.btn_signout).addEventListener("click", () => { this.signOut(wallet_connection) })
        this.add_message_listener_event()
    }
    if_isSignedOut(wallet_connection) {
        document.getElementById(this.ids_cfg.btn_signout).style.display = 'none'
        document.getElementById(this.ids_cfg.text_username).style.display = 'none'
        document.getElementById(this.ids_cfg.input_amount).style.display = 'none'
        document.getElementById(this.ids_cfg.input_sender_name).style.display = 'none'
        document.getElementById(this.ids_cfg.input_message_text).style.display = 'none'
        document.getElementById(this.ids_cfg.btn_signin).addEventListener("click", () => { this.signIn(wallet_connection) })
        document.getElementById(this.ids_cfg.btn_donate).addEventListener("click", () => { this.signIn(wallet_connection) })
    }

    sendMoney(amount) {
        this.walletAccountObj.sendMoney(this.wallet_config.con_name, amount + '000000000000000000000000')
    }
    near_start() {
        const $t = this
        if (window) {
            window.global = {}
            window.process = { env: {} }
            window.exports = {}
            window.Buffer = window.BufferUMD.Buffer
        }
        if (typeof this.near_config.keyStore !== 'string') {
            this.near_config.keyStore = new nearApi.keyStores.BrowserLocalStorageKeyStore()
        }
        const nearapi = new nearApi.Near(this.near_config)
        const wallet_connection = new nearApi.WalletConnection(nearapi)
        this.walletAccountObj = wallet_connection.account()
        this.contract = nearapi.loadContract(
            this.walletAccountObj, // the account object that is connecting
            this.wallet_config.con_name,
            {
                // name of contract you're connecting to
                viewMethods: ["getMessages", "getBalance", "getNumberMessages", "getTop"], // view methods do not change state but usually return a value
                changeMethods: ["addMessage"], // change methods modify state
                sender: wallet_connection.getAccountId(), // account object to initialize and sign transactions.
                // sender: this.wallet_config.con_name,
            }
        )
        this.getTop()
        this.getMessages()
        this.getNumberMessages((n) => { document.getElementById(this.ids_cfg.text_number_messages).innerHTML = n })
        this.getBalance((b) => document.getElementById(this.ids_cfg.text_balance).innerHTML = b)


        if (wallet_connection.isSignedIn()) {
            this.if_isSignedIn(wallet_connection)
        } else {
            this.if_isSignedOut(wallet_connection)
        }
    }
    add_message_listener_event() {
        var $t = this
        document.getElementById(this.ids_cfg.btn_donate).addEventListener("click", function () {
            const m = document.getElementById($t.ids_cfg.input_message_text).value
            const g = parseFloat(document.getElementById($t.ids_cfg.input_amount).value)
            if (m != '')
                $t.addMessage(m, g)
        })
    }

    getBalance(c) {
        this.contract.then(con => {
            const m = con.contractId.viewFunction(this.wallet_config.con_name, "getBalance")
            m.then(mm => {
                // 1000000000000000000000000
                const dd = parseInt(mm.substr(0, mm.length - 24) + '.' + mm.substr(mm.length - 24, mm.length - 20))
                c(dd)
            })
        })

    }

    getNumberMessages(c) {
        this.contract.then(con => {
            const m = con.contractId.viewFunction(this.wallet_config.con_name, "getNumberMessages")
            m.then(mm => {
                c(mm)
            })
        })

    }

    getTop(c) {
        // this.contract.then(con => {
        //     const m = con.contractId.viewFunction(this.wallet_config.con_name, "getTop")
        //     m.then(mm => {
        //         let messages_html = ''

        //         let dd = null
        //         if (typeof (mm.datetime) == 'string')
        //             dd = parseInt(mm.datetime.substr(0, 13))
        //         let ddd = new Date(dd).toUTCString()
        //         var spremium = 'not premium'
        //         if (mm.premium) spremium = 'premium'
        //         let amount = ' - '
        //         if (mm.amount != null) {
        //             amount = mm.amount.toString().substr(0, mm.amount.toString().length - 24)
        //         }
        //         messages_html += '<dl><dd><span>' + ddd + '<br />From: ' + mm.name + '<' + mm.sender + '> [' + spremium + ']</span><b><span>' + amount + '</span></b></dd><dt>' + mm.text + '</dt></dl>'
        //         document.getElementById(this.ids_cfg.html_top_messages).innerHTML = '<h2 class="near_protocol_h">The best philanthropists</h2><div class="messages_list">' + messages_html + '</div>'
        //     })
        // })
        this.contract.then(con => {
            const m = con.contractId.viewFunction(this.wallet_config.con_name, "getTop")
            m.then(mm => {
                let messages_html = ''
                for (var i in mm) {
                    let dd = null
                    if (typeof (mm[i].datetime) == 'string')
                        dd = parseInt(mm[i].datetime.substr(0, 13))
                    let ddd = new Date(dd).toUTCString()
                    var spremium = 'not premium'
                    if (mm[i].premium) spremium = 'premium'
                    let amount = ' - '
                    if (mm[i].amount != null) {
                        amount = mm[i].amount.toString().substr(0, mm[i].amount.toString().length - 24)
                    }
                    messages_html += '<dl><dd><span>' + ddd + '<br />From: ' + mm[i].name + '<' + mm[i].sender + '> [' + spremium + ']</span><b>' + amount + '</b></dd><dt>' + mm[i].text + '</dt></dl>'
                }
                document.getElementById(this.ids_cfg.html_top_messages).innerHTML = '<h2 class="near_protocol_h">Last Donates</h2><div class="messages_list">' + messages_html + '</div>'
            })
        })

    }
    getMessages() {
        this.contract.then(con => {
            const m = con.contractId.viewFunction(this.wallet_config.con_name, "getMessages")
            m.then(mm => {
                let messages_html = ''
                for (var i in mm.reverse()) {
                    let dd = null
                    if (typeof (mm[i].datetime) == 'string')
                        dd = parseInt(mm[i].datetime.substr(0, 13))
                    let ddd = new Date(dd).toUTCString()
                    var spremium = 'not premium'
                    if (mm[i].premium) spremium = 'premium'
                    let amount = ' - '
                    if (mm[i].amount != null) {
                        amount = mm[i].amount.toString().substr(0, mm[i].amount.toString().length - 24)
                    }
                    messages_html += '<dl><dd><span>' + ddd + '<br />From: ' + mm[i].name + '<' + mm[i].sender + '> [' + spremium + ']</span><b>' + amount + '</b></dd><dt>' + mm[i].text + '</dt></dl>'
                }
                document.getElementById(this.ids_cfg.html_last_messages).innerHTML = '<h2 class="near_protocol_h">Last Donates</h2><div class="messages_list">' + messages_html + '</div>'
            })
        })
    }

    after_add_message(add_message_form_html) {
        this.getAccountBalance(
            (value) => {
                console.log('balance', value.total)
                let bal = nearApi.utils.format.formatNearAmount(value.total)
                document.getElementById("near_protocol_balance_value").innerHTML = "<b>" + bal + "</b>"//value.total    
            })
        document.getElementById('near_protocol_input_message').innerHTML = add_message_form_html
        this.add_message_listener_event()
        this.getMessages()
    }
    addMessage(message, g) {
        this.contract.then(con => {
            const add_message_your_name = document.getElementById(this.ids_cfg.input_sender_name).value
            if (g > 0) {
                const gg = g.toString() + '000000000000000000000000'
                const m = con.contractId.functionCall(this.wallet_config.con_name, "addMessage", { "text": message, "name": add_message_your_name }, 0, gg)
                m.then(mm => {
                    //this.after_add_message(add_message_form_html)
                })
            }
            else {
                const m = con.contractId.functionCall(this.wallet_config.con_name, "addMessage", { "text": message, "name": add_message_your_name })
                m.then(mm => {
                    this.after_add_message(add_message_form_html)
                })
            }
        })
    }


}
new add_near({
    networkId: "testnet",
    keyStore: false,
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
}, {
    con_name: "avlike.testnet",
    app_name: "Example App",
    success_url: "https://near-donate.carrd.co/#success",
    failure_url: "https://near-donate.carrd.co/#failure",
    // success_url: "https://op.com.ua/near/carrd/#success",
    // failure_url: "https://op.com.ua/near/carrd/#failure",
}, {
    "btn_signin": "near_protocol_signin",
    "btn_signout": "near_protocol_signout",
    "btn_donate": "buttons02",
    "input_amount": "form01-name",
    "input_sender_name": "near_protocol_input_your_name",
    "input_message_text": "near_protocol_input_message_text",
    "text_username": "near_protocol_username",
    "text_number_messages": "text10",
    "text_balance": "text06",
    "html_top_messages": "near_protocol_html_top_messages",
    "html_last_messages": "near_protocol_html_last_messages",
})
