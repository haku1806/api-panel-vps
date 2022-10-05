var host = "http://localhost:1812/api";
var list_type_boot_description = ['xem trạng thái', 'bật', 'khởi động lại', 'tắt']
var list_type_boot = ['status', 'start', 'restart', 'stop']

async function check_live_account() {
    var api = $('#api').val()

    // Format input
    if (validate_api(api) == false) {
        noti(1, "Invalid API!");
    } else {
        console.log("OK")
        save_data();

        url = `${host}/bonecloud/auth?api=${api}`;
        // url = host + `/bonecloud?auth=${api}`;
        // console.log(url);
        headers = {
            "Accept": "application/json",
        }

        params = {}
        var requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow',
        };
        console.log(requestOptions)
        change_status_btn();
        noti(0, 'Loading VPS. Please wait a moment!');
        fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    noti(1, `HTTP error: ${response.status}`);
                    reset_status_btn();
                    throw new Error(`HTTP error: ${response.status}`);
                }

                return response.json();
            })
            .then(result => {
                console.log(result);
                if (result.success) {
                    // console.log(result.data);
                    load_data_vps(result.data.list_vps);
                    $("#total_vps").text(result.data.total_vps);
                    noti(0, result.message);
                } else {
                    console.log(result.message);
                    noti(1, result.message);
                }
            })
            .catch(error => {
                console.log('error', error)
                noti(1, error);
            })
            .finally(() => {
                reset_status_btn();
            });
    }
}

async function boot_vps(id, type_boot) {
    var api = $('#api').val()

    // Format input
    if (validate_api(api) == false) {
        noti(1, "Invalid API!");
    } else {
        console.log("OK")
        save_data();

        url = `${host}/bonecloud/vps/${list_type_boot[type_boot]}/${id}?api=${api}`;
        // url = host + `/bonecloud?auth=${api}`;
        headers = {
            "Accept": "application/json",
        }

        params = {}
        var requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow',
        };
        console.log(requestOptions)
        fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    noti(1, `HTTP error: ${response.status}`);
                    reset_status_btn();
                    throw new Error(`HTTP error: ${response.status}`);
                }

                return response.json();
            })
            .then(result => {
                console.log(result);
                if (result.success) {
                    noti(0, result.message);
                } else {
                    console.log(result.message);
                    noti(1, result.message);
                }
            })
            .catch(error => {
                console.log('error', error)
                noti(1, error);
            })
            .finally(() => {
            });
    }
}

async function boot_vps_status(id, type_boot) {
    var api = $('#api').val()

    // Format input
    if (validate_api(api) == false) {
        noti(1, "Invalid API!");
    } else {
        console.log("OK")
        save_data();

        url = `${host}/bonecloud/vps/${list_type_boot[type_boot]}/${id}?api=${api}`;
        // url = host + `/bonecloud?auth=${api}`;
        headers = {
            "Accept": "application/json",
        }

        params = {}
        var requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow',
        };
        console.log(requestOptions)
        fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    noti(1, `HTTP error: ${response.status}`);
                    reset_status_btn();
                    throw new Error(`HTTP error: ${response.status}`);
                }

                return response.json();
            })
            .then(result => {
                // console.log(result);
                $('#status_' + id).text(result.data.VMStatus);
            })
            .catch(error => {
                console.log('error', error)
                noti(1, error);
            })
            .finally(() => {
            });
    }
}

function read_mail_detail(id) {
    $('#message_' + message_id).hide();
    $('#message_' + id).show();
    message_id = id;
    console.log(message_id);
    document.querySelector('.message-content').scrollIntoView({ behavior: 'smooth' });
}


function load_data_vps(data) {
    $("tbody").empty();

    let stt = 0;
    data.forEach(element => {
        $("tbody").append(`
            <tr data-id="${element.id}"> \
                <td><input type="checkbox" class="checkbox_vps"></td> \
                <td>${++stt}</td> \
                <td id="ip_${element.id}">${element.ip}</td> \
                <td>${element.country_code} (${element.state_code})</td> \
                <td>${element.end_date}</td> \
                <td>${element.os_type} (${element.os_version})</td> \
                <td id="status_${element.id}">Running</td> \
                <td>
                    <div class="btn-group">
                        <button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Hành động
                        </button>
                    <div class="dropdown-menu">
                        <a class="dropdown-item action_vps" href="#" onclick="confirmNotify(1, $(this).closest('[data-id]').data('id'), 1);">Bật VPS</a> 
                        <a class="dropdown-item" href="#" onclick="confirmNotify(1, '${element.id}', 2)">Khởi động lại VPS</a>
                        <a class="dropdown-item" href="#" onclick="confirmNotify(1, '${element.id}', 3)">Tắt VPS</a>
                    </div>
                </td>
            </tr>`
            );

        boot_vps_status(element.id, 0);
    });
    $("#spinner").hide();
}

