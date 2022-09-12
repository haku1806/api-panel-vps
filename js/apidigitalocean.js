var host = "https://api.digitalocean.com/v2";
var region;
var instance = {}
var api;
var type_description = ['khởi động', 'khởi động lại', 'tắt', 'xóa', 'chế độ cứu hộ']
var type_boot = ['power_on', 'reboot', 'power_off', 'delete', 'rescue']
/////////////////////////////////////////////////
// Hiển thị dữ liệu lấy từ API
/////////////////////////////////////////////////

function confirmNotify(value, type) {
    if (value == '-1') {
        var tempInstance = $("#listID").val()
        if (tempInstance.length == 0) {
            $.notify({
                title: '<strong>Cảnh báo!</strong>',
                message: 'Không được để ô nhập các STT trống!.'
            },{
                type: 'danger',
                delay: 1,
                timer: 500
            });
        } else {
            if (confirm("Bạn có muốn " + type_description[type] + " một số VPS đó không?" )) {
                selectTypeBootInstance(tempInstance, type)
            }
        }
    }
    else {
        if (confirm("Bạn có muốn " + type_description[type] + " VPS " + instance[parseInt(value)-1].networks.v4[1].ip_address + " không?" )) {
            selectTypeBootInstance(value, type)
        }
    }
    
}

function checkLiveAccount() {
    //Xóa dữ liệu đang hiển thị
    $("tbody").empty();
    $("#spinner").show();

    api = $("#api").val();
    if (api.length == 0) {
        $.notify({
            title: '<strong>Cảnh báo!</strong>',
            message: 'Vui lòng nhập API.'
        },{
            type: 'danger',
            delay: 1,
            timer: 500
        });
    }
    else {
        $.ajax({
            url: host + "/account",
            type: "GET",
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': 'Bearer ' + api
            },
            success: function(data, textStatus, jqXHR) {
                // xử lý dữ liệu nhận được ở đây  
                loadDataVPS();           
            },
            error: function(jqXHR, textStatus, errorThrown) {
                var data = jqXHR.responseJSON;
                if (jqXHR.status == 401) {
                    try {
                        if (data['account']['status'] == 'locked') {
                            $.notify({
                                title: '<strong>Cảnh báo!</strong>',
                                message: 'Token đã bị khóa!'
                            },{
                                type: 'danger',
                                delay: 1,
                                timer: 500
                            });
                        }
                    } catch {
                        $.notify({
                            title: '<strong>Cảnh báo!</strong>',
                            message: 'Token không tồn tại!'
                        },{
                            type: 'danger',
                            delay: 1,
                            timer: 500
                        }); 
                    }
                }
            }
        });
    }
}

