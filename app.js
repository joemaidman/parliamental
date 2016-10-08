//Global variables
var listOfConstits;
var partyFilter;
var country;
var gender;
var averageAge;
var maxSeats = 651;
var minSeats = 1;
var maxAge = 120;
var minAge = 18;
var isInitialRun = true;
var countMale = 0;
var countFemale = 0;
var genderRatio = 0;
var countEnglish = 0;
var countOther = 0;
var countryRatio = 0;
var jsonObjMembers = [];
var jsonObjPieData = [];
var ages = [];
var partyColours = {};
var url;
var myPie;

//**MAIN APP LOOP**

//Set-up the UI
initialiseUI();

//Run the main function
main();

//Set-up sliders and JSON party colours
function initialiseUI() {
    inisialiseSliders();
    setPartyColours();
}

//Main function to retrieve and process data
function main() {
    fetchData();
}

//**MAIN LOGIC FUNCTIONS**

//AJAX request to fetch data from API.
function fetchData() {
    url = "http://data.parliament.uk/membersdataplatform/services/mnis/members/query/house=Commons|IsEligible=true";
    country = document.getElementById('cbCountry').text.trim();
    gender = document.getElementById('cbGender').text.trim();
    partyFilter = document.getElementById('cbParty').text.trim();

    if (country != "Select country" && country != "All") {

        url = url + "|constituencyinarea=" + country;

    }

    if (gender == "Male") {

        url = url + "|Gender=M";

    } else if (gender == "Female") {

        url = url + "|Gender=F";
    }

    if (partyFilter != "Select party" && partyFilter != "All") {

        url = url + "|Party=" + partyFilter;

    }

    if (minAge > 18 || maxAge < 120) {

        url = url + "|Age>" + minAge + "|Age<" + maxAge;

    }

    if (isInitialRun === true) {
        $.ajax({
            url: "constits.json",
            dataType: 'json',
            success: function(data) {

                listOfConstits = data;
            }
        });
    }

    $.ajax({
        url: url,
        dataType: 'xml',
        success: function(results) {

            processResults($(results));
        },
        failure: function(results) {
            alert("An error occurred accessing the API");

        }
    });

}

//Sets the party colours as an array. Sourced from Wikipedia: https://en.wikipedia.org/wiki/Wikipedia:Index_of_United_Kingdom_political_parties_meta_attributes
function setPartyColours() {

    partyColours['Conservative'] = '#0087DC';
    partyColours['Labour'] = '#DC241f';
    partyColours['Scottish National Party'] = '#FFFF00';
    partyColours['Labour (Co-op)'] = '#CC0000';
    partyColours['Speaker'] = "White";
    partyColours['Sinn Fein'] = '#008800';
    partyColours['Democratic Unionist Party'] = '#D46A4C';
    partyColours['Liberal Democrat'] = '#FDBB30';
    partyColours['UK Independence Party'] = '#70147A';
    partyColours['Social Democratic & Labour Party'] = '#99FF66';
    partyColours['Plaid Cymru'] = '#008142';
    partyColours['Ulster Unionist Party'] = '#9999FF';
    partyColours['Independent'] = '#DDDDDD';
    partyColours['Green Party'] = '#6AB023';

}

