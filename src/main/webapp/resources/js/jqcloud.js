/*!
 * jQCloud 2.0.3
 * Copyright 2011 Luca Ongaro (http://www.lucaongaro.eu)
 * Copyright 2013 Daniel White (http://www.developerdan.com)
 * Copyright 2014-2017 Damien "Mistic" Sorel (http://www.strangeplanet.fr)
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */
! function(a, b) {
    "function" == typeof define && define.amd ? define(["jquery"], b) :
        "object" == typeof module && module.exports ? module.exports = b(require("jquery")) : b(a.jQuery)
}(this, function(a) {
    "use strict";

    function b(a, b, c) {
        var d = {
            pid: null,
            last: 0
        };
        return function() {
            function e() {
                return d.last = (new Date).getTime(), a.apply(c || h, Array.prototype.slice.call(g))
            }
            var f = (new Date).getTime() - d.last,
                g = arguments,
                h = this;
            return f > b ? e() : (clearTimeout(d.pid), void(d.pid = setTimeout(e, b - f)))
        }
    }
    var c = function(b, c, d) {
        this.$element = a(b),
            this.word_array = c || [],
            this.options = d,
            this.sizeGenerator = null,
            this.colorGenerator = null,
            this.data = {
                placed_words: [],
                timeouts: {},
                namespace: null,
                step: null,
                angle: null,
                aspect_ratio: null,
                max_weight: null,
                min_weight: null,
                sizes: [],
                colors: []
            },
            this.initialize()
    };
    c.DEFAULTS = {
            width: 100,
            height: 100,
            center: {
                x: .5,
                y: .5
            },
            steps: 10,
            delay: null,
            shape: "elliptic",
            classPattern: "w{n}",
            encodeURI: !0,
            removeOverflowing: !0,
            afterCloudRender: null,
            autoResize: !1,
            colors: null,
            fontSize: null,
            template: null
        },
        c.prototype = {
            initialize: function() {
                if (this.options.width ? this.$element.width(this.options.width) :
                    this.options.width = this.$element.width(),
                    this.options.height ? this.$element.height(this.options.height) :
                    this.options.height = this.$element.height(),
                    this.options = a.extend(!0, {}, c.DEFAULTS, this.options),
                    null === this.options.delay && (this.options.delay = this.word_array.length > 50 ? 10 : 0),
                    this.options.center.x > 1 && (this.options.center.x = this.options.center.x / this.options.width,
                        this.options.center.y = this.options.center.y / this.options.height),
                    "function" == typeof this.options.colors) this.colorGenerator = this.options.colors;
                else if (a.isArray(this.options.colors)) {
                    var d = this.options.colors.length;
                    if (d > 0) {
                        if (d < this.options.steps)
                            for (var e = d; e < this.options.steps; e++)
                                this.options.colors[e] = this.options.colors[d - 1];
                        this.colorGenerator = function(a) {
                            return this.options.colors[this.options.steps - a]
                        }
                    }
                }
                if ("function" == typeof this.options.fontSize)
                    this.sizeGenerator = this.options.fontSize;
                else if (a.isPlainObject(this.options.fontSize)) this.sizeGenerator = function(a, b, c) {
                    var d = a * this.options.fontSize.from,
                        e = a * this.options.fontSize.to;
                    return Math.round(e + 1 * (d - e) / (this.options.steps - 1) * (c - 1)) + "px"
                };
                else if (a.isArray(this.options.fontSize)) {
                    var f = this.options.fontSize.length;
                    if (f > 0) {
                        if (f < this.options.steps)
                            for (var g = f; g < this.options.steps; g++)
                                this.options.fontSize[g] = this.options.fontSize[f - 1];
                        this.sizeGenerator = function(a, b, c) {
                            return this.options.fontSize[this.options.steps - c]
                        }
                    }
                }
                this.data.angle = 6.28 * Math.random(),
                    this.data.step = "rectangular" === this.options.shape ? 18 : 2,
                    this.data.aspect_ratio = this.options.width / this.options.height,
                    this.clearTimeouts(),
                    this.data.namespace = (this.$element.attr("id") || Math.floor(1e6 * Math.random()).toString(36)) + "_word_",
                    this.$element.addClass("jqcloud"),
                    "static" === this.$element.css("position") && this.$element.css("position", "relative"),
                    this.createTimeout(a.proxy(this.drawWordCloud, this), 10),
                    this.options.autoResize && a(window).on("resize." + this.data.namespace, b(this.resize, 50, this))
            },
            createTimeout: function(b, c) {
                var d = setTimeout(a.proxy(function() {
                    delete this.data.timeouts[d], b()
                }, this), c);
                this.data.timeouts[d] = !0
            },
            clearTimeouts: function() {
                a.each(this.data.timeouts, function(a) {
                    clearTimeout(a)
                }), this.data.timeouts = {}
            },
            overlapping: function(a, b) {
                return Math.abs(2 * a.left + a.width - 2 * b.left - b.width) < a.width + b.width && Math.abs(2 * a.top + a.height - 2 * b.top - b.height) < a.height + b.height
            },
            hitTest: function(a) {
                for (var b = 0, c = this.data.placed_words.length; b < c; b++)
                    if (this.overlapping(a, this.data.placed_words[b]))
                        return !0;
                return !1
            },
            drawWordCloud: function() {
                var a, b;
                if (this.$element.children('[id^="' + this.data.namespace + '"]').remove(), 0 !== this.word_array.length) {
                    for (a = 0, b = this.word_array.length; a < b; a++)
                        this.word_array[a].weight = parseFloat(this.word_array[a].weight, 10);
                    if (this.word_array.sort(function(a, b) {
                            return b.weight - a.weight
                        }),
                        this.data.max_weight = this.word_array[0].weight,
                        this.data.min_weight = this.word_array[this.word_array.length - 1].weight, this.data.colors = [],
                        this.colorGenerator)
                        for (a = 0; a < this.options.steps; a++)
                            this.data.colors.push(this.colorGenerator(a + 1));
                    if (this.data.sizes = [], this.sizeGenerator)
                        for (a = 0; a < this.options.steps; a++)
                            this.data.sizes.push(this.sizeGenerator(this.options.width, this.options.height, a + 1));
                    if (this.options.delay > 0) this.drawOneWordDelayed();
                    else {
                        for (a = 0, b = this.word_array.length; a < b; a++) this.drawOneWord(a, this.word_array[a]);
                        "function" == typeof this.options.afterCloudRender && this.options.afterCloudRender.call(this.$element)
                    }
                }
            },
            drawOneWord: function(b, c) {
                var d, e, f, g = this.data.namespace + b,
                    h = this.data.angle,
                    i = 0,
                    j = 0,
                    k = 0,
                    l = Math.floor(this.options.steps / 2);
                for (c.attr = a.extend({}, c.html, {
                        id: g
                    }),
                    this.data.max_weight != this.data.min_weight && (l = Math.round(1 * (c.weight - this.data.min_weight) * (this.options.steps - 1) / (this.data.max_weight - this.data.min_weight)) + 1),
                    d = a("<span>").attr(c.attr),
                    d.addClass("jqcloud-word"),
                    this.options.classPattern && d.addClass(this.options.classPattern.replace("{n}", l)),
                    this.data.colors.length && d.css("color",
                        this.data.colors[l - 1]),
                    c.color && d.css("color", c.color),
                    this.data.sizes.length && d.css("font-size", this.data.sizes[l - 1]),
                    this.options.template ? d.html(this.options.template(c)) : c.link ? ("string" == typeof c.link && (c.link = {
                            href: c.link
                        }),
                        this.options.encodeURI && (c.link.href = encodeURI(c.link.href).replace(/'/g, "%27")),
                        d.append(a("<a>").attr(c.link).text(c.text))) : d.text(c.text),
                    c.handlers && d.on(c.handlers),
                    this.$element.append(d),
                    e = {
                        width: d.outerWidth(),
                        height: d.outerHeight()
                    },
                    e.left = this.options.center.x * this.options.width - e.width / 2,
                    e.top = this.options.center.y * this.options.height - e.height / 2, f = d[0].style,
                    f.position = "absolute",
                    f.left = e.left + "px",
                    f.top = e.top + "px"; this.hitTest(e);) {
                    if ("rectangular" === this.options.shape)
                        switch (j++, j * this.data.step > (1 + Math.floor(k / 2)) * this.data.step * (k % 4 % 2 === 0 ? 1 : this.data.aspect_ratio) && (j = 0, k++), k % 4) {
                            case 1:
                                e.left += this.data.step * this.data.aspect_ratio + 2 * Math.random();
                                break;
                            case 2:
                                e.top -= this.data.step + 2 * Math.random();
                                break;
                            case 3:
                                e.left -= this.data.step * this.data.aspect_ratio + 2 * Math.random();
                                break;
                            case 0:
                                e.top += this.data.step + 2 * Math.random()
                        }
                    else i += this.data.step,
                        h += (b % 2 === 0 ? 1 : -1) * this.data.step,
                        e.left = this.options.center.x * this.options.width - e.width / 2 + i * Math.cos(h) * this.data.aspect_ratio,
                        e.top = this.options.center.y * this.options.height + i * Math.sin(h) - e.height / 2;
                    f.left = e.left + "px", f.top = e.top + "px"
                }
                return this.options.removeOverflowing && (e.left < 0 || e.top < 0 || e.left + e.width > this.options.width || e.top + e.height > this.options.height) ? void d.remove() :
                    (this.data.placed_words.push(e),
                        void("function" == typeof c.afterWordRender && c.afterWordRender.call(d)))
            },
            drawOneWordDelayed: function(b) {
                return b = b || 0, this.$element.is(":visible") ? void(b < this.word_array.length ? (this.drawOneWord(b, this.word_array[b]),
                        this.createTimeout(a.proxy(function() {
                                this.drawOneWordDelayed(b + 1)
                            }, this),
                            this.options.delay)) : "function" == typeof this.options.afterCloudRender && this.options.afterCloudRender.call(this.$element)) :
                    void this.createTimeout(a.proxy(function() {
                        this.drawOneWordDelayed(b)
                    }, this), 10)
            },
            destroy: function() {
                this.options.autoResize && a(window).off("resize." + this.data.namespace),
                    this.clearTimeouts(), this.$element.removeClass("jqcloud"),
                    this.$element.removeData("jqcloud"),
                    this.$element.children('[id^="' + this.data.namespace + '"]').remove()
            },
            update: function(a) {
                this.word_array = a, this.data.placed_words = [],
                    this.clearTimeouts(),
                    this.drawWordCloud()
            },
            resize: function() {
                var a = {
                    width: this.$element.width(),
                    height: this.$element.height()
                };
                a.width == this.options.width && a.height == this.options.height || (this.options.width = a.width, this.options.height = a.height, this.data.aspect_ratio = this.options.width / this.options.height, this.update(this.word_array))
            }
        },
        a.fn.jQCloud = function(b, d) {
            var e = arguments;
            return this.each(function() {
                var f = a(this),
                    g = f.data("jqcloud");
                if (g || "destroy" !== b)
                    if (g) "string" == typeof b && g[b].apply(g, Array.prototype.slice.call(e, 1));
                    else {
                        var h = "object" == typeof d ? d : {};
                        f.data("jqcloud", g = new c(this, b, h))
                    }
            })
        },
        a.fn.jQCloud.defaults = {
            set: function(b) {
                a.extend(!0, c.DEFAULTS, b)
            },
            get: function(b) {
                var d = c.DEFAULTS;
                return b && (d = d[b]),
                    a.extend(!0, {}, d)
            }
        }
});