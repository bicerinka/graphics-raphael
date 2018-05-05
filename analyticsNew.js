Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color) {
    color = color || "#000";
    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        rowHeight = h / hv,
        columnWidth = w / wv;
    for (var i = 1; i < hv; i++) {
        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
    }
    for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
    }

    return this.path(path.join(",")).attr({stroke: color});
};

Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

window.onload = function () {
    // console.log(555);
    function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y) {
        var l1 = (p2x - p1x) / 2,
            l2 = (p3x - p2x) / 2,
            a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
            b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
        a = p1y < p2y ? Math.PI - a : a;
        b = p3y < p2y ? Math.PI - b : b;
        var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
            dx1 = l1 * Math.sin(alpha + a),
            dy1 = l1 * Math.cos(alpha + a),
            dx2 = l2 * Math.sin(alpha + b),
            dy2 = l2 * Math.cos(alpha + b);
        return {
            x1: p2x - dx1,
            y1: p2y + dy1,
            x2: p2x + dx2,
            y2: p2y + dy2
        };
    }

    // Grab the data
  var $elem = $('#graph-data'),
        labels = $elem.children('.labels').text(),
        data = [],
        params = $elem.children('.all').text(),
        maxY = $elem.children('.max').text(),
        graphY = $elem.children('.graphY').text(),
        textHover = graphY === 'count' ? ' шт.' : ' руб.';
    maxY = JSON.parse(maxY);
    labels = JSON.parse(labels);
    params = JSON.parse(params);
    var len = params.length; // количество графиков
    // Draw
    var width = 1300,
        height = 500, // 250
        leftgutter = 0,
        bottomgutter = 40,
        topgutter = 40,
        colorhue = .6 || Math.random(),
        color = "hsl(" + [colorhue, .5, .5] + ")",
        r = Raphael("holder", width, height),
        paper = Raphael("holder-colors", 180, len*26),  // блок с цветами
        txt = {font: '12px Helvetica, Arial', fill: "#ddd"},
        txt1 = {font: '10px Helvetica, Arial', fill: "#fff"},
        txt2 = {font: '12px Helvetica, Arial', fill: "#000"},
        txtcolor = '#fff',
        X = (width - leftgutter) / labels.length,
        max = Math.max.apply(Math, maxY), /// максимальное значение
        Y = (height - bottomgutter - topgutter) / max;
        r.drawGrid(leftgutter + X * .5 + .5, topgutter + .5, width - leftgutter - X, height - topgutter - bottomgutter, 10, 10, "#000");   // рисуется сетка
    // console.log(max, X);

    var colors = ['#003A88', '#ff0000', '#00FF00', '#FF00FF', '#FFD700',  '#07B10D', '00FF00', '#00CED1', '#00BFFF', '#fe2390', '#00f39f', '#000001', '#FF6347',  '#0000ff',
                '#B8860B', '#DA70D6', '#27408B', '#668B8B', '#008B00', '#FF6A6A','#551A8B', '#1C1C1C', '#32CD32', '#008B8B', '#800000']; // 25 цветов, добавить если нужно
    var j;
    for(j = 0; j < len; j++){
        data = params[j]['count'];
        color = colors[j];
        var multiplier = 10 + j*25;
        paper.circle(12, multiplier, 6).attr({fill: color});
        paper.text(35, multiplier, params[j]['name']).attr({'font-size': 12, 'text-anchor':'start'});
        var path = r.path().attr({stroke: color, "stroke-width": 4, "stroke-linejoin": "round"}),  // линия графика
            label = r.set(),
            lx = 0, ly = 0,
            is_label_visible = false,
            leave_timer,
            blanket = r.set();
        label.push(r.text(60, 12, "24 hits").attr(txt));
        label.push(r.text(60, 27, "22 September 2008").attr(txt1).attr({fill: txtcolor}));
        label.hide();

        var frame = r.popup(100, 100, label, "right").attr({fill: "#000", stroke: '#003A88', "stroke-width": 2, "fill-opacity": .7}).hide(); // подсказка всплывающая
        var p;
        console.log('labels', labels);
        for (var i = 0, ii = labels.length; i < ii; i++) {
            // console.log('labels.**');
            var y = Math.round(height - bottomgutter - Y * data[i]),
                x = Math.round(leftgutter + X * (i + .5)),
                t = r.text(x, height - 6, labels[i]).attr(txt2).toBack();
            if (!i) {
                p = ["M", x, y, "C", x, y];
            }
            // console.log(height,bottomgutter, Y, data[i]);
            // console.log('data ', data);
            if (i && i < ii - 1) {
                var Y0 = Math.round(height - bottomgutter - Y * data[i - 1]),
                    X0 = Math.round(leftgutter + X * (i - .5)),
                    Y2 = Math.round(height - bottomgutter - Y * data[i + 1]),
                    X2 = Math.round(leftgutter + X * (i + 1.5));

                var a = getAnchors(X0, Y0, x, y, X2, Y2);
                p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
            }
            var dot = r.circle(x, y, 4).attr({fill: "#fff", stroke: "orangered", "stroke-width": 2});   // stroke-width вокруг точки толщина линии(2), fill - заливка точки внутри(#333), stroke - цвет ободка(color)
            blanket.push(r.circle(x, y, 18).attr({fill: "#fff", stroke: "none", opacity: 0}));  // hover element для подсказок
            var rect = blanket[blanket.length - 1];
            (function (x, y, data, lbl, dot) {
                var i = 0;
                rect.hover(function () {
                    clearTimeout(leave_timer);
                    var side = "right";
                    if (x + frame.getBBox().width > width) {
                        side = "left";
                    }
                    var ppp = r.popup(x, y, label, side, 1),
                        anim = Raphael.animation({
                            path: ppp.path,
                            transform: ["t", ppp.dx, ppp.dy]
                        }, 200 * is_label_visible);
                    lx = label[0].transform()[0][1] + ppp.dx;
                    ly = label[0].transform()[0][2] + ppp.dy;
                    frame.show().stop().animate(anim);
                    label[0].attr({text: data + textHover + (data == 1 ? "" : "")}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 200 * is_label_visible);
                    label[1].attr({text: lbl}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 200 * is_label_visible);
                    dot.attr("r", 6);  // увеличение точки при наведении
                    is_label_visible = true;
                }, function () {
                    dot.attr("r", 4);
                    leave_timer = setTimeout(function () {
                        frame.hide();
                        label[0].hide();
                        label[1].hide();
                        is_label_visible = false;
                    }, 1);
                });
            })(x, y, data[i], labels[i], dot);
        }
        console.log(x,y);
        // return;
        p = p.concat([x, y, x, y]);
        path.attr({path: p});  // выводится кривая линия на график
        frame.toFront(); // чтобы подсказки перекрывали точки
        label[0].toFront();
        label[1].toFront();
        blanket.toFront();
    }
 };