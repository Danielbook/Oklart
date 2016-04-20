"use strict";

define(['slider'],
    function(
        slider
    ){
        var Slider = function(smhidata){

            this._sliderId = $("#bootslide");
            this._data = smhidata;
            this._slider = new Slider('#_sliderId', {});

            //This is a time handler. It prints current day and hour for the slider
            this.dateHandler = new Date();
            var weekday = new Array();
            weekday[0] = "Söndag";
            weekday[1] = "Måndag";
            weekday[2] = "Tisdag";
            weekday[3] = "Onsdag";
            weekday[4] = "Torsdag";
            weekday[5] = "Fredag";
            weekday[6] = "Lördag";

            // Sets the current day and time
            this._slider.tooltipInner.innerText = pad(dateHandler.getHours()) + ":00";
            document.getElementById("tid").innerHTML = pad(dateHandler.getHours()) + ":00";
            document.getElementById("dag").innerHTML = weekday[dateHandler.getUTCDay()];

            //These functions display time and day chosen from slider value AND from position. "GÄVLE" is currently filler
            this._slider.on = function(smhidata) {
                this._slider.on("slideStop", function(slideEvt) {
                    var sliderValue = slider.getValue();
                    this.dateHandler = getDate("Gävle", sliderValue );
                    setSliderDate(dateHandler)
                });
            };
            this._slider.on("slideStart", function(slideEvt){
                var sliderValue = slider.getValue();
                this.dateHandler = getDate("Gävle", sliderValue );
                setSliderDate(dateHandler)
            });

            this._slider.on("slide", function(slideEvt){
                var sliderValue = slider.getValue();
                this.dateHandler = getDate("Gävle", sliderValue );
                setSliderDate(dateHandler)
            });

            this._slider.on("change", function(slideEvt){
                var sliderValue = slider.getValue();
                this.dateHandler = getDate("Gävle", sliderValue );
                setSliderDate(dateHandler)
            });

            //This function adds a 0 before the displayed hour if needed. E.g. 8:00 becomes 08:00.
            function pad(n) {return ("0" + n).slice(-2); }


            //This function returns time for a specified position. (String position, int timeIndex).
            function getDate(position,timeIndex){
                var pos = position.toLowerCase();
                var index = timeIndex;
                var counter = 0;

                for(var i = 0; i < _data.length; i++) {
                    if(pos == _data[i].name.toLowerCase()){
                        break;
                    }
                    counter += 1;
                }
                //Creates a specified Date with correct City and time index
                var date = new Date(_data[counter].timeseries[index].validTime);

                //Specified date-array: specDate[hour, day];
                var specDate = [pad(date.getUTCHours()) + ":00", weekday[date.getUTCDay()]];
                return specDate;
            }

            //This function displays current time from slider values.
            function setSliderDate(dateHandler){
                this._slider.tooltipInner.innerText = dateHandler[0];
                document.getElementById("tid").innerHTML = dateHandler[0];
                document.getElementById("dag").innerHTML = dateHandler[1];
            }

        };

        return Slider;
    });