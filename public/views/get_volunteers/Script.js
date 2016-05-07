'use strict';

$(document).ready( function () {

    navbar.init('#navbar');
    sidebar.init('#sidebar');

    $('.brand-logo').remove();
    $('nav').css({"background-color":""});

    $.ajax({
        url: '/api/class2/',
        method: 'GET',
        headers: util.headers,
        success: function(data) {
            var classes = data.classes;
            var courses = data.degree_programs;
            var college = data.colleges;

            for(var i in classes) {
                $('#class-filter').append(
                    '<option value=' + classes[i].class_id + '>' + classes[i].course_code + ' ' + classes[i].class_section + (classes[i].section_number || '') +'</option>'
                );
            }

            for (var i in courses) {
                $('#course-filter').append(
                    '<option value=' + courses[i].course + '>' + courses[i].course + '</option>'
                );
            }

            for (var i in college) {
                $('#college-filter').append(
                    '<option value='+ college[i].college + '>' + college[i].college + '</option>'
                );
            }
        },
        error: function(err){
            util.errorHandler(err);
        }
    }).done(function() {
        if(typeof localStorage.class_id_randomize !== 'undefined'){
            $("#class-filter").val(localStorage.class_id_randomize);
            localStorage.removeItem('class_id_randomize');
        }
    });

    $('#logo-holder').hide();
    $('#randomize-form').hide();
    $('#header').hide();

    $("#randomize-btn").click(function(){
        $('#randomizer-holder').hide();
        $('#logo-holder').fadeIn();
        $("#randomize-form").slideDown(1000);
        $('#header').slideDown(1000);
    });

    $("#add-filter").click(function(){
        $('#filters').show();
        $("#add-filter").hide();
        $("#remove-filter").show();

    });

    $("#remove-filter").click(function(){
        $('#filters').hide();
        $("#add-filter").show();
        $("#remove-filter").hide();
        $('#last-name-filter').val("");
        $('#first-name-filter').val("");
        $('#birthday-filter').val("");
        $('#course-filter').val("");
        $('#college-filter').val("");
        $('#batch-filter').val("");
        $('#male-filter').prop('checked', true);
        $('#female-filter').prop('checked', true);
    });

    $("#start-again").click(function(){
        $('#logo-holder').show();
        $('#randomize-form').show();
        $('#header').show();
        $('#container-list').hide();

    });

    if(typeof localStorage.class_id_randomize !== 'undefined'){
        console.log("hello");
        $("#class-filter").val(localStorage.class_id_randomize);
        $('#randomizer-holder').hide();
        $('#logo-holder').fadeIn();
        $("#randomize-form").slideDown(1000);
        $('#header').slideDown(1000);
        //localStorage.removeItem('class_id_randomize');
    }

 $('#randomize').click(function(){
        var checked = $('input[type=checkbox]:checked').length;

        if($('#class-filter').val() == ""){
            Materialize.toast("You must choose a class", 2000);
        }

        if(checked == 0) {
            Materialize.toast("You must check at least one checkbox at the Gender section", 2000);
        }

        if($('#number-filter').val() == ""){
            Materialize.toast("You must choose the number of volunteers", 2000);
        }

        else {
            var class_id = $('#class-filter').val();

            $.ajax({
                url: '/api/randomizer/' + class_id,
                method: 'POST',
                headers: util.headers,
                data: {
                    class_id    : class_id,
                    last_name   :$('#last-name-filter').val(),
                    first_name  :$('#first-name-filter').val(),
                    birthday    :$('#birthday-filter').val(),
                    course      :$('#course-filter').val(),
                    college     :$('#college-filter').val(),
                    batch       :$('#batch-filter').val(),
                    number      :$('#number-filter').val()
                },
                success: function(data) {
                    console.log(data.length, $("#number-filter").val());
                    if(data.length < $("#number-filter").val()) {
                        Materialize.toast("Number of volunteers exceeded number of students", 2000);
                        return;
                    }

                    for(var i in data) {
                        $.ajax({
                            url: '/api/randomizer',
                            method: 'PUT',
                            data: {
                                class_id        : class_id,
                                student_number  : data[i].student_number
                            },
                            success: function(data2){
                            },
                            dataType: "JSON"
                        });
                    }

                    $('#logo-holder').slideUp();
                    $('#randomize-form').slideUp();
                    $('#header').slideUp();

                    $('#randomize-form').promise().done(function(){
                        $('#randomizer-holder').show();
                        // Import animation of dice and arrow
                        $('head').append("<link id='animation-css' rel='stylesheet' type='text/css' href='css/Animation.css'>");
                        $('#randomize-btn').hide();
                        // Remove animation
                        setTimeout(function(){
                            document.getElementById("animation-css").remove();

                            if (data.length >= 1 && data.length <= 10) {
                                if(data.length == 1) {
                                    $('#randomizer-holder').hide();
                                    $('#logo-holder').hide();
                                    $("#container-list").show();
                                    zoomInImage(data);
                                } else {
                                    var rand = Math.round(Math.random() * 2);
                                    console.log(rand);
                                    switch(rand) {
                                        case 1: $('#randomizer-holder').hide();
                                                $('#logo-holder').hide();
                                                $("#container-list").show();
                                                jumbleWords(data);
                                                break;
                                        case 2: startHatch(data);
                                                break;
                                        default: $('#randomizer-holder').hide();
                                                 $('#logo-holder').hide();
                                                 $("#container-list").show();
                                                 jumbleWords(data);
                                                 break;
                                    }    
                                }
                                
                            } else {    // Randomize selection of effects
                                var rand = Math.round(Math.random() * 3);
                                switch(rand) {
                                    case 1:
                                        $('#randomizer-holder').hide();
                                        $('#logo-holder').hide();
                                        $("#container-list").show();
                                        jumbleWords(data);
                                        break;
                                    case 2:
                                        $('#randomizer-holder').hide();
                                        $('#logo-holder').hide();
                                        $("#container-list").show();
                                        insertHexagon(data);
                                        $('#randomizer-holder').hide();
                                        break;
                                    case 3:
                                        $('#randomizer-holder').hide();
                                        $('#logo-holder').hide();
                                        $("#container-list").show();
                                        flyingHexagon(data);
                                        break;
                                    default:
                                        $('#randomizer-holder').hide();
                                        $('#logo-holder').hide();
                                        $("#container-list").show();
                                        jumbleWords(data);
                                }
                            }
                        }, 3100);
                    });

                    $('randomize-btn').click(function(){
                        document.getElementById('animation-css').remove();
                    });
                },
                dataType: "JSON"
            });
        }
    });

});


