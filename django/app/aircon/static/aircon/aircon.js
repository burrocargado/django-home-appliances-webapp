class LabelBtn {
    constructor (el, cb) {
        this.el = el;
        if (typeof cb == 'function') this.el.addEventListener('click', cb);
    }
    get checked () { return this.el.checked; }
    set checked (value) {
        if (value) this.disp_on();
        else this.disp_off();
        this.el.checked = value;
    }
    disp_on () {
        this.el.checked = true;
        this.el.nextElementSibling.classList.remove("btn-outline-secondary");
        this.el.nextElementSibling.classList.add("btn-success");
    }
    disp_off () {
        this.el.checked = false;
        this.el.nextElementSibling.classList.add("btn-outline-secondary");
        this.el.nextElementSibling.classList.remove("btn-success");
    }
    show () {
        this.el.nextElementSibling.classList.remove("d-none");
    }
    remove () {
        this.el.nextElementSibling.classList.add("d-none");
    }
}

class DispElem {
    constructor (el, cb) {
        this.el = el;
        if (typeof cb == 'function') this.el.addEventListener('click', cb);
    }
    disp (html) { this.el.innerHTML = html; }
}

class Status {
    constructor () {
        this.acStatus = {};
        this.powerOnOnly = document.querySelectorAll(".power-on-only");
        this.powerOffRemove = document.querySelectorAll(".power-off-remove");
        this.excFan = document.querySelectorAll(".exclude-in-fanmode");
        this.elSetPowerBtn = document.getElementById("setpowerbtn");
        this.btnVent = new LabelBtn(document.getElementById("btn-vent"));
        this.btnHumid = new LabelBtn(document.getElementById("btn-humid"));
        this.btnSave = new LabelBtn(document.getElementById("btn-save"));
        this.btnClean = new LabelBtn(document.getElementById("btn-clean"));
        this.powerStat = new DispElem(document.getElementById("power"));
        this.tempStat = new DispElem(document.getElementById("settmp"));
        this.modeStat = new DispElem(document.getElementById("mode"));
        this.fanStat = new DispElem(document.getElementById("fanlv"));
    }
    setStatus (d) {
        if (d.vent == "on") {
            this.btnVent.checked = true;
        } else {
            this.btnVent.checked = false;
        }
        if (d.humid == "on") {
            this.btnHumid.checked = true;
            this.btnHumid.show();
        } else if (["heat", "auto heat"].includes(d.mode) && d.power == "on") {
            this.btnHumid.checked = false;
            this.btnHumid.show();
        } else {
            this.btnHumid.remove();
        }
        if (d.save == "on") {
            this.btnSave.checked = true;
        } else {
            this.btnSave.checked = false;
        }
        if (d.clean == "on") {
            this.btnClean.show();
        } else {
            this.btnClean.remove();
        }
        if (d.power == "on") {
            this.powerStat.disp("ON");
            this.elSetPowerBtn.classList.remove("bi-toggle-off");
            this.elSetPowerBtn.classList.add("bi-toggle-on");
            for (let i = 0; i < this.powerOnOnly.length; i++) {
                this.powerOnOnly[i].classList.remove("invisible");
            }
            for (let i = 0; i < this.powerOffRemove.length; i++) {
                this.powerOffRemove[i].classList.remove("d-none");
            }
        } else {
            this.powerStat.disp("OFF");
            this.elSetPowerBtn.classList.remove("bi-toggle-on");
            this.elSetPowerBtn.classList.add("bi-toggle-off");
            for (let i = 0; i < this.powerOnOnly.length; i++) {
                this.powerOnOnly[i].classList.add("invisible");
            }
            for (let i = 0; i < this.powerOffRemove.length; i++) {
                this.powerOffRemove[i].classList.add("d-none");
            }
        }
        if (d.settmp == d.temp) {
            this.tempStat.disp(d.settmp + "° " + '<i class="bi bi-flag"></i>');
        } else {
            this.tempStat.disp(d.settmp + "°");
        }
        switch (d.fanlv) {
            case "low":
                this.fanStat.disp('<i class="bi bi-reception-2"></i> ' + gettext("Low"));
                break;
            case "med":
                this.fanStat.disp('<i class="bi bi-reception-3"></i> ' + gettext("Med"));
                break;
            case "high":
                this.fanStat.disp('<i class="bi bi-reception-4"></i> ' + gettext("High"));
                break;
            case "auto":
                this.fanStat.disp('<i class="bi bi-arrow-repeat"></i> ' + gettext("Atuo"));
                break;
        }
        switch (d.mode) {
            case "cool":
                this.modeStat.disp('<i class="bi bi-snow3" style="color: dodgerblue;"></i> ' + gettext("Cool"));
                break;
            case "heat":
                this.modeStat.disp('<i class="bi bi-sun" style="color: salmon;"></i> ' + gettext("Heat"));
                break;
            case "dry":
                this.modeStat.disp('<i class="bi bi-droplet-half" style="color: dodgerblue;"></i> ' + gettext("Dry"));
                break;
            case "auto cool":
                this.modeStat.disp('<i class="bi bi-arrow-repeat" style="color: dodgerblue;"></i> ' + gettext("Cool"));
                break;
            case "auto heat":
                this.modeStat.disp('<i class="bi bi-arrow-repeat" style="color: salmon;"></i> ' + gettext("Heat"));
                break;
            case "fan":
                this.modeStat.disp('<i class="bi bi-fan" style="color: silver;"></i> ' + gettext("Fan"));
                break;
        }
        if (d.mode == "fan") {
            for (let i = 0; i < this.excFan.length; i++) {
                this.excFan[i].classList.add("d-none");
            }
        } else {
            for (let i = 0; i < this.excFan.length; i++) {
                this.excFan[i].classList.remove("d-none");
            }
        }
    }
}

