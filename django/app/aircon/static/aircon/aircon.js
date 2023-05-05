let acStatus;
let nodeStatus = {"bridge": "alive", "processor": "ready"};
let settmp;
const setPowerBtn = document.getElementById("setpowerbtn");
const settmpBtn = document.getElementById("settmpbtn");
const settmpDownBtn = document.getElementById("settmpdown");
const settmpUpBtn = document.getElementById("settmpup");
const settmpExecBtn = document.getElementById("settmpexec");
const setfanBtn = document.getElementById("setfanbtn");
const setfanExecBtn = document.getElementById("setfanexec");
const setmodeBtn = document.getElementById("setmodebtn");
const setmodeExecBtn = document.getElementById("setmodeexec");
const setpowerExecBtn = document.getElementById("setpowerexec");
const powerOnOnly = document.querySelectorAll(".power-on-only");
const powerOffRemove = document.querySelectorAll(".power-off-remove");
const excFan = document.querySelectorAll(".exclude-in-fanmode");
const btnVent = document.getElementById("btn-vent");
const btnHumid = document.getElementById("btn-humid");
const btnSave = document.getElementById("btn-save");
const btnClean = document.getElementById("btn-clean");

let socket;

const connect = function () {
    socket = new WebSocket("wss://" + window.location.host + wsUrl);
    socket.onmessage = function (e) {
        var data = JSON.parse(e.data);
        if ('status' in data.message){
            var d = data.message.status;
            acStatus = d;
            if (d.vent == "on") {
                btnVent.checked = true;
                btnVent.nextElementSibling.classList.remove("btn-outline-secondary");
                btnVent.nextElementSibling.classList.add("btn-success");
            } else {
                btnVent.checked = false;
                btnVent.nextElementSibling.classList.remove("btn-success");
                btnVent.nextElementSibling.classList.add("btn-outline-secondary");
            }
            if (d.humid == "on") {
                btnHumid.checked = true;
                btnHumid.nextElementSibling.classList.remove("btn-outline-secondary");
                btnHumid.nextElementSibling.classList.add("btn-success");
                btnHumid.nextElementSibling.classList.remove("d-none");
            } else if (["heat", "auto heat"].includes(d.mode) && d.power == "on") {
                btnHumid.checked = false;
                btnHumid.nextElementSibling.classList.remove("btn-success");
                btnHumid.nextElementSibling.classList.add("btn-outline-secondary");
                btnHumid.nextElementSibling.classList.remove("d-none");
            } else {
                btnHumid.nextElementSibling.classList.add("d-none");
            }
            if (d.save == "on") {
                btnSave.checked = true;
                btnSave.nextElementSibling.classList.remove("btn-outline-secondary");
                btnSave.nextElementSibling.classList.add("btn-success");
            } else {
                btnSave.checked = false;
                btnSave.nextElementSibling.classList.remove("btn-success");
                btnSave.nextElementSibling.classList.add("btn-outline-secondary");
            }
            if (d.clean == "on") {
                btnClean.nextElementSibling.classList.remove("d-none")
            } else {
                btnClean.nextElementSibling.classList.add("d-none")
            }
            if (d.power == "on") {
                document.getElementById("power").innerHTML = 'ON';
                document.getElementById("setpowermsg").innerHTML = gettext("Power OFF");
                setPowerBtn.classList.remove("bi-toggle-off");
                setPowerBtn.classList.add("bi-toggle-on");
                for (let i = 0; i < powerOnOnly.length; i++) {
                    powerOnOnly[i].classList.remove("invisible");
                }
                for (let i = 0; i < powerOffRemove.length; i++) {
                    powerOffRemove[i].classList.remove("d-none");
                }
            } else {
                document.getElementById("power").innerHTML = 'OFF';
                document.getElementById("setpowermsg").innerHTML = gettext("Power ON");
                setPowerBtn.classList.remove("bi-toggle-on");
                setPowerBtn.classList.add("bi-toggle-off");
                for (let i = 0; i < powerOnOnly.length; i++) {
                    powerOnOnly[i].classList.add("invisible");
                }
                for (let i = 0; i < powerOffRemove.length; i++) {
                    powerOffRemove[i].classList.add("d-none");
                }
            }
            if (d.settmp == d.temp) {
                document.getElementById("settmp").innerHTML = d.settmp + "° " + '<i class="bi bi-flag"></i>';
            } else {
                document.getElementById("settmp").innerHTML = d.settmp + "°";
            }
            if (d.fanlv == "low") {
                document.getElementById("fanlv").innerHTML = '<i class="bi bi-reception-2"></i> ' + gettext("Low");
            } else if (d.fanlv == "med") {
                document.getElementById("fanlv").innerHTML = '<i class="bi bi-reception-3"></i> ' + gettext("Med");
            } else if (d.fanlv == "high") {
                document.getElementById("fanlv").innerHTML = '<i class="bi bi-reception-4"></i> ' + gettext("High");
            } else if (d.fanlv == "auto") {
                document.getElementById("fanlv").innerHTML = '<i class="bi bi-arrow-repeat"></i> ' + gettext("Atuo");
            }            
            if (d.mode == "cool") {
                document.getElementById("mode").innerHTML = '<i class="bi bi-snow3" style="color: dodgerblue;"></i> ' + gettext("Cool");
            } else if (d.mode == "heat") {
                document.getElementById("mode").innerHTML = '<i class="bi bi-sun" style="color: salmon;"></i> ' + gettext("Heat");
            } else if (d.mode == "dry") {
                document.getElementById("mode").innerHTML = '<i class="bi bi-droplet-half" style="color: dodgerblue;"></i> ' + gettext("Dry");
            } else if (d.mode == "auto cool") {
                document.getElementById("mode").innerHTML = '<i class="bi bi-arrow-repeat" style="color: dodgerblue;"></i> ' + gettext("Cool");
            } else if (d.mode == "auto heat") {
                document.getElementById("mode").innerHTML = '<i class="bi bi-arrow-repeat" style="color: salmon;"></i> ' + gettext("Heat");
            } else if (d.mode == "fan") {
                document.getElementById("mode").innerHTML = '<i class="bi bi-fan" style="color: silver;"></i> ' + gettext("Fan");
            }
            if (d.mode == "fan") {
                for (let i = 0; i < excFan.length; i++) {
                    excFan[i].classList.add("d-none");
                }
            } else {
                for (let i = 0; i < excFan.length; i++) {
                    excFan[i].classList.remove("d-none");
                }
            }
        } else if ('update' in data.message){
            var d = data.message.update;
            document.getElementById("pwrlv1").textContent = d.pwrlv1;
            if (acStatus.filter == "on") {
                document.getElementById("filter_time").innerHTML = '<i class="bi bi-exclamation-triangle" style="color: red;"></i>' + d.filter_time + ngettext(" hour", " hours", d.filter_time);
            } else {
                document.getElementById("filter_time").innerHTML = d.filter_time + ngettext(" hour", " hours", d.filter_time);
            }
            document.getElementById("sens_ta").textContent = d.sens_ta + "°";
            document.getElementById("sens_tc").textContent = d.sens_tc + "°";
            document.getElementById("sens_tcj").textContent = d.sens_tcj + "°";
            document.getElementById("sens_to").textContent = d.sens_to + "°";
            document.getElementById("sens_te").textContent = d.sens_te + "°";
            document.getElementById("sens_td").textContent = d.sens_td + "°";
            document.getElementById("sens_ts").textContent = d.sens_ts + "°";
            document.getElementById("sens_ths").textContent = d.sens_ths + "°";
            document.getElementById("sens_current").textContent = d.sens_current/10  + "A";
        } else if ('bridge' in data.message) {
            var d = data.message.bridge;
            if (d.connection == "alive") {
                nodeStatus.bridge = "alive";
            } else if (d.connection == "dead") {
                nodeStatus.bridge = "dead";
            }
        } else if ('processor' in data.message) {
            var d = data.message.processor;
            if (d.state == "start") {
                nodeStatus.processor = "start";
            } else if (d.state == "ready") {
                nodeStatus.processor = "ready";
            } else if (d.state == "offline") {
                nodeStatus.processor = "offline";
            }
        }
        if ('processor' in data.message || 'bridge' in data.message) {
            if (nodeStatus.bridge == "dead") {
                document.getElementById("id-offline").classList.remove("d-none");
                document.getElementById("id-procstart").classList.add("d-none");
                document.getElementById("id-contents").classList.add("d-none");
                if (nodeStatus.processor == "offline") {
                    document.getElementById("id-procdown").classList.remove("d-none");
                } else {
                    document.getElementById("id-procdown").classList.add("d-none");
                }
            } else if (nodeStatus.bridge == "alive") {
                document.getElementById("id-offline").classList.add("d-none");
                if (nodeStatus.processor == "offline") {
                    document.getElementById("id-procdown").classList.remove("d-none");
                    document.getElementById("id-procstart").classList.add("d-none");
                    document.getElementById("id-contents").classList.add("d-none");
                } else if (nodeStatus.processor == "start") {
                    document.getElementById("id-procdown").classList.add("d-none");
                    document.getElementById("id-procstart").classList.remove("d-none");
                    document.getElementById("id-contents").classList.add("d-none");
                } else if (nodeStatus.processor == "ready") {
                    document.getElementById("id-procdown").classList.add("d-none");
                    document.getElementById("id-procstart").classList.add("d-none");
                    document.getElementById("id-contents").classList.remove("d-none");
                }    
            }
        }
    }
    socket.onclose = function(){
        // connection closed, discard old websocket and create a new one in 5s
        document.getElementById("id-loading").classList.remove("invisible");
        document.getElementById("id-offline").classList.add("d-none");
        socket = null;
        setTimeout(connect, 5000);
    }
    socket.onopen = function(){
        document.getElementById("id-loading").classList.add("invisible");
    }
};

