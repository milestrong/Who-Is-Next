'use strict';

$(document).ready( function () {
    config.checkAuth("FACULTY"); 

    view_class_stud.init('#main-content');
    view_class_stud.importCSV();
});
    

var view_class_stud = {

    student_data : null,

    init : function( main_content ){

        navbar.init('#navbar');
        sidebar.init('#sidebar');

        $(main_content).append([
            '<h2 id="course-id"></h2>',
                '<a class="waves-effect waves-light btn-large" style="background-color: #b42529;" id="randomize"><i class="material-icons right">loop</i>RANDOMIZE</a>',
                '<br/><br/><nav>',
                    '<div class="nav-wrapper row">',
                        '<div class="input-field col l12">',
                            '<input id="search-student" type="search" placeholder="Search Student" required>',
                            '<label for="search-student"><i class="material-icons">search</i></label>',
                            '<i class="material-icons waves-effect waves-light">close</i>',
                        '</div>',
                    '</div>',
                '</nav><br/>',
            '<ul id="student-list"></ul>',
        ].join(''));

        $("#course-id").append( localStorage.course_code );
        $("#course-id").append(" " +    localStorage.class_section );
        $("#course-id").append(localStorage.section_number=="undefined" ?
            '' : '-'+localStorage.section_number);

        $('#randomize').click(function(){
            localStorage.class_id_randomize = localStorage.class_id;
            window.location.href = "/views/get_volunteers";
        });

        $('#search-student').keyup(function () {

            if(!view_class_stud.student_data){
                document.location.reload();
            }else  if($(this).val().trim()==''){
                view_class_stud.manipulateDom(view_class_stud.student_data,"");
            }else{
                view_class_stud.manipulateDom(view_class_stud.student_data, $(this).val());
            }

        });

        $('#add-button').click(function () {
            var student_number = $("#student_number").val(),
                first_name = $("#first_name").val(),
                middle_name = $("#middle_name").val(),
                last_name = $("#last_name").val(),
                college = $("#college").val(),
                course = $("#course").val(),
                birthday = $("#birthday").val(),
                gender;
            
            if(!student_number){
                return Materialize.toast("Please enter student number", 1000);
            }

            if (!student_number.match(/^[0-9]{4}-[0-9]{5}$/)) {
                return Materialize.toast("Invalid student number", 1000);
            }

            if(!first_name || !middle_name || !last_name){
                return Materialize.toast("Please enter complete name", 1000);
            }

            if(!college){
                return Materialize.toast("Please select college", 1000);
            }

            if(!course){
                return Materialize.toast("Please enter course", 1000);
            }

            if(!$("#male").is(':checked') && !$("#female").is(':checked')){
                return Materialize.toast("Please select gender", 1000);
            }

            //var bday = parseInt();
            if((Date.now() - new Date(birthday)) < 0) {
                return Materialize.toast("Please enter the real birthday", 1000);
            }
            
            if(!birthday){
                return Materialize.toast("Please select birthday", 1000);
            }

            gender = (!$("#male").is(':checked') ? "F" : "M");

            $.ajax({
                type: "POST",
                url: "/api/student",
                headers: util.headers,
                data: {
                    student_number: student_number,
                    first_name: first_name,
                    middle_name: middle_name,
                    last_name: last_name,
                    college: college,
                    course: course,
                    gender: gender,
                    birthday: birthday
                },
                dataType: "JSON",
                success: function() {
                    $('#add_modal').closeModal();

                    $.ajax({
                        type: "POST",
                        url: "/api/class_student",
                        headers: util.headers,
                        data: {
                            class_id: localStorage.class_id,
                            student_number: student_number,
                            no_of_times_called: 0
                        },
                        dataType: "JSON",
                        success: function (result) {
                             setTimeout(function(){
                                return Materialize.toast(student_number + " is added!", 1000,"",function(){
                                    window.location.href = "/views/class_student";
                                });
                            },500);
                        },
                        error: util.errorHandler
                    });
                },
                error: function(err){
                    return Materialize.toast(err.responseText,800,"",function(){
                        if(!view_class_stud.getStudentInfo(student_number) && 
                            confirm("Would you like you like to import data of student "+ 
                            student_number +" to this class ?")){

                            $.ajax({
                                type: "POST",
                                url: "/api/class_student",
                                headers: util.headers,
                                data: {
                                    class_id: localStorage.class_id,
                                    student_number: student_number,
                                    no_of_times_called: 0
                                },
                                dataType: "JSON",
                                success: function (result) {
                                     setTimeout(function(){
                                        return Materialize.toast(student_number + " is added!", 1000,"",function(){
                                            window.location.href = "/views/class_student";
                                        });
                                    },500);
                                },
                                error: util.errorHandler
                            });
                        };
                    });
                }
            });
        });

        $('#edit-button').click(function () {
            // Get data from input fields of edit student form
            var student_number = $("#student_number_edit").val(),
                first_name = $("#first_name_edit").val(),
                middle_name = $("#middle_name_edit").val(),
                last_name = $("#last_name_edit").val(),
                college = $("#college_edit").val(),
                course = $("#course_edit").val(),
                gender = (!$("#male_edit").is(':checked') ? "F" : "M"),
                birthday = $("#birthday_edit").val();
           
            $.ajax({
                type: "PUT",
                url: "/api/student",
                headers: util.headers,
                data: {
                    student_number_new: student_number,
                    first_name: first_name,
                    middle_name: middle_name,
                    last_name: last_name,
                    college: college,
                    course: course,
                    gender: gender,
                    birthday: birthday,
                    student_number: localStorage.student_number
                },
                dataType: "JSON",
                success: function () {
                    Materialize.toast(localStorage.student_number + " successfully edited!", 1000, "",
                        function(){
                            window.location.href = "/views/class_student";
                        });
                },
                error: util.errorHandler
            });


            return false;
        });

        $('#import').click(function(){
            
            $('#import-modal').openModal();

            $.ajax({
                url: '/api/import/'+localStorage.class_id,
                method: 'GET',
                headers: util.headers,
                success: view_class_stud.renderImportData,
                error: util.errorHandler
            });

        });

        $('#import-confirm').click(function(){
            var checked_students = $('.import:checkbox:checked'),
                import_count = 1;

            if($('#no-import').html().trim()!=""){
                $('#import-modal').closeModal();
                return;
            }

            if(!checked_students || !checked_students.length){
                return Materialize.toast("Please checked students to be import!", 1500);
            }

            $('#import-modal').closeModal();

            for(var imports = 0; imports < checked_students.length; imports++){
                var student_number = checked_students[imports].id;

                $.ajax({
                    type: "POST",
                    url: "/api/class_student",
                    headers: util.headers,
                    data: {
                        class_id: localStorage.class_id,
                        student_number: student_number,
                        no_of_times_called: 0
                    },
                    dataType: "JSON",
                    success: function (result) {
                        Materialize.toast(student_number + " is added!", 1000);
                    },
                    error: function(err){
                        Materialize.toast("Failed to add " +student_number + " !", 1000);
                    },
                    complete: function(){
                        if((import_count++)==checked_students.length){
                            setTimeout(function(){
                               window.location.href = "/views/class_student";
                            },1800);
                        }
                    }
                });
            }


        });

        $.ajax({
            url: '/api/class_student/' + localStorage.class_id,
            method: 'GET',
            headers: util.headers,
            success: view_class_stud.manipulateDom,
            error: util.errorHandler
        });
    },

    manipulateDom : function( data, search ){
        if(!data) {
            return Materialize.toast("Error in fetching data",2500);
        }

        if(!view_class_stud.student_data) {
            view_class_stud.student_data = data;
        }

        var content = $('#student-list'),
            search_string = 
                (search=="success" || search=="fail" || !search) ?
                    "" : search.toLowerCase(),
            search_count = data.length;

        if(!data || !data.length){
            content.append('<br/><br/><h2 class="center">No Students Found</h2>');
            return;
        } 

        content.empty();

        for (var student in data) {

            if(search_string &&
                  !new RegExp(search_string).test(
                        (data[student].last_name || '').toLowerCase()+' '+
                        (data[student].first_name || '').toLowerCase()+' '+
                        (data[student].middle_name || '').toLowerCase()
                    ) ){
                search_count--;
                continue;
            }

            var row = $("<li></li>"),
                student_header = $("<div class='row'></div>"),
                image = $('<img/>'),
                text = $("<div></div>"),
                options = $("<div></div>"),
                edit_student = $(["<a title='Edit Student'>",
                                    "<i class='material-icons options-text'>mode_edit</i>",
                                "</a>"].join('')),
                delete_student = $(["<a title='Delete Student'>",
                                    "<i class='material-icons options-text'>delete</i>",
                                "</a>"].join(''));

            image.attr("src", data[student].picture);
            image.css("width","100px");
            image.css("height","100px");
            image.css("background-color","#b42529");
            image.addClass("circle center col s2 push-s1 responsive-img");

            text.append("<h4>"+
                data[student].last_name + ", " +
                data[student].first_name + " " +
                data[student].middle_name + "</h4>"
            );
            text.addClass("center-align student-data modal-trigger col s8");
            text.attr("id", data[student].student_number);
            text.attr("href", "#student_modal");
            text.css("width", "80%");
            text.css("padding", "2%");

            edit_student.addClass("modal-trigger edit-student-button");
            edit_student.attr("student_number", data[student].student_number);

            delete_student.addClass("remove");
            delete_student.attr("student_number", data[student].student_number);

            options.attr("id", data[student].student_number + "-options");
            options.addClass("options col s1");
            options.append(edit_student);
            options.append(delete_student);
            options.css("margin","0");
            options.css("padding","0");
            
            student_header.attr("student_number", data[student].student_number);
            student_header.addClass("collapsible-header student-div");
            student_header.append(image);
            student_header.append(text);
            student_header.append(options);
            student_header.css("padding","0");

            row.append(student_header);
            content.append(row);
        }

        if(search_count==0){
            content.append('<br/><h2 class="center">No Students Found</h2>');
            return;
        }

        $('.options').hide();

        $('.student-div').hover(
            function(){
                $('#' + $(this).attr("student_number")+"-options").show();
            },function(){
                $('#' + $(this).attr("student_number")+"-options").hide();
            }
        );

        $('.student-data')
            .click(function(){
                var student_number = $(this).attr("id"),
                    data_student = view_class_stud.getStudentInfo(student_number);

                $('#student-picture').attr("src",data_student.picture);

                $('#student_header').html($("<span></span>").html(data_student.last_name + ", " + data_student.first_name + " " + data_student.middle_name));
                $('#student_no').html($("<span></span>").html("Student number: " + data_student.student_number));
                $('#student_course').html($("<span></span>").html("Course: " + data_student.course));
                $('#student_college').html($("<span></span>").html("College: " + data_student.college));
                $('#student_gender').html($("<span></span>").html("Gender: " + data_student.gender));
                $('#student_birthday').html($("<span></span>").html("Birthday: " + util.dateParser(data_student.birthday)));

                $('#student_modal').openModal();
            });

        $('.edit-student-button')
            .click(function () {
                var student_number = $(this).attr("student_number"),
                    data_student = view_class_stud.getStudentInfo(student_number);

                localStorage.student_number = student_number;

                $('#student_number_edit').val(data_student.student_number);
                $('#first_name_edit').val(data_student.first_name);
                $('#middle_name_edit').val(data_student.middle_name);
                $('#last_name_edit').val(data_student.last_name);
                $('#course_edit').val(data_student.course);
                $('#college_edit').val(data_student.college);
                $('#birthday_edit').val(util.dateParser(data_student.birthday));

                if(data_student.gender == "M"){
                    $('#male_edit').click();
                }else{
                    $('#female_edit').click();
                }

                $('#edit_student_modal').openModal();
            });

        $('.remove')
            .click(function () {
                var student_number = $(this).attr("student_number"),
                    class_id = localStorage.class_id;

                if(confirm("Are you sure you want to remove student "+ student_number + " in this class ?")){
                    $.ajax({
                        method: "DELETE",
                        url: "/api/class_student",
                        headers: util.headers,
                        data: {
                            class_id: class_id,
                            student_number: student_number
                        },
                        dataType: "JSON",
                        success: function (result) {
                            setTimeout(function(){
                                return Materialize.toast("Successfully remove - " + student_number + " !", 1000
                                    ,"",function(){
                                        window.location.href = "/views/class_student";
                                });
                            },500);
                        },
                        error: util.errorHandler
                    });
                }
            });
    },

    getStudentInfo : function( student_number ){
        var data = view_class_stud.student_data;

        for (var student in data) {
            if(student_number == data[student].student_number) return data[student];
        }
        return null;
    },

    readBlob : function(opt_startByte, opt_stopByte) {

        var files = document.getElementById('file-path').files;
        if (!files.length) {
            return Materialize.toast("Please select a file", 1000);
        }

        var pattern = /.csv$/g;
        if (!files[0].name.match(pattern)){
            return Materialize.toast("Please select a CSV file", 1000);
        }

        $('#modal1').closeModal();

        var file = files[0];
        var start = parseInt(opt_startByte) || 0;
        var stop = parseInt(opt_stopByte) || file.size - 1;

        var reader = new FileReader();

        reader.onloadend = function(evt) {
          if (evt.target.readyState == FileReader.DONE) {
            let nope = evt.target.result.split(/[ ,\n]+/);


            for (var i = 0; i < ( nope.length/9 ); i++) {
                $.ajax({
                    url: "/api/student",
                    method: 'POST',
                    dataType: "JSON",
                    headers: util.headers,
                    data: {
                        student_number: nope[0 + ( 9 * i ) ],
                        first_name:     nope[1 + ( 9 * i ) ],
                        middle_name:    nope[2 + ( 9 * i ) ],
                        last_name:      nope[3 + ( 9 * i ) ],
                        college:        nope[4 + ( 9 * i ) ],
                        course:         nope[5 + ( 9 * i ) ],
                        gender:         nope[6 + ( 9 * i ) ],
                        birthday:       nope[7 + ( 9 * i ) ]

                    },
                    success: function(data){
                        if(!data){
                            return Materialize.toast("Error in adding a student. Please try again !",2500);
                        }
                    },
                    error: function(err){
                        return Materialize.toast(err.responseText,2500);
                    }
                });
                
                $.ajax({
                    url: "/api/class_student/",
                    method: 'POST',
                    dataType: "JSON",
                    headers: util.headers,
                    data: {
                        class_id:           localStorage.class_id,
                        student_number:     nope[0 + ( 9 * i ) ],
                        no_of_times_called: 0,
                    },
                    success: function(data){
                        if(!data){
                            return Materialize.toast("Error in adding a student to class. Please try again !",2500);
                        }

                        document.location.reload();
                    },
                    error: function(err){
                        return Materialize.toast(err.responseText,2500);
                    }
                });
            };
            //$('#byte_content').append($('<span></span>').html(evt.target.result));
          }
        };

        var blob = file.slice(start, stop + 1);
        reader.readAsBinaryString(blob);
    },
      
    importCSV : function(  ){
        document.querySelector('.readBytesButtons').addEventListener('click', function(evt) {
            if (evt.target.tagName.toLowerCase() == 'button') {
              var startByte = evt.target.getAttribute('data-startbyte');
              var endByte = evt.target.getAttribute('data-endbyte');
              view_class_stud.readBlob(startByte, endByte);
            }
        }, false);

        $('#disagree')
            .click(function (evt) {
                $('#byte_content').empty();
            }
        );   
    },

    renderImportData : function(data){

        if(!data) {
            return Materialize.toast("Error in fetching data",2500);
        } 

        if(!data.length){
            $('#import-table').hide();
            $('#import-confirm').html("OK");
            $('#no-import').html("<br/><br/><br/>No Students to Import");
            return;
        }

        $('#import-data').empty();
        $('input:checkbox').removeAttr('checked');

        for(var student in data){
            $('#import-data').append([
                '<tr>',
                    '<td style="text-align:left;">',
                        '<input type="checkbox" class="import filled-in" id="',data[student].student_number,'"/>',
                        '<label for="',data[student].student_number,'" style="color:black;padding-left:35%;">',
                            data[student].student_number,
                        '</label>',
                    '</td>',
                    '<td>',data[student].last_name,' ',data[student].first_name,'</td>',
                '</tr>',
            ].join(''));
        }

    }
};