/* RANDOMIZER EFFECTS */

/* Honeycomb Effect */
// Creates the hexagon grid of volunteers
function insertHexagon(data) {
    var newline = true;
    var maxHexagon = 6;
    var minHexagon = maxHexagon-1;
    var limit = maxHexagon;
    var val = 6;

    $('#list').empty();
    for(var i = 0; i < data.length; i ++){
        $('#list').append(
            "<div class='card-grid' id='card-grid"+i +"'>" +
            "<div class='front'>" +
            "<div class='hexagon unflipped'>" +
            "<div class='hexTop'></div>"+
            "<div class='hexBottom'></div>"+
            "</div>"+
            "</div>"+
            "<div class='back'>"+
            "<div class='hexagon flipped' id='volunteer"+i+"'>"+
            "<div class='hexTop'></div>"+
            "<div class='hexBottom'></div>"+
            "</div>"+
            "<p class='volunteer-name'>"+data[i].last_name+"</p>"+

            "</div></div>"
        );
        $("#volunteer"+i).css("background-image", "url(" + data[i].picture + ")");

        if(i == limit){
            if(newline) newline = false;
            else newline = true;

            $("#card-grid"+i).css("clear", "left");
            if(val == maxHexagon) val = minHexagon;
            else val = maxHexagon;

            limit = limit + val;
        }


        if(newline) $("#card-grid" + i).css("left", "10%");
        else $("#card-grid" + i).css("left", "16%");
    }

     $("#start-again-div").css("position", "absolute");
     $("#start-again-div").css("bottom", "10%");
     $("#start-again-div").css("left", "40%");
     // Enable flip.js
    $(".card-grid").flip({
       forceWidth: true,
       forceHeight: true,
       trigger:"manual",
    });

    showVolunteers(data);
}

 // Shows volunteers one by one
function showVolunteers(data){
    var done = [];
    var int = setInterval(function(){
    var showHex = Math.floor((Math.random() * data.length));

    while($.inArray(showHex, done)!=-1){
        showHex = Math.floor((Math.random() * data.length));
    }
        $("#card-grid" + showHex).flip(true);
        done.push(showHex);
        if(done.length == data.length){
            clearInterval(int);
        }
    }, 1000);

}

