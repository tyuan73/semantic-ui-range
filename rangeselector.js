/*!
 * # Range slider for Semantic UI.
 *
 */

;
(function($, window, document, undefined) {

    "use strict";

    $.fn.range = function(parameters) {

        var
            $allModules = $(this),

            offset = 10,
            html = [
                "<div class='inner'>",
                "<i class='step backward icon'></i>", // step backward/reset "start" icon
                "<div class='track'></div>", // backgroud
                "<div class='track-fill'></div>", // track range line
                "<div class='thumb start'></div>", // start thumb
                "<div class='thumb end'></div>", // end thumb
                "<i class='step forward icon'></i>", // step forward/reset "end" icon
                "<div class='ui form'>",
                "<input type='text' class='start'>", // input for start value
                "<i class='start caret up icon'></i>", // increase start value
                "<i class='start caret down icon'></i>", // decrease start value
                "<input type='text' class='end'>", // input for end value
                "<i class='end caret up icon'></i>", // increase end value
                "<i class='end caret down icon'></i>", // decrease end value
                "</div>",
                "</div>"
            ],

            query = arguments[0],
            methodInvoked = (typeof query == 'string'),
            queryArguments = [].slice.call(arguments, 1);

        $allModules
            .each(function() {

                var
                    settings = ($.isPlainObject(parameters)) ?
                    $.extend(true, {}, $.fn.range.settings, parameters) :
                    $.extend({}, $.fn.range.settings),

                    namespace = settings.namespace,
                    min = settings.min,
                    max = settings.max,
                    step = settings.step,
                    start = settings.start,
                    end = settings.end,

                    eventNamespace = '.' + namespace,
                    moduleNamespace = 'module-' + namespace,

                    $module = $(this),

                    element = this,
                    instance = $module.data(moduleNamespace),

                    interval,

                    track,
                    thumbEnd,
                    thumbStart,
                    trackRange,
                    precision,
                    inputStart,
                    inputEnd,

                    module;

                module = {

                    initialize: function() {
                        module.instantiate();
                        module.sanitize();
                    },

                    instantiate: function() {
                        instance = module;
                        $module.data(moduleNamespace, module);
                        $(element).html(html.join(""));
                        track = $(element).find('.track')[0];
                        thumbEnd = $(element).find('.thumb.end')[0];
                        thumbStart = $(element).find('.thumb.start')[0];
                        trackRange = $(element).find('.track-fill')[0];
                        inputStart = $(element).find('input.start')[0];
                        inputEnd = $(element).find('input.end')[0];
                        // find precision of step, used in calculating the value
                        module.determinePrecision();
                        // set default start and end
                        module.setValue();
                        // event listeners
                        $(thumbStart).on('mousedown', function(event, originalEvent) {
                            module.rangeMousedown(event, false, true, originalEvent);
                        });
                        $(thumbStart).on('touchstart', function(event, originalEvent) {
                            module.rangeMousedown(event, true, true, originalEvent);
                        });
                        $(thumbEnd).on('mousedown', function(event, originalEvent) {
                            module.rangeMousedown(event, false, false, originalEvent);
                        });
                        $(thumbEnd).on('touchstart', function(event, originalEvent) {
                            module.rangeMousedown(event, true, false, originalEvent);
                        });
                        var icon = $(element).find('i.step.backward.icon')[0];
                        $(icon).click(function() {
                            if ($(element).hasClass('disabled')) return;
                            module.setValue(settings.min, null);
                        });
                        icon = $(element).find('i.step.forward.icon')[0];
                        $(icon).click(function() {
                            if ($(element).hasClass('disabled')) return;
                            module.setValue(null, settings.max);
                        });
                        icon = $(element).find('i.start.up.icon')[0];
                        $(icon).mousedown(function() {
                            if ($(element).hasClass('disabled')) return;
                            interval = setInterval(function() {
                                module.changeValue(true, true);
                            }, 100);
                        }).mouseup(function() {
                            clearInterval(interval);
                        });
                        icon = $(element).find('i.start.down.icon')[0];
                        $(icon).mousedown(function() {
                            if ($(element).hasClass('disabled')) return;
                            interval = setInterval(function() {
                                module.changeValue(true, false);
                            }, 100);
                        }).mouseup(function() {
                            clearInterval(interval);
                        });
                        icon = $(element).find('i.end.up.icon')[0];
                        $(icon).mousedown(function() {
                            if ($(element).hasClass('disabled')) return;
                            interval = setInterval(function() {
                                module.changeValue(false, true);
                            }, 100);
                        }).mouseup(function() {
                            clearInterval(interval);
                        });
                        icon = $(element).find('i.end.down.icon')[0];
                        $(icon).mousedown(function() {
                            if ($(element).hasClass('disabled')) return;
                            interval = setInterval(function() {
                                module.changeValue(false, false);
                            }, 100);
                        }).mouseup(function() {
                            clearInterval(interval);
                        });
                    },

                    sanitize: function() {
                        if (typeof settings.min != 'number') {
                            settings.min = parseInt(settings.min) || 0;
                        }
                        if (typeof settings.max != 'number') {
                            settings.max = parseInt(settings.max) || false;
                        }
                        if (typeof settings.start != 'number') {
                            settings.start = parseInt(settings.start) || 0;
                        }
                        if (typeof settings.end != 'number') {
                            settings.end = parseInt(settings.end) || false;
                        }
                    },

                    determinePrecision: function() {
                        var split = String(settings.step).split('.');
                        var decimalPlaces;
                        if (split.length == 2) {
                            decimalPlaces = split[1].length;
                        } else {
                            decimalPlaces = 0;
                        }
                        precision = Math.pow(10, decimalPlaces);
                    },

                    determineValue: function(startPos, endPos, currentPos) {
                        if (currentPos >= endPos) return settings.max;
                        if (currentPos <= startPos) return settings.min;

                        var ratio = (currentPos - startPos) / (endPos - startPos);
                        var range = settings.max - settings.min;
                        var difference = Math.round(ratio * range / step) * step;
                        // Use precision to avoid ugly Javascript floating point rounding issues
                        // (like 35 * .01 = 0.35000000000000003)
                        difference = Math.round(difference * precision) / precision;
                        return difference + settings.min;
                    },

                    changeValue: function(isStart, inc) {
                        if (isStart) {
                            if (inc)
                                start = start + step > end ? end : start + step;
                            else
                                start = start - step < settings.min ? settings.min : start - step;
                        } else {
                            if (inc)
                                end = end + step > settings.max ? settings.max : end + step;
                            else
                                end = end - step < start ? start : end - step;
                        }
                        module.setValue();
                    },

                    determinePosition: function(value) {
                        var ratio = (value - settings.min) / (settings.max - settings.min);
                        return Math.round(ratio * $(track).width()) + $(track).position().left;
                    },

                    refreshPosition: function() {
                        var leftPos = module.determinePosition(start);
                        var rightPos = module.determinePosition(end);

                        $(thumbStart).css({
                            left: String(leftPos - offset) + 'px'
                        });
                        $(trackRange).css({
                            left: String(leftPos) + 'px',
                            width: String(rightPos - leftPos) + 'px'
                        });
                        $(thumbEnd).css({
                            left: String(rightPos - offset) + 'px'
                        });
                    },

                    setValue: function(val1, val2) {
                        start = val1 == null ? start : val1;
                        end = val2 || end;
                        module.refreshPosition();
                        module.displayValue();
                    },

                    displayValue: function() {
                        $(inputStart).val(start);
                        $(inputEnd).val(end);
                        if (settings.onChange) {
                            settings.onChange();
                        }
                    },

                    rangeMousedown: function(mdEvent, isTouch, isStart, originalEvent) {
                        if ($(element).hasClass('disabled')) return;

                        mdEvent.preventDefault();
                        var left = $(track).offset().left;
                        var right = left + $(track).width();
                        /*
                        var pageX;
                        if (isTouch) {
                            pageX = originalEvent.originalEvent.touches[0].pageX;
                        } else {
                            pageX = (typeof mdEvent.pageX != 'undefined') ? mdEvent.pageX : originalEvent.pageX;
                        }
                        var value = module.determineValue(left, right, pageX);
                        if (isStart) {
                            module.setValue(value > end ? end : value, null);
                        } else {
                            module.setValue(null, value < start ? start : value);
                        }
                        */

                        var rangeMousemove = function(mmEvent) {
                            var pageX;
                            mmEvent.preventDefault();
                            if (isTouch) {
                                pageX = mmEvent.originalEvent.touches[0].pageX;
                            } else {
                                pageX = mmEvent.pageX;
                            }
                            var value = module.determineValue(left, right, pageX);
                            if (isStart) {
                                module.setValue(value > end ? end : value, null);
                            } else {
                                module.setValue(null, value < start ? start : value);
                            }
                        }
                        var rangeMouseup = function(muEvent) {
                            if (isTouch) {
                                $(document).off('touchmove', rangeMousemove);
                                $(document).off('touchend', rangeMouseup);
                            } else {
                                $(document).off('mousemove', rangeMousemove);
                                $(document).off('mouseup', rangeMouseup);
                            }
                        }
                        if (isTouch) {
                            $(document).on('touchmove', rangeMousemove);
                            $(document).on('touchend', rangeMouseup);
                        } else {
                            $(document).on('mousemove', rangeMousemove);
                            $(document).on('mouseup', rangeMouseup);
                        }
                    },

                    setEndValuePosition: function(val) {
                        if (val === parseInt(val, 10) && val <= settings.max && val >= start)
                            module.setValue(null, val);
                    },

                    setStartValuePosition: function(val) {
                        if (val === parseInt(val, 10) && val >= settings.min && val <= end)
                            module.setValue(val, null);
                    },

                    invoke: function(query) {
                        switch (query) {
                            case 'set end value':
                                if (queryArguments.length > 0) {
                                    instance.setEndValuePosition(queryArguments[0]);
                                }
                                break;
                            case 'set start value':
                                if (queryArguments.length > 0) {
                                    instance.setStartValuePosition(queryArguments[0]);
                                }
                                break;
                            case 'get value':
                                return {
                                    start: start,
                                    end: end
                                };
                                break;
                        }
                    },

                };

                if (methodInvoked) {
                    if (instance === undefined) {
                        module.initialize();
                    }
                    module.invoke(query);
                } else {
                    module.initialize();
                }

            });

        return this;

    };

    $.fn.range.settings = {

        name: 'Range',
        namespace: 'range',

        min: 0,
        max: false,
        step: 1,
        start: 0,
        end: false,

        onChange: function(value) {},

    };


})(jQuery, window, document);
