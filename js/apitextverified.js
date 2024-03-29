var host = "http://server.hakucloud.com:1812/api";
var api = "";
var token = "";
var token_valid = false;

async function check_live_account() {
    api = document.getElementById('api').value;
    api = api.replaceAll(' ', '');
    save_data();
    get_token();
}

function get_token() {
    url = host + "/textverified/auth?api=" + api 

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
    .then( response => {
        if (!response.ok) {
            noti(1, `HTTP error: ${response.status}`);
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(result => {
        console.log(result);
        if (result.success) {
            token = result.data.bearer_token;
            token_valid = true;
            console.log(token);
            noti(0, result.message);
            get_user();
            get_targets();
        } else {
            token_valid = false;
            console.log(result.message);
            noti(1, result.message);
        }
    })
    .catch(error => {
        console.log('error', error)
        noti(1, error);
    });
}

async function auto_refresh_token() {
    setInterval(function(){
        console.log("Refresh Token")
        if (token_valid == true) {
            refresh_token();
        } else {
            console.log("Token false")
        }
       }, 300000);
}

function refresh_token() {
    url = host + "/textverified/auth?api=" + api 

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
    .then( response => {
        if (!response.ok) {
            noti(1, `HTTP error: ${response.status}`);
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(result => {
        console.log(result);
        if (result.success) {
            token_valid = true;
            token = result.data.bearer_token;
            console.log(token);
            noti(0, result.message);
        } else {
            token_valid = false;
            console.log(result.message);
            noti(1, result.message);
        }
    })
    .catch(error => {
        console.log('error', error)
        noti(1, error);
    });
}

async function auto_refresh_user() {
    setInterval(function(){
        if (token_valid == true) {
            get_user();
        }
       }, 120000);
}

function get_user() {
    url = host + "/textverified/users?token=" + token 

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
    .then( response => {
        if (!response.ok) {
            noti(1, `HTTP error: ${response.status}`);
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(result => {
        console.log(result);
        if (result.success) {
            console.log(result.data);
            $("#user").text(result.data.username)
            $("#balance").text(result.data.credit_balance + "$")
            noti(0, result.message);
        } else {
            console.log(result.message);
            noti(1, result.message);
        }
    })
    .catch(error => {
        console.log('error', error)
        noti(1, error);
    });
}

function get_targets() {
    url = host + "/textverified/targets?token=" + token 

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
    .then( response => {
        if (!response.ok) {
            noti(1, `HTTP error: ${response.status}`);
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(result => {
        console.log(result);
        if (result.success) {
            // console.log(result.data);
            data = result.data;
            $('#targets').empty();
            $.each(data, function(index, value) {
                $('#targets').append('<option selected="selected" value="' + value.targetId +'">' + value.name  + ' (' + value.cost +  '$)</option>')
            })
            $('#targets').selectpicker('refresh');
            $('.selectpicker').selectpicker('val', 0);
            // $('#targets').find(":selected").val();
            noti(0, result.message);
        } else {
            console.log(result.message);
            noti(1, result.message);
        }
    })
    .catch(error => {
        console.log('error', error)
        noti(1, error);
    });
}

function create_phone() {

    id = $('#targets').find(":selected").val();
    service_name = $('#service_name').text();
    console.log(service_name);
    url = host + "/textverified/verifications/create?token=" + token + "&id=" + id

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
    .then( response => {
        if (!response.ok) {
            noti(1, `HTTP error: ${response.status}`);
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(result => {
        console.log(result);
        if (result.success) {
            console.log(result.data);
            data = result.data;
            $('#phone').attr("data-id", data.id);
            $('#phone').val(data.number);
            $('#target_name').text(data.target_name);
            $('#cost').text(data.cost);
            $('#status').text(data.status);
            $('#time_remaining').text(data.time_remaining);
            noti(0, result.message);
        } else {
            console.log(result.message);
            noti(1, result.message);
        }
    })
    .catch(error => {
        console.log('error', error)
        noti(1, error);
    });
}

function get_detail_phone() {

    id = $('#phone').attr("data-id");
    service_name = $('#service_name').text();
    console.log(service_name);
    url = host + "/textverified/verifications/details?token=" + token + "&id=" + id

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
    .then( response => {
        if (!response.ok) {
            noti(1, `HTTP error: ${response.status}`);
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(result => {
        console.log(result);
        if (result.success) {
            console.log(result.data);
            data = result.data;
            $('#phone').attr("data-id", data.id);
            $('#phone').val(data.number);
            if (data.status == "Completed") {
                $('#code').val(data.code);
                $('#full_message').val(data.sms);
            } else {
                $('#code').val("");
                $('#full_message').val("");
            }
            
            $('#target_name').text(data.target_name);
            $('#cost').text(data.cost);
            $('#status').text(data.status);
            $('#time_remaining').text(data.time_remaining);
            noti(0, result.message);
        } else {
            console.log(result.message);
            noti(1, result.message);
        }
    })
    .catch(error => {
        console.log('error', error)
        noti(1, error);
    });
}


async function auto_refresh_get_detail_phone() {
    setInterval(function(){
        if ($('#status').text() == "Pending") {
            console.log("Refresh detail phone")
            refresh_get_detail_phone();
        }
       }, 5000);
}

function refresh_get_detail_phone() {

    id = $('#phone').attr("data-id");
    service_name = $('#service_name').text();
    console.log(service_name);
    url = host + "/textverified/verifications/details?token=" + token + "&id=" + id

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
    .then( response => {
        if (!response.ok) {
            noti(1, `HTTP error: ${response.status}`);
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(result => {
        console.log(result);
        if (result.success) {
            console.log(result.data);
            data = result.data;
            if (data.status == "Completed") {
                $('#code').val(data.code);
                $('#full_message').val(data.sms);
            } else {
                $('#code').val("");
                $('#full_message').val("");
            }
            
            $('#status').text(data.status);
            $('#time_remaining').text(data.time_remaining);
            noti(0, result.message);
        } else {
            console.log(result.message);
            noti(1, result.message);
        }
    })
    .catch(error => {
        console.log('error', error)
        noti(1, error);
    });
}

function cancel_phone() {

    id = $('#phone').attr("data-id");
    service_name = $('#service_name').text();
    console.log(service_name);
    url = host + "/textverified/verifications/cancel?token=" + token + "&id=" + id

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
    .then( response => {
        if (!response.ok) {
            noti(1, `HTTP error: ${response.status}`);
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(result => {
        console.log(result);
        if (result.success) {
            console.log(result.data);
            data = result.data;
            $('#phone').attr("data-id", "");
            $('#phone').val("");
            $('#code').val("");
            $('#full_message').val("");
            $('#target_name').text("None");
            $('#cost').text("None");
            $('#status').text("None");
            $('#time_remaining').text("None");
            noti(0, result.message);
        } else {
            console.log(result.message);
            noti(1, result.message);
        }
    })
    .catch(error => {
        console.log('error', error)
        noti(1, error);
    });
}

function report_phone() {

    id = $('#phone').attr("data-id");
    service_name = $('#service_name').text();
    console.log(service_name);
    url = host + "/textverified/verifications/report?token=" + token + "&id=" + id

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
    .then( response => {
        if (!response.ok) {
            noti(1, `HTTP error: ${response.status}`);
            throw new Error(`HTTP error: ${response.status}`);
        }

        return response.json();
    })
    .then(result => {
        console.log(result);
        if (result.success) {
            console.log(result.data);
            data = result.data;
            $('#phone').attr("data-id", "");
            $('#phone').val("");
            $('#code').val("");
            $('#full_message').val("");
            $('#target_name').text("None");
            $('#cost').text("None");
            $('#status').text("None");
            $('#time_remaining').text("None");
            noti(0, result.message);
        } else {
            console.log(result.message);
            noti(1, result.message);
        }
    })
    .catch(error => {
        console.log('error', error)
        noti(1, error);
    });
}
/*-------------------------------------------------*/
$(document).ready(function() {
    load_data();
    auto_refresh_token();
    auto_refresh_user();
    auto_refresh_get_detail_phone();
});

function noti(id, message) {
    list_notify = ['OK', "Fail", "Fail"]
    list_notify_status = ['success', 'danger', 'warning']
    $.notify({
        title: '<strong>' + list_notify[id] + '!</strong>',
        message: message
    },{
        type: list_notify_status[id],
        delay: 1,
        timer: 500
    });
}

function copyClipboard(idInput) {
    
    var copyText = document.getElementById(idInput);
    copyText.select();
    document.execCommand("copy");
    noti(0, "Copy successful!")
  }

function saveData() {
    if (document.getElementById('rememberme').checked) {
        localStorage.setItem('domain', $("#domain").val());
        localStorage.setItem('email', $("#email").val());
        localStorage.setItem('pwd', $("#pwd").val());
        localStorage.setItem('remember', document.getElementById('rememberme').checked);
    }
}

function load_data() {
    $('#api').val(localStorage['api']);
}
function save_data() {
    localStorage.setItem('api', $('#api').val());
}