/*
    -Randomizer effect that displays floating hexagons with picture
    -Followed by effects that display the names of the shown pictures
*/
function flyingHexagon(data) {
    $('#list').empty();
    $('#start-again-div').hide();

    var balloonDiv = $('<div id="balloonDiv"></div>')

    var container = $("#list");

    container.append(balloonDiv);

    var done = [];
    var x, randomBalloonNum, flag = 0;

    for(var index = 0; index < data.length; index++) {


        while(1) {
            flag = 0;
            randomBalloonNum = parseInt(Math.floor(Math.random() * 20 + 1));

            for(x = 0; x < done.length; x++) {
                if(done[x] == randomBalloonNum) {
                    flag = 1;
                    break;
                }
            }

            if(flag == 0) break;
        }

        done.push(randomBalloonNum);

        var outerDiv = $("<div></div>");
        outerDiv.addClass("balloon");
        outerDiv.addClass("balloon" + randomBalloonNum);
        outerDiv.attr('style', 'background-image: url("' + data[index].picture + '")');
        var hexTop = $("<div></div>");
        hexTop.addClass("hex2Top");

        var hexBottom = $("<div></div>");
        hexBottom.addClass("hex2Bottom");

        outerDiv.append(hexTop);
        outerDiv.append(hexBottom);
        balloonDiv.append(outerDiv);

    }

    setTimeout(function() {

        balloonDiv.fadeOut(13000, function() {
            balloonDiv.remove();

        });

    }, 10000);

    setTimeout(function() {

        flyingHexagon_after(data);

    }, 10000);

    setTimeout(function() {

        $('#start-again-div').fadeIn();
        $("#start-again-div").css("position", "relative");
        //$("#start-again-div").css("bottom", "10%");
        //$("#start-again-div").css("left", "40%");
        $("#list").css("left", "80%");

    }, 20000);
}

function flyingHexagon_after(data){

    $("#list").append("<h3>Volunteers</h3>")

    var i = 0;

    for(i = 0; i < data.length; i++){
        if(i%2 ==0){
            $("#list").append("<div><div class='listname_1' id='name"+i+"''> <h4>" + data[i].first_name + " " + data[i].last_name + "</h4> </div></div>");
        }
        else {
            $("#list").append("<div><div class='listname_2' id='name"+i+"''> <h4>" + data[i].first_name + " " + data[i].last_name + "</h4> </div></div>");
        }
    }

    for(i=0; i<data.length; i++){
        if(i%2==0){
            $("#name"+i).delay(i*1000).animate({
                left:'20%'
            }, 3000 );
        }
        else{
            $("#name"+i).delay(i*1000).animate({
                right:'20%'
            }, 3000 );
        }
    }
}

/* Zoom In Effect */
function zoomInImage(data){
    $("#list").empty();
    /*insert image here*/
    //hypothetical image

    var img = $("<img class='pic' length=3px width=5px>")
    img.attr("src", data[0].picture);

    $('#list').append(img);
    $('#list').append("<h3 class='name' style='display:none'>" + data[0].first_name + data[0].last_name + '</h3>');

    if(JSON.parse(localStorage.user).current_theme==1){
        $('.pic').css({
            "background-color":"rgb(89,168,15)"
        });
    }
    else if(JSON.parse(localStorage.user).current_theme==2){
        $('.pic').css({
            "background-color":"rgb(72,48,0)"
        });
    }
    else if(JSON.parse(localStorage.user).current_theme==3){
        $('.pic').css({
            "background-color":"rgb(28,11,43)"
        });
    }
    else if(JSON.parse(localStorage.user).current_theme==4){
        $('.pic').css({
            "background-color":"rgb(39,42,57)"
        });
    }
    else if(JSON.parse(localStorage.user).current_theme==0){
        $('.pic').css({
            "background-color":"#b42529"
        });
    }

    $(".pic").animate({
        width: "60%",
        heigth: "40%",
        opacity: 1,
        left: "15%",
        top:"10%",
        borderWidth: "10px"
    }, 3000);

    $(".pic").promise().done(function(){
        $('.name').show();
    });

}