setpowerExecBtn.addEventListener('click', function () {
    if (acStatus.power == "off") {
        socket.send(JSON.stringify({set_power: "1"}));
    } else {
        socket.send(JSON.stringify({set_power: "0"}));
    }
});

settmpBtn.addEventListener('click', function () {
        settmp = acStatus.settmp;
        document.getElementById("settmpval").textContent = settmp;
});

settmpDownBtn.addEventListener('click', function () {
    if (settmp>18) {
        settmp -= 1;
        document.getElementById("settmpval").textContent = settmp;
    }
});

settmpUpBtn.addEventListener('click', function () {
    if (settmp<29) {
        settmp += 1;
        document.getElementById("settmpval").textContent = settmp;
    }
});

settmpExecBtn.addEventListener('click', function () {
    socket.send(JSON.stringify({set_temp: settmp}));
});

setfanBtn.addEventListener('click', function () {
        let options = document.getElementById("id_form-setfan").options;
        switch (acStatus.fanlv) {
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
});

setfanExecBtn.addEventListener('click', function () {
    let value = document.getElementById("id_form-setfan").value;
    socket.send(
        JSON.stringify({set_fan: value})
    );
});

setmodeBtn.addEventListener('click', function () {
        let options = document.getElementById("id_form-setmode").options;
        switch (acStatus.mode) {
            case "auto":
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
});

setmodeExecBtn.addEventListener('click', function () {
    socket.send(
        JSON.stringify({set_mode: document.getElementById("id_form-setmode").value})
    );
});

btnHumid.addEventListener('click', function () {
    let value;
    if (btnHumid.checked) {
        value = "1";
    } else {
        value = "0";
    }
    socket.send(
        JSON.stringify({set_humid: value})
    );
});

btnSave.addEventListener('click', function () {
    let value;
    if (btnSave.checked) {
        value = "S";
    } else {
        value = "R";
    }
    socket.send(
        JSON.stringify({set_save: value})
    );
});

connect();