function loadDataVPS() {

    //Xóa dữ liệu đang hiển thị
    $("tbody").empty();
    let stt = 0;
    api = $("#api").val();
    
    $.ajax({
        url: host + "/droplets?per_page=100",
        type: "GET",
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + api
        },
        success: function(data, textStatus, jqXHR) {
            // xử lý dữ liệu nhận được ở đây
            // console.log(data);
            // var obj = JSON.parse(data);
            // console.log(data['data'])
                // console.log(data[0]['id'])
                // console.log(data[0]['specs'].disk)
            if (jqXHR.status == 200) {
                $.notify("<strong>Thông báo</strong>: Lấy thông tin VPS thành công!.", {
                    delay: 1,
                    timer: 500,
                    animate: {
                        enter: 'animated zoomInDown',
                        exit: 'animated zoomOutUp'
                    }
                });
                data['droplets'].forEach(element => {
                    ++stt;
                    $("tbody").append('<tr id="' + stt  + '"><td>' + stt + '</td><td>' + element.id + '</td><td>' + element.name + '</td><td>'  + element.networks.v4[1].ip_address + '</td><td>' + element.vcpus + '</td><td>' + element.memory / 1024 + '</td><td>' + element.region.slug + '</td><td>' + element.region.name + '</td><td>'+ element.status + '</td><td>' + 
                                    '<div class="btn-group">' + 
                                        '<button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                                            'Action'                                            + 
                                        '</button>'                                             +
                                        '<div class="dropdown-menu">'                           +
                                            '<a class="dropdown-item" href="#" onclick="confirmNotify('+ "'" + stt + "', 0)" + '">Boot STT</a>'   + 
                                            '<a class="dropdown-item" href="#" onclick="confirmNotify('+ "'" + stt + "', 1)" + '">Reboot STT</a>' +
                                            '<a class="dropdown-item" href="#" onclick="confirmNotify('+ "'" + stt + "', 2)" + '">Shutdown STT</a>'+
                                            '<div class="dropdown-divider"></div>'              +
                                            '<a class="dropdown-item" href="#" onclick="confirmNotify('+ "'" + stt + "', 3)" + '">Delete STT</a>'+
                                        '</div>'                                                +
                                    '</div>');
                    instance = data['droplets']
                });
            }
            $("#spinner").hide();
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 401) {
                $.notify({
                    title: '<strong>Cảnh báo!</strong>',
                    message: 'API không thể sử dụng. Vui lòng thử lại!'
                },{
                    type: 'danger',
                    delay: 1,
                    timer: 500
                });
            }
            }
    });
    
    
}




/*-------------------------------------------------*/
//  Boot Instance
function selectTypeBootInstance(stt, value) {
    if (stt == '0') {
        for (i = 0; i < instance.length; i++) {
            bootInstance(toString(i+1), value);
        }
    }
    else if (stt.includes(",")) {
        var list_vps = stt.trim().split(', ');
        for (i = 0; i < list_vps.length; i++) {
            bootInstance(list_vps[i], value);
        }
    }
    else {
        bootInstance(stt, value);
    }
}
/*-------------------------------------------------*/

/*-------------------------------------------------*/
//  Boot Linode Instance
function bootInstance(stt, value) {
    var url = host + '/droplets';
    var method;
    var headers;
    var data;
    var id = parseInt(stt)-1;
    console.log(stt);
    console.log(id);
    console.log(instance.length)
    if (id < instance.length) {
        if (value == 3) {
            url = url + '/'  + instance[id].id;
            method = "DELETE";
            headers = {'Content-Type': 'application/json;',
                        'Authorization': 'Bearer '+ api
            }
        }
        else {
            url = url + '/' + instance[id].id + '/actions';
            method = "POST"
            headers = {'Content-Type': 'application/json;',
                        'Authorization': 'Bearer '+ api
            }
            data = {
                'type': type_boot[value]
            }
        }
        
        console.log(data)
        console.log(headers)
        $.ajax({
            url: url,
            type: method,
            headers: headers,
            data: JSON.stringify(data),
            success: function(data) {
                // xử lý dữ liệu nhận được ở đây
                // console.log(data);
                // var obj = JSON.parse(data);
                // console.log(data.length)
                try {
                    console.log(data.errors[0].reason);
                    $.notify({
                        title: '<strong>Thông báo!</strong>',
                        message: data.errors[0].reason
                    },{
                        type: 'danger'
                    });
                } catch {
                    console.log("Đang " + type_description[value] + " VPS " +  instance[id].networks.v4[1].ip_address);
                    $.notify({
                        title: '<strong>Thông báo!</strong>',
                        message: "Đang " + type_description[value] + " VPS " +  instance[id].networks.v4[1].ip_address
                    },{
                        type: 'success'
                    });
                }
            }
        });
    }
    else {
        $.notify({
            title: '<strong>Cảnh báo!</strong>',
            message: 'STT ' + stt + ' không thuộc về bất cứ VPS nào!'
        },{
            type: 'danger',
            delay: 1,
            timer: 500
        });
    }
    
    
    // setTimeout(loadDataVPS(), 3000)
    
}
/*-------------------------------------------------*/
$(document).ready(function() {
    // console.log(region);
});