function run_list_boot_vps(choice, id, type_boot_description) {
    /* 
        choice: 
        - 0: all vps checked
        - 1: 1 vps
        id: id 1 vps checked
        type_boot_description
    */

    // All VPS
    if (choice == 0) {
        // Get all vps checked
        let list_vps = $('input[class=checkbox_vps]:checkbox:checked');
        if (list_vps.length == 0) {
            noti(1, "Vui lòng chọn ít nhất 1 VPS để thao tác")
        } else {
            for (let i = 0; i < list_vps.length; i++) {
                element_id = list_vps[0].closest('[data-id]').getAttribute('data-id');
                boot_vps(element_id, type_boot_description);
            }

        }
    }
    else {
        // console.log(type_boot_description)
        // console.log('hi' + list_type_boot_description[type_boot_description])
        ip_vps = $('#ip_' + id).text();
        boot_vps(id, type_boot_description)
    }
}

function reset_status_btn() {
    $("#btn-check").text("Check");
}

function change_status_btn() {
    $("#btn-check").text("Loading...");
}

function change_status_checkbox_all() {
    
    checked_status = $('#checkbox_all').prop( "checked");
    $('#checkbox_all').prop("checked", checked_status);
    $('.checkbox_vps').prop("checked", checked_status);
}

/*-------------------------------------------------*/
$(document).ready(function () {
    load_data();

    $("#searchbox").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});

function copyClipboard(idInput) {

    var copyText = document.getElementById(idInput);
    copyText.select();
    document.execCommand("copy");
    noti(0, "Copy successful!")
}


function validate_api(inputText) {
    var api = inputText.replace('\t', ' ').trim();
    // console.log(`API : ${api} | Length : ${api.length}`)
    if (api.length == 0) {
        return false;
    }
    return true;
}

function load_data() {
    $('#api').val(localStorage['bonecloud_api']);
}
function save_data() {
    var api = $('#api').val();
    if (validate_api(api)) {
        localStorage.setItem('bonecloud_api', api);
    }
}

function noti(id, message) {
    list_notify = ['OK', "Fail", "Fail"]
    list_notify_status = ['success', 'danger', 'warning']
    $.notify({
        title: '<strong>' + list_notify[id] + '!</strong>',
        message: message
    }, {
        type: list_notify_status[id],
        delay: 1,
        timer: 500
    });
}

function confirmNotify(choice, id, type_boot_description) {
    /* 
        choice: 
        - 0: all vps checked
        - 1: 1 vps
        id: id 1 vps checked
        type_boot_description
    */

   let list_vps = $('input[class=checkbox_vps]:checkbox:checked');
   let list_ip = "";
   let list_vps_length = list_vps.length;
   let message = `Bạn có thực sự muốn ${list_type_boot_description[type_boot_description].to} những VPS dưới đây không? \
   <div class="alert modal-alert-info text-left"><ol id="bootVPSModalBodyIP"></ol></div>`
   
   if (choice != 0) {
    list_vps_length = 1
   }
   $('.bootVPSModalLabelType').text(`${list_type_boot_description[type_boot_description]} ${list_vps_length}`)
   $('#bootVPSModalConfirm').attr("onclick", `run_list_boot_vps(${choice}, '${id}', ${type_boot_description})`);
   
   $('#bootVPSModalBody').empty();
   $('#bootVPSModalBody').append(message);
   $('#bootVPSModalConfirm').text(list_type_boot_description[type_boot_description].toUpperCase())
   // All VPS
    if (choice == 0) {
        // Get all vps checked
        if (list_vps.length == 0) {
            noti(1, "Vui lòng chọn ít nhất 1 VPS để thao tác")
        } else {

            for (let i = 0; i < list_vps.length; i++) {
                element_id = list_vps[i].closest('[data-id]').getAttribute('data-id');
                ip_vps = $('#ip_' + element_id).text();
                // console.log(ip_vps);
                $('#bootVPSModalBodyIP').append(`<li><strong>${ip_vps}</strong></li>`)
                // console.log(list_vps[0].closest('[data-id]').getAttribute('data-id'))
            }
            // console.log(list_vps[0].closest('[data-id]').getAttribute('data-id'));
            // console.log(2)

            $('#bootVPSModal').modal('show');
        }
    }
    else {
        // console.log(type_boot_description)
        // console.log('hi' + list_type_boot_description[type_boot_description])
        ip_vps = $('#ip_' + id).text();
        $('#bootVPSModalBodyIP').append(`<li><strong>${ip_vps}</strong></li>`)
        $('#bootVPSModal').modal('show');
    }
}
