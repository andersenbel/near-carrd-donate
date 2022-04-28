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
                viewMethods: ["getDonates", "getDonateBalance", "getNumberPhilanthropists", "getTopPhilanthropists"], // view methods do not change state but usually return a value
                changeMethods: ["addDonate"], // change methods modify state
                sender: wallet_connection.getAccountId(), // account object to initialize and sign transactions.
                // sender: this.wallet_config.con_name,
            }
        )
        this.getTopPhilanthropists()
        this.getDonates()
        this.getNumberPhilanthropists((n) => { document.getElementById(this.ids_cfg.text_number_messages).innerHTML = n })
        this.getDonateBalance((b) => document.getElementById(this.ids_cfg.text_balance).innerHTML = b)
        if (wallet_connection.isSignedIn()) {
            this.if_isSignedIn(wallet_connection)
        } else {
            this.if_isSignedOut(wallet_connection)
        }
    }
    if_isSignedIn(wallet_connection) {
        let UserName = document.getElementById(this.ids_cfg.text_username).innerHTML = '<span>Hi, ' + this.walletAccountObj.accountId + '!</span>'
        document.getElementById(this.ids_cfg.btn_signin).style.display = 'none'
        document.getElementById(this.ids_cfg.btn_signout).style.display = 'flex'
        document.getElementById(this.ids_cfg.text_username).style.display = 'flex'
        document.getElementById(this.ids_cfg.btn_signout).addEventListener("click", () => { this.signOut(wallet_connection) })
        this.add_donate_listener_event()
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
    add_donate_listener_event() {
        var $t = this
        document.getElementById(this.ids_cfg.btn_donate).addEventListener("click", function () {
            const m = document.getElementById($t.ids_cfg.input_message_text).value
            const g = parseFloat(document.getElementById($t.ids_cfg.input_amount).value)
            if (m != '')
                $t.addDonate(m, g)
        })
    }

    getDonateBalance(c) {
        this.contract.then(con => {
            const m = con.contractId.viewFunction(this.wallet_config.con_name, "getDonateBalance")
            m.then(mm => {
                const dd = parseInt(mm.substr(0, mm.length - 24) + '.' + mm.substr(mm.length - 24, mm.length - 20))
                c(dd)
            })
        })

    }
    getNumberPhilanthropists(c) {
        this.contract.then(con => {
            const m = con.contractId.viewFunction(this.wallet_config.con_name, "getNumberPhilanthropists")
            m.then(mm => {
                c(mm)
            })
        })

    }

    getTopPhilanthropists(c) {
        this.contract.then(con => {
            const m = con.contractId.viewFunction(this.wallet_config.con_name, "getTopPhilanthropists")
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
                document.getElementById(this.ids_cfg.html_top_messages).innerHTML = '<h2 class="near_protocol_h">Top philanthropists</h2><div class="messages_list">' + messages_html + '</div>'
            })
        })

    }
    getDonates() {
        this.contract.then(con => {
            const m = con.contractId.viewFunction(this.wallet_config.con_name, "getDonates")
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
    addDonate(message, g) {
        this.contract.then(con => {
            const add_message_your_name = document.getElementById(this.ids_cfg.input_sender_name).value
            if (g > 0) {
                const gg = g.toString() + '000000000000000000000000'
                const m = con.contractId.functionCall(this.wallet_config.con_name, "addDonate", { "text": message, "name": add_message_your_name }, 0, gg)
                m.then(mm => { })
            }
            else {
                const m = con.contractId.functionCall(this.wallet_config.con_name, "addDonate", { "text": message, "name": add_message_your_name })
                m.then(mm => { })
            }
        })
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
}