function jumbleWords(data){
    var i=0;
    $("#list").empty();
    $("#list").append("<h3>Volunteers</h3>");

    for(i=0; i<data.length; i++){
        if(i%2==0){
            $("#list").append("<div><div class='listname1' id='name"+i+"''> <h4>" + data[i].first_name + " " + data[i].last_name + "</h4> </div></div>");
        }
        else {
            $("#list").append("<div><div class='listname2' id='name"+i+"''> <h4>" + data[i].first_name + " " + data[i].last_name + "</h4> </div></div>");
        }
    }

    $('h4').delay(200).animate({opacity:1.0});
    for(i=0; i<data.length; i++){
        if(i%2==0){
            $('#name'+i+' h4').textEffect({
                effect: "jumble",
                effectSpeed: 200
            });
        }
        else{
            $('#name'+i+' h4').textEffect({
                effect: "slide",
                effectSpeed: 200,
                reverse: true
            });
        }

    }
}
function enterName(data){
    var i=0;
    $("#list").empty();
    for(i=0; i<data.length; i++){
        if(i%2==0){
            $("#list").append("<div><div class='listname1' id='name"+i+"''> <h4>" + data[i].first_name + " " + data[i].last_name + "</h4> </div></div>");
        }
        else {
            $("#list").append("<div><div class='listname2' id='name"+i+"''> <h4>" + data[i].first_name + " " + data[i].last_name + "</h4> </div></div>");
        }
    }
    //var names = $('.name');
    $("h4").css({opacity:1});
    for(i=0; i<data.length; i++){
        if(i%2==0){
            $("#name"+i).delay(i*1000).animate({
                left:'20%'
            }, 3000 );
        }
        else{
            $("#name"+i).delay(i*1000).animate({
                right:'20%'
            }, 3000 );
        }
    }
}



function startHatch(data){
    $("#list").empty();
	var clist = document.getElementById("container-list");
	var i = 0;
	while(document.getElementById("list").firstChild){
    	document.getElementById("list").removeChild(document.getElementById("list").firstChild);
    }

	$(clist).prepend("<hr>");
	$(clist).prepend("<h2>Volunteers</h2>");
	$(clist).prepend("<br />");
	$(clist).prepend("<br />");
	$(clist).prepend("<br />");
	$("#arrows").fadeOut();
	hatch(data,i);
}

function hatch(data,i) {
	var container = document.getElementById("randomizer-holder");
	var clist = document.getElementById("container-list");
	var d1 = document.getElementById("dice1");
	var d2 = document.getElementById("dice2");
	var list = document.getElementById("list");
	var limit = $('#number-filter').val();

	container.className += " shake-slow shake-constant";

	setTimeout(function () {
		$("#dice1").css({
			"-webkit-transform":"translateX(-55px) rotate(-45deg)"
		});
		$("#dice2").css({
			"-webkit-transform":"translateX(65px) rotate(45deg)"
		})
		$("#randomizer-holder").attr('class','');
	},2100);

	$("#start-again").fadeOut();

	setTimeout(function() {
		$(clist).attr('style','display:block');
		var volunteer = document.createElement("div");

		if(i%2 == 0){
			$(volunteer).attr('style','background:#333333;color:white;width:90%;height:55px;position:relative;z-index:-1;margin:auto;display:block;');
		}else{
			$(volunteer).attr('style','background:#b42529;color:white;width:90%;height:55px;position:relative;z-index:-1;margin:auto;display:block;');
		}

		volunteer.className += "bouncing";

		var name_container = document.createElement("h4");
		name_container.innerHTML = data[0].first_name + " " + data[0].last_name;
		$(name_container).attr('style','margin:auto;text-align:center');

		var wspace = document.createElement("div");
		$(wspace).attr('style','width:100%;height:2.5px;color:blue;background:#4c4949;');

		volunteer.appendChild(wspace);
		volunteer.appendChild(name_container);
		container.appendChild(volunteer);
		$(volunteer).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',function(e) {
			container.removeChild(container.children[2]);
			$(volunteer).attr('class','');
			list.appendChild(volunteer);
	   		$("#dice1").css({
			"-webkit-transform":"translateX(0px) rotate(45deg)"
			});
			$("#dice2").css({
				"-webkit-transform":"translateX(0px) rotate(360deg)"
			});
			i++;
	   		hatchEnd(data,list.children.length,limit,i);
		});

	},2100);

}

function hatchEnd(data,len,limit,i){
	var rh = document.getElementById("container-list");
	if(len != limit){
		data.shift();
		hatch(data,i);
	}else{
		list.appendChild(document.createElement("br"));
		$('#start-again').fadeIn();
		$('#start-again').click(function(){
			$('#arrows').show();
			$('#randomizer-holder').hide();
        	while(document.getElementById("list").firstChild){
        		document.getElementById("list").removeChild(document.getElementById("list").firstChild);
        	}
        	$('br').remove();
        	$('h2').remove();
        	$('hr').remove();
		});
	}
}