//If the AJAX request is successful, this function is called to process the results
function processResults(inputList) {
    //Reset global variables for next run
    jsonObjMembers = [];
    jsonObjPieData = [];
    ages = [];
    countFemale = 0;
    countMale = 0;
    countEnglish = 0;
    countOther = 0;
    countryRatio = 0;
    genderRatio = 0;

    $(inputList).find("Member").each(function() {

        var id = $(this).attr("Member_Id");
        var name = $(this).find("DisplayAs").text();
        var party = $(this).find("Party").text();
        var dob = $(this).find("DateOfBirth").text();
        var age = moment().diff(dob, 'years');
        var gender = $(this).find("Gender").text();
        var constit = $(this).find("MemberFrom").text();   

        var item = {};
        item["id"] = id;
        item["name"] = name;
        item["party"] = party;
        item["age"] = age;
        item["gender"] = gender;
        item["Constit"] = constit;

        //Push the MP to the array
        jsonObjMembers.push(item);

    });

    for (var counter = 0; counter < jsonObjMembers.length; counter++) {
        var partyIsThere = false;
        var partyToCheck = jsonObjMembers[counter].party;

        for (var pieCounter = 0; pieCounter < jsonObjPieData.length; pieCounter++) {
            if (jsonObjPieData[pieCounter].label == partyToCheck) {
                partyIsThere = true;
                jsonObjPieData[pieCounter].value++;
            }
        }

        if (partyIsThere === false) {
            var item2 = {};
            item2["label"] = partyToCheck;
            item2["value"] = 1;
            item2["color"] = partyColours[partyToCheck];

            jsonObjPieData.push(item2);
        }

    }

    $(jsonObjPieData).each(function() {
        var self = this;
        var counterB = Object.getOwnPropertyDescriptor(self, "value");
        var partyOfPie = Object.getOwnPropertyDescriptor(self, "label");

        if (counterB.value < minSeats || counterB.value > maxSeats) {
            var i = jsonObjPieData.indexOf(self);
            if (i != -1) {
                jsonObjPieData.splice(i, 1);


                $(jsonObjMembers).each(function() {
                    var self2 = this;
                    var partyOfMember = Object.getOwnPropertyDescriptor(self2, "party");
                    if (partyOfMember.value == partyOfPie.value) {

                        var j = jsonObjMembers.indexOf(self2);
                        if (j != -1) {
                            jsonObjMembers.splice(j, 1);
                        }
                    }
                });
            }
        }
    });

    $(jsonObjMembers).each(function() {

        var Findage = Object.getOwnPropertyDescriptor(this, "age");
        var Findgender = Object.getOwnPropertyDescriptor(this, "gender");
        var Findconstit = Object.getOwnPropertyDescriptor(this, "Constit");
        var Findage = Object.getOwnPropertyDescriptor(this, "age");
        var foundConstit = find(listOfConstits, "Constit", Findconstit.value);
       
        if (foundConstit === true) {
            countEnglish++;
        }

        if (Findgender.value == "M") {
            countMale++;
        } else {
            countFemale++;
        }

        var ageIsNumber = isNaN(Findage.value);

        if (ageIsNumber === false) {
            ages.push(Findage.value);
        }
    });

    if (countEnglish == 0) {
        countryRatio = 0;
    } else if (jsonObjMembers.length == 0) {

        countryRatio = 1;
    } else {

        countryRatio = round(countEnglish / jsonObjMembers.length, 2);
    }
    if (countFemale == 0) {

        genderRatio = 0;

    } else if (countMale == 0) {

        genderRatio = 1;

    } else {

        genderRatio = round(countFemale / countMale, 2);
    }

    if (ages.length == 0) {
        averageAge = 0;

    } else {
        averageAge = round(ages.reduce(function(v1, v2) {
            return v1 + v2;
        }, 0) / ages.length, 0);

    }

    var countSeats = 0;
    $(jsonObjPieData).each(function() {

        var countCurr = Object.getOwnPropertyDescriptor(this, "value");

        countSeats += countCurr.value;
    });

    document.getElementById("noMembers").innerHTML = countSeats + " MPs (" + round((countSeats / 650) * 100, 1) + "%)";

    jsonObjPieData.sort(compareByValueDes);

    if (isInitialRun === true) {
        $(jsonObjPieData).each(function() {

            var nameParty = Object.getOwnPropertyDescriptor(this, "label");

            if (nameParty.value != "Labour (Co-op)") {
                var dd = document.getElementById("ddParties");

                dd.innerHTML = dd.innerHTML + "<li><a>" + nameParty.value + "</a></li>";
            }
        });
    }

    if (isInitialRun === false) {
        myPie.destroy();
    }

    jsonObjPieData.sort(compareByValueAsc);

    if (jsonObjPieData.length == 0) {

        var canvas = document.getElementById("myChart");
        var ctx = canvas.getContext("2d");
        ctx.textBaseline = 'middle';
        ctx.textAlign = "center";
        var textString = "No MPs returned";
        var x = canvas.width / 2;
        var y = canvas.height / 2;
        ctx.fillStyle = "White";
        ctx.font = '16px Lato';
        ctx.lineWidth = 1;
        ctx.fillText(textString, x, y);
    } else {
        var canvas = document.getElementById("myChart");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        myPie = new Chart(ctx).Doughnut(jsonObjPieData, {
            animationSteps: 75,
            animationEasing: 'easeOutQuart',
            percentageInnerCutout: 50,
            segmentStrokeWidth: 1,
            segmentStrokeColor: '#222222'
        });
    }

    //Redundant code to handle pie chart clicks
    //if (isInitialRun === true) {
    //    canvas.addEventListener('click', function(evt) {
    //        var segmentsInRange = window.myPie.getSegmentsAtEvent(evt);
    //        segmentsInRange.forEach(function(segment) {
    //            alert(segment.label);
    //        });
    //    });
    //}

    isInitialRun = false;
    drawSummaryGauges();
    initialisePartyDropdown();

}

