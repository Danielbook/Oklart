
define([
    'slide'
], function(
    slide
) {
    "use strict";

    /**
     * Constuctor for Slide
     * @param smhidata {data} - Data from SMHI
     * @constructor Slide
     */
    var Slide = function(smhidata) {

        this._data = smhidata;
        //this._sliderId = $("#bootslide");

        this._slider = "";

        //This is a time handler. It prints current day and hour for the slider
        this.dateHandler = new Date();
        this.weekday = new Array();
        this.weekday[0] = "Söndag";
        this.weekday[1] = "Måndag";
        this.weekday[2] = "Tisdag";
        this.weekday[3] = "Onsdag";
        this.weekday[4] = "Torsdag";
        this.weekday[5] = "Fredag";
        this.weekday[6] = "Lördag";

    };

    /**
     * Inits the slider
     * @memberof Slide
     * @function initSlider
     */
    Slide.prototype.initSlider = function(){

        this._slider = new Slider("#bootslide", {});
        // Sets the current day and time
        this._slider.tooltipInner.innerText = this.pad(this.dateHandler.getHours()) + ":00";
        document.getElementById("tid").innerHTML = this.pad(this.dateHandler.getHours()) + ":00";
        document.getElementById("dag").innerHTML = this.weekday[this.dateHandler.getUTCDay()];

        var that = this;
        //These functions display time and day chosen from slider value AND from position. "GÄVLE" is currently filler
        this._slider.on("slideStop", function(slideEvt) {
            var value = that._slider.getValue();
            that.dateHandler = that.getDate("Gävle", value );
            that.setSliderDate(that.dateHandler)
        });
        this._slider.on("slideStart", function(slideEvt){
            var value = that._slider.getValue();
            that.dateHandler = that.getDate("Gävle", value );
            that.setSliderDate(that.dateHandler)
        });

        this._slider.on("slide", function(slideEvt){
            var value = that._slider.getValue();
            that.dateHandler = that.getDate("Gävle", value );
            that.setSliderDate(that.dateHandler)
        });

        this._slider.on("change", function(slideEvt){
            var value = that._slider.getValue();
            updateTime(value);
            that.dateHandler = that.getDate("Gävle", value );
            that.setSliderDate(that.dateHandler)
        });
    };

    /**
     * Displays current time from slider values.
     * @memberof Slide
     * @function setSliderDate
     * @param dateHandler
     */
    Slide.prototype.setSliderDate = function (dateHandler){
        this._slider.tooltipInner.innerText = dateHandler[0];
        document.getElementById("tid").innerHTML = dateHandler[0];
        document.getElementById("dag").innerHTML = dateHandler[1];
    };

    /**
     * Returns time for a specified position
     * @memberof Slide
     * @function getDate
     * @param position {string}
     * @param timeIndex {int}
     * @returns {array} - Specified date[hour, day]
     */
    Slide.prototype.getDate = function(position, timeIndex){
        var pos = position.toLowerCase();
        var index = timeIndex;
        var counter = 0;

        for(var i = 0; i < this._data.length; i++) {
            if(pos == this._data[i].name.toLowerCase()){
                break;
            }
            counter += 1;
        }
        //Creates a specified Date with correct City and time index
        var temp = this._data[counter].timeseries[index].validTime;
        var date = new Date(temp);

        //Specified date-array: specDate[hour, day];
        var specDate = [this.pad(date.getUTCHours()) + ":00", this.weekday[date.getUTCDay()]];
        return specDate;
    };

    /**
     * Adds a 0 before the displayed hour if needed. E.g. 8:00 becomes 08:00.
     * @memberof Slide
     * @function Pad
     * @param n {string} - Hour
     * @returns {string} - Hour with a 0 before the time
     */
    Slide.prototype.pad = function (n) {return ("0" + n).slice(-2); };

    return Slide;
});
