/*global logger*/
/*
    Countdown
    ========================

    @file      : Countdown.js
    @version   : 1.0.0
    @author    : Mendix community
    @date      : 2016-12-12
    @copyright : Mendix Community
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "Countdown/lib/jquery-1.11.2",
    "dojo/text!Countdown/widget/template/Countdown.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    // Declare widget's prototype.
    return declare("Countdown.widget.Countdown", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        inputNodes: null,
        countDownDateInputNode: null,

        // Parameters configured in the Modeler.
        countDownDate: "",
		microflow: "",
		message: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,
        _readOnly: false,
		_timer: null,

		// Parameters configured in the Modeler.
        interval: 1000,
		intervalAfterCountDown: 0,
        _timeout: null,
        _timerStarted: false,
		_updatedClock: false,
		
        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            logger.debug(this.id + ".constructor");
            this._handles = [];
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            if (!this._timerStarted) {
                this._runTimer();
            }

            callback();
        },

        resize: function (box) {},

        uninitialize: function () {
            this._stopTimer();
        },

        _runTimer: function () {
            logger.debug(this.id + "._runTimer", this.interval);
            if (this.countDownDate !== "" && this._contextObj) 
			{
                this._timerStarted = true;
                this._timer = setInterval(dojoLang.hitch(this, this._updateClock), this.interval);
            }
        },

        _stopTimer: function () 
		{
            logger.debug(this.id + "._stopTimer");
            if (this._timer !== null) {
                logger.debug(this.id + "._stopTimer timer cleared");
                clearInterval(this._timer);
                this._timer = null;
            }
            if (this._timeout !== null) {
                logger.debug(this.id + "._stopTimer timeout cleared");
                clearTimeout(this._timeout);
                this._timeout = null;
            }
        }, 
		
		_getTimeRemaining: function(endtime) {
			logger.debug(this.id + "._getTimeRemaining");
			  var t = Date.parse(endtime) - Date.parse(new Date());
			  var seconds = Math.floor((t / 1000) % 60);
			  var minutes = Math.floor((t / 1000 / 60) % 60);
			  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
			  var days = Math.floor(t / (1000 * 60 * 60 * 24));
			  return {
				'total': t,
				'days': days,
				'hours': hours,
				'minutes': minutes,
				'seconds': seconds
			  };
		  }, 
			
		_execMf: function () {
            logger.debug(this.id + "._execMf");
			
            if (this._contextObj && this.microflow !== "") {
              mx.data.action({
                  params: {
                      applyto: "selection",
                      actionname: this.microflow,
                      guids: [this._contextObj.getGuid()]
                  },
                  store: {
                      caller: this.mxform
                  },
                  callback: dojoLang.hitch(this, function (result) {
                      if (!result) {
                          logger.debug(this.id + "._execMf callback");
                      }
                  }),
                  error: function (error) {
                      console.warn("Error executing mf: ", error);
                  }
              });
            }
        },
		
        _updateClock: function () {
            logger.debug(this.id + "._updateClock");

            if (this._contextObj && this.countDownDate !== "") 
			{				
				var countDownDate = this._contextObj.get(this.countDownDate);
				var valueString;
				 if (this.countDownDate !== ""){
					valueString = mx.parser.formatAttribute(this._contextObj, this.countDownDate, {
						datePattern: "yyyy-MM-dd HH:mm:ss"
					});
										
					var t = this._getTimeRemaining(new Date(Date.parse(valueString)));
					
					if (t.total <= 0) 
					{
						logger.debug(this.id + "total: " + t.total);
						this.countDownDateInputNode.innerHTML  = "0 d 0 h 0 m 0 s";
						this._stopTimer();
						
						//only execute when you have seen the countdown.
						if (this._updatedClock == true )
						{
							//set the optional text
							if( this.message !== "")
							{
								this.countDownDateInputNode.innerHTML  = this.message;
							}
							//execute after several ms if set > 0
							var that = this;
							logger.debug(this.id + ".wait for "+this.intervalAfterCountDown+" ms");
							//var exe = setTimeout(that._execMf(), 3000);
							
							setTimeout(function(){that._execMf()}, this.intervalAfterCountDown);
							
						}
					}	
					else
					{
						this.countDownDateInputNode.innerHTML  =  t.days + " d " +  t.hours + " h " +   t.minutes + " m " + t.seconds  + " s";	
						this._updatedClock = true;
					}
				 }
            }
        }
		

    });
});