//**GENERIC FUNCTIONS**

//Round a decimal
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

//Sort values ascending
function compareByValueAsc(a, b) {
    if (a.value < b.value)
        return -1;
    if (a.value > b.value)
        return 1;
    return 0;
}

//Sort values descending
function compareByValueDes(a, b) {
    if (a.value > b.value)
        return -1;
    if (a.value < b.value)
        return 1;
    return 0;
}

// Find array element which has a key value of val
function find(arr, key, val) {
    for (var ai, i = arr.length; i--;)
        if ((ai = arr[i]) && ai[key] == val)
            return true;
    return false;
}

//**CONTROL INITIALISE FUNCTIONS**

//Set-up sliders
function inisialiseSliders() {

    $("#slider-range-age").slider({
        range: true,
        values: [18, 120],
        min: 18,
        max: 120,
        step: 1,
        slide: function(event, ui) {

            document.getElementById("agerange").innerHTML = ui.values[0] + "-" + ui.values[1]
            minAge = ui.values[0];
            maxAge = ui.values[1];
        }
    });

    $("#slider-range-seats").slider({
        range: true,
        values: [1, 650],
        min: 1,
        max: 650,
        step: 1,
        slide: function(event, ui) {

            document.getElementById("seatrange").innerHTML = ui.values[0] + "-" + ui.values[1]
            minSeats = ui.values[0];
            maxSeats = ui.values[1];
        }
    });

}

//Sets behaviour for party filter dropdown menu
function initialisePartyDropdown() {

    $(".dropdown-menu li a").click(function() {
        var selText = $(this).text();
        $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
    });

}

//Draws three summary gauges at bottom of page with calculated values
function drawSummaryGauges() {

    $("#gauge1").gauge(averageAge, {

        // Minimum value to display
        min: 0,

        // Maximum value to display
        max: 100,

        // Unit to be displayed after the value
        unit: " yrs",

        // colour for the value and bar
        color: "white",

        // calpha colour
        colorAlpha: 1,

        // background colour of bar
        bgcolor: "#222",

        // default or halfcircle
        type: "halfcircle"

    });

    $("#gauge2").gauge(genderRatio, {

        // Minimum value to display
        min: 0,

        // Maximum value to display
        max: 1,

        // Unit to be displayed after the value
        unit: " x",

        // colour for the value and bar
        color: "white",

        // calpha colour
        colorAlpha: 1,

        // background colour of bar
        bgcolor: "#222",

        // default or halfcircle
        type: "halfcircle",

    });

    $("#gauge3").gauge(countryRatio, {

        // Minimum value to display
        min: 0,

        // Maximum value to display
        max: 1,

        // Unit to be displayed after the value
        unit: " x",

        // colour for the value and bar
        color: "white",

        // calpha colour
        colorAlpha: 1,

        // background colour of bar
        bgcolor: "#222",

        // default or halfcircle
        type: "halfcircle",

        font: '5pt verdana',

    });

}