var host = "https://api.linode.com/v4";
var region;
var instance = {}
var api;
var type_description = ['khởi động', 'khởi động lại', 'tắt', 'xóa', 'chế độ cứu hộ']
var type_boot = ['boot', 'reboot', 'shutdown', 'delete', 'rescue']
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
        if (confirm("Bạn có muốn " + type_description[type] + " VPS " + instance[parseInt(value)-1].ipv4 + " không?" )) {
            selectTypeBootInstance(value, type)
        }
    }
    
}

function loadDataLinode() {

    //Xóa dữ liệu đang hiển thị
    $("tbody").empty();
    $("#spinner").show();
    let stt = 0;
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
            url: host + "/linode/instances/",
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
                    data['data'].forEach(element => {
                        ++stt;
                        $("tbody").append('<tr id="' + stt  + '"><td>' + stt + '</td><td>' + element.id + '</td><td>' + element.label + '</td><td>'  + element.ipv4 + '</td><td>' + element['specs'].vcpus + '</td><td>' + element['specs'].memory / 1024 + '</td><td>' + element.region + '</td><td>' + _isContainsRegion(element.region) + '</td><td>'+ element.status + '</td><td>' + 
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
                        instance = data['data']
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
    
}

/*-------------------------------------------------*/
// GET region linode from api
function loadRegionLinode() {
    $.ajax({
        url: host + "/regions/",
        type: "GET",
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
        success: function(data) {
            // xử lý dữ liệu nhận được ở đây
            // console.log(data);
            // var obj = JSON.parse(data);
            // console.log(data['data'])
                // console.log(data[0]['id'])
                // console.log(data[0]['specs'].disk)
            region = data['data'];
        }
    });
}
/*-------------------------------------------------*/

/*-------------------------------------------------*/
// Trans region
function _isContainsRegion(value) {
    for (i = 0; i < region.length; i++) {
        if (region[i].id == value) 
            return region[i].country.toUpperCase();
    }
}
/*-------------------------------------------------*/

/*-------------------------------------------------*/
//  Boot Linode Instance
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
    var url = host + '/linode/instances';
    var method;
    var headers;
    var id = parseInt(stt)-1;
    // console.log(stt);
    // console.log(id);
    // console.log(instance.length)
    if (id < instance.length) {
        if (value == 3) {
            url = url + '/'  + instance[id].id;
            method = "DELETE";
            headers = {'Content-Type': 'application/json; charset=UTF-8',
                        'Authorization': 'Bearer '+ api
            }
        }
        else {
            url = url + '/' + instance[id].id + '/' + type_boot[value];
            method = "POST"
            headers = {'Content-Type': 'application/json; charset=UTF-8',
                        'Authorization': 'Bearer '+ api
            }
        }
    
        $.ajax({
            url: url,
            type: method,
            headers: headers,
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
                    console.log("Đang " + type_description[value] + " VPS " +  instance[id].ipv4);
                    $.notify({
                        title: '<strong>Thông báo!</strong>',
                        message: "Đang " + type_description[value] + " VPS " +  instance[id].ipv4
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
    
    
    // setTimeout(loadDataLinode(), 3000)
    
}
/*-------------------------------------------------*/
$(document).ready(function() {
    loadRegionLinode();
    // console.log(region);
});