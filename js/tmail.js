var host = "http://server.hakucloud.com:1812/api";
var account = []
var message_id = 0

async function check_mail() {
    var email = $('#email').val()

    // Format input
    if (validate_email(email) == false) {
        noti(1, "Invalid Email!");
    } else {
        console.log("OK")
        save_data();

        url = host + "/mail/fetch?mail=" + account[0] + "&pwd=" + account[1] + "&subject=" + $('#subject').val();
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
        noti(0, 'Reading email. Please wait a moment!');
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
                    $('#subject_list').empty();
                    $("#message_content").empty();
                    for (let i = result.data.messages.length;  i >= 1; i--) {
                        data = result.data.messages[i-1];

                        // Convert datetime to localtime
                        var sender_time = new Date(data.datetime);
                        var localtime = new Date(sender_time.toLocaleString())
                        var sender_time_local = localtime.getDate().toString() + "/" + localtime.getMonth().toString() + "/" + localtime.getFullYear().toString() + " " + localtime.getHours().toString() + ":" + localtime.getMinutes().toString() +  ":" + localtime.getSeconds().toString();
                    // for (let i = 1; i <= result.data.messages.length; i++) {
                    //     data = result.data.messages[i-1];
                        // console.log(data.sender);
                        $('#subject_list').append(
                            '<div id=\"' + i + '\"' +
                                    'class="w-full p-5 cursor-pointer hover:bg-gray-50" data-id=\"' + i + '\" onclick=\'read_mail_detail(\"' + i + '\")\'>' +
                                    '<div class="flex justify-between">' + 
                                        '<div>' +
                                            '<div class="text-gray-800">' + data.sender + '</div>' +
                                            '<div class="text-xs text-gray-400">' + data.from + '</div>' +
                                        '</div>' +
                                        '<div>' +
                                            '<div class="text-gray-800 text-sm">' + sender_time_local + '</div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="text-gray-600 mt-5 text-sm truncate">' + 
                                        data.subject +
                                    '</div>' +
                                '</div>'
                        )

                        $("#message_content").append(
                            '<div id="message_' + i + '" class="flex-1 lg:flex flex-col" style="display:none">' +
            '<textarea class="hidden">To: ' + data.to + 
' From: ' + data.sender + ' &lt;' + data.from + '&gt;' +
' Subject: ' + data.subject + 
' Date: 30 Sep 2022 10:45 AM' + 
' Content-Type: text/html ' +

data.body + '</textarea>' +
            '<div class="flex flex-col flex-none py-5 px-6">' +
                '<div class="flex justify-between items-center">' +
                    '<div>' +
                        '<div class="text-gray-900 text-lg">' + data.subject + '</div>' +
                        '<div class="text-xs text-gray-400">' + data.sender + ' - ' + data.from + '</div>' +
                    '</div> \
                    <div> \
                        <div class="text-xs text-gray-400">' + sender_time_local + '</div> \
                    </div> \
                </div> \
            </div>' +
            '<iframe class="w-full flex flex-grow px-5" srcdoc=\'' + data.body + '\' frameborder=\'0\'></iframe>' +
                    '</div>'
                        )
                    }


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


    // Format input


    // url = host + "/mail/fetch?"

    // headers = {
    //     "Accept": "application/json",
    // }

    // params = {}
    // var requestOptions = {
    //     method: 'GET',
    //     headers: headers,
    //     redirect: 'follow',
    // };
    // console.log(requestOptions)
    // fetch(url, requestOptions)
    // .then( response => {
    //     if (!response.ok) {
    //         noti(1, `HTTP error: ${response.status}`);
    //         throw new Error(`HTTP error: ${response.status}`);
    //     }

    //     return response.json();
    // })
    // .then(result => {
    //     console.log(result);
    //     if (result.success) {
    //         token = result.data.bearer_token;
    //         token_valid = true;
    //         console.log(token);
    //         noti(0, result.message);
    //         get_user();
    //         get_targets();
    //     } else {
    //         token_valid = false;
    //         console.log(result.message);
    //         noti(1, result.message);
    //     }
    // })
    // .catch(error => {
    //     console.log('error', error)
    //     noti(1, error);
    // });
}

function read_mail_detail(id) {
    $('#message_' + message_id).hide();
    $('#message_' + id).show();
    message_id = id;
    console.log(message_id);
    document.querySelector('.message-content').scrollIntoView({ behavior: 'smooth' });
}

function reset_status_btn() {
    $("#btn-check").text("Check");
}

function change_status_btn() {
    $("#btn-check").text("Loading...");
}

/*-------------------------------------------------*/
$(document).ready(function () {
    load_data();
});

function copyClipboard(idInput) {

    var copyText = document.getElementById(idInput);
    copyText.select();
    document.execCommand("copy");
    noti(0, "Copy successful!")
}

function validate_email(inputText) {
    // var email = inputText.replace('\t', ' ').trim();
    // account = inputText.split(' ');
    // if (account.length == 1) {
    //     noti(1, "Email not valid. Please check and try again.");
    //     return false;
    // }

    // var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    // if (mailformat.test(account[0])) {
    //     console.log("Email is valid");
    //     return true;
    // } else {
    //     noti(1, "Email not valid. Please check and try again.");
    //     return false;
    // }

    var email = inputText.replace('\t', ' ').trim();
    account = email.split(' ');
    if (account.length == 1) {
        return false;
    }

    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (mailformat.test(account[0])) {
        console.log("Email is valid");
        return true;
    } else {
        return false;
    }
}

function load_data() {
    $('#email').val(localStorage['tmail_email']);
}
function save_data() {
    var email = $('#email').val();
    if (validate_email(email)) {
        localStorage.setItem('tmail_email', email);
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