class Update {
    constructor (parent) {
        this.parent = parent;
        this.elPwr = document.getElementById("pwrlv1");
        this.elFilt = document.getElementById("filter_time");
        this.elTa = document.getElementById("sens_ta");
        this.elTc = document.getElementById("sens_tc");
        this.elTcj = document.getElementById("sens_tcj");
        this.elTo = document.getElementById("sens_to");
        this.elTe = document.getElementById("sens_te");
        this.elTd = document.getElementById("sens_td");
        this.elTs = document.getElementById("sens_ts");
        this.elThs = document.getElementById("sens_ths");
        this.elCurr = document.getElementById("sens_current");
    }
    setUpdate (d) {
        this.elPwr.textContent = d.pwrlv1;
        if (this.parent.acStatus.filter == "on") {
            this.elFilt.innerHTML = 
                '<i class="bi bi-exclamation-triangle" style="color: red;"></i>' + 
                d.filter_time + ngettext(" hour", " hours", d.filter_time);
        } else {
            this.elFilt.innerHTML = 
                d.filter_time + ngettext(" hour", " hours", d.filter_time);
        }
        this.elTa.textContent = d.sens_ta + "°";
        this.elTc.textContent = d.sens_tc + "°";
        this.elTcj.textContent = d.sens_tcj + "°";
        this.elTo.textContent = d.sens_to + "°";
        this.elTe.textContent = d.sens_te + "°";
        this.elTd.textContent = d.sens_td + "°";
        this.elTs.textContent = d.sens_ts + "°";
        this.elThs.textContent = d.sens_ths + "°";
        this.elCurr.textContent = d.sens_current / 10 + "A";
    }
}

class SystemStatus {
    constructor () {
        this.nodeStatus = {"bridge": "alive", "processor": "ready"};
        this.elLoading = document.getElementById("id-loading");
        this.elOffline = document.getElementById("id-offline");
        this.elProcstart = document.getElementById("id-procstart");
        this.elProcdown = document.getElementById("id-procdown");
        this.elContents = document.getElementById("id-contents");
    }
    setWebsocket (sw) {
        if (sw) this.hide(this.elLoading);
        else this.show(this.elLoading);
    }
    setBridge (d) {
        this.nodeStatus.bridge = d.connection;
        this.render();
    }
    setProcessor (d) {
        this.nodeStatus.processor = d.state;
        this.render();
    }
    show (el) {
        el.classList.remove("d-none");
        el.classList.remove("invisible")
    }
    remove (el) { el.classList.add("d-none"); }
    hide (el) { el.classList.add("invisible"); }
    render () {
        if (this.nodeStatus.bridge == "dead") {
            this.show(this.elOffline);
            this.remove(this.elProcstart);
            this.remove(this.elContents);
            if (this.nodeStatus.processor == "offline") {
                this.show(this.elProcdown);
            } else {
                this.remove(this.elProcdown);
            }
        } else if (this.nodeStatus.bridge == "alive") {
            this.remove(this.elOffline);
            if (this.nodeStatus.processor == "offline") {
                this.show(this.elProcdown);
                this.remove(this.elProcstart);
                this.remove(this.elContents);
            } else if (this.nodeStatus.processor == "start") {
                this.remove(this.elProcdown);
                this.show(this.elProcstart);
                this.remove(this.elContents);
            } else if (this.nodeStatus.processor == "ready") {
                this.remove(this.elProcdown);
                this.remove(this.elProcstart);
                this.show(this.elContents);
            }
        }
    }
}

class ControlPanel{
    constructor (wsUrl) {
        this.wsUrl = wsUrl;
        this.systemStatus = new SystemStatus();
        this.status = new Status();
        this.update = new Update(this);
        this.acStatus = {};
        this.settmp = 0;
        this.elPowerModalMessage = document.getElementById("setpowermsg");
        this.elSetTmpVal = document.getElementById("settmpval");
        this.elSetFanLv = document.getElementById("id_form-setfan");
        this.elSetMode = document.getElementById("id_form-setmode");
        this.btnHumid = new LabelBtn(
            document.getElementById("btn-humid"),
            (e) => { this.humidCallback(e); }
        );
        this.btnSave = new LabelBtn(
            document.getElementById("btn-save"),
            (e) => { this.saveCallback(e); }
        );
        document.getElementById("setpowerbtn").addEventListener('click', () => { this.setPowerModal(); });
        document.getElementById("setpowerexec").addEventListener('click', () => { this.setPower(); });
        document.getElementById("settmpbtn").addEventListener('click', () => { this.setTempModal(); });
        document.getElementById("settmpdown").addEventListener('click', () => { this.setTempDown(); });
        document.getElementById("settmpup").addEventListener('click', () => { this.setTempUp(); });
        document.getElementById("settmpexec").addEventListener('click', () => { this.setTemp(); });
        document.getElementById("setfanbtn").addEventListener('click', () => { this.setFanModal(); });
        document.getElementById("setfanexec").addEventListener('click', () => { this.setFan(); });
        document.getElementById("setmodebtn").addEventListener('click', () => { this.setModeModal(); });
        document.getElementById("setmodeexec").addEventListener('click', () => { this.setMode(); });
        
        this.connect();
    }
    setPowerModal () {
        if (this.acStatus.power == "off") {
            this.elPowerModalMessage.textContent = gettext("Power ON");
        } else {
            this.elPowerModalMessage.textContent = gettext("Power OFF");
        }
    }
    setPower () {
        if (this.acStatus.power == "off") {
            this.socket.send(JSON.stringify({set_power: "1"}));
        } else {
            this.socket.send(JSON.stringify({set_power: "0"}));
        }
    }
    setTempModal () {
        this.settmp = this.acStatus.settmp;
        this.elSetTmpVal.textContent = this.settmp;
    }
    setTempDown () {
        if ( this.settmp > 18 ) {
            this.settmp -= 1;
            this.elSetTmpVal.textContent = this.settmp;
        }
    }
    setTempUp () {
        if ( this.settmp < 29 ) {
            this.settmp += 1;
            this.elSetTmpVal.textContent = this.settmp;
        }
    }
    setTemp () {
        this.socket.send(JSON.stringify({set_temp: this.settmp}));
    }
    setFanModal () {
        let options = this.elSetFanLv.options;
        switch (this.acStatus.fanlv) {
            case "high":
                options[0].selected = true;
                break;
            case "med":
                options[1].selected = true;
                break;
            case "low":
                options[2].selected = true;
                break;
            case "auto":
                options[3].selected = true;
                break;
        }
    }
    setFan () {
        let value = this.elSetFanLv.value;
        this.socket.send(
            JSON.stringify({set_fan: value})
        );
    }
    setModeModal () {
        let options = this.elSetMode.options;
        switch (this.acStatus.mode) {
            case "auto cool":
            case "auto heat":
                options[0].selected = true;
                break;
            case "heat":
                options[1].selected = true;
                break;
            case "dry":
                options[2].selected = true;
                break;
            case "cool":
                options[3].selected = true;
                break;
            case "fan":
                options[4].selected = true;
                break;
        }
    }
    setMode () {
        this.socket.send(
            JSON.stringify({set_mode: this.elSetMode.value})
        );
    }
    connect () {
        console.log('ws connecting');
        this.socket = new WebSocket(this.wsUrl);
        this.socket.onopen = () => { this.onSocketOpen(); };
        this.socket.onclose = () => { this.onSocketClose(); };
        this.socket.onerror = () => { this.onSocketError(); };
        this.socket.onmessage = (e) => { this.onSocketMessage(e); };
    }
    onSocketClose () {
        // connection closed, discard old websocket and create a new one in 5s
        this.systemStatus.setWebsocket(false);
        this.socket = null;
        console.log('ws reconnect in 5 sec');
        setTimeout(() => { this.connect(); }, 5000);
    }
    onSocketOpen () {
        console.log("ws connected");
        this.systemStatus.setWebsocket(true);
    }
    onSocketMessage (e) {
        let data = JSON.parse(e.data);
        if ('status' in data.message) {
            this.acStatus = data.message.status;
            this.status.setStatus(data.message.status);
        }
        if ('update' in data.message) {
            this.update.setUpdate(data.message.update);
        }
        if ('bridge' in data.message) {
            this.systemStatus.setBridge(data.message.bridge);
        }
        if ('processor' in data.message) {
            this.systemStatus.setProcessor(data.message.processor);
        }
    }
    onSocketError () {
        this.socket.close();
    }
    humidCallback (e) {
        let value;
        e.currentTarget.blur(); 
        if (e.currentTarget.checked) {
            value = "1";
        } else {
            value = "0";
        }
        this.socket.send(
            JSON.stringify({set_humid: value})
        );
    }
    saveCallback (e) {
        let value;
        e.currentTarget.blur(); 
        if (e.currentTarget.checked) {
            value = "S";
        } else {
            value = "R";
        }
        this.socket.send(
            JSON.stringify({set_save: value})
        );
    }
}
