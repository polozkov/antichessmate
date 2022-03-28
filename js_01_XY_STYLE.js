//Global object for my program
var G = {
    //Function-constructor for 2D dot (x and y - coordinates)
    F_XY: function(x, y) {
        this.x = x;
        this.y = y;
    },

    //style for line_stroke_width, stroke color and fill color
    F_STYLE: function(w, stroke, fill) {
        this.w = w; //line_stroke_width
        this.stroke = stroke; //stroke color
        this.fill = fill; //fill color
    }
};

//Immediatly invoked function expression (IIFE) for making group (operations with 2D points)
(function f_set_F_XY_prototype() {
    //oparation scale in n times (n is real number)
    G.F_XY.prototype.f_op_scale = function(n) {
        return new G.F_XY(this.x * n, this.y * n);
    };
    //make dublicate (deep copy) of the 2D point
    G.F_XY.prototype.f_get_copy = function() {
        return new G.F_XY(this.x, this.y);
    };
    //x and y coordinates, separated by symbol ","
    G.F_XY.prototype.f_get_pair = function() {
        return this.x + ',' + this.y;
    };

    //set length for the vector with the same direction
    G.F_XY.prototype.f_op_to_length = function(final_length) {
        //length by Pythagorean theorem
        var old_length = Math.sqrt(this.x * this.x + this.y * this.y);
        //scaling for final length
        return this.f_op_scale(final_length / old_length);
    };

    //oparation "+" for 2 coordinates (x and y separately)
    G.F_XY.prototype.f_op_add = function(b) {
        return new G.F_XY(this.x + b.x, this.y + b.y);
    };
    //oparation "-" for 2 coordinates (x and y separately)
    G.F_XY.prototype.f_op_subtract = function(b) {
        return new G.F_XY(this.x - b.x, this.y - b.y);
    };
    //oparation "*" for 2 coordinates (x and y separately)
    G.F_XY.prototype.f_op_mult = function(b) {
        return new G.F_XY(this.x * b.x, this.y * b.y);
    };
    //oparation "/" for 2 coordinates (x and y separately)
    G.F_XY.prototype.f_op_divide = function(b) {
        return new G.F_XY(this.x / b.x, this.y / b.y);
    };
}());

//Immediatly invoked function expression (IIFE) for making group (operations with style)
(function f_set_F_STYLE_prototype() {
    //deep copy, but making line_width-scaling (when 1.0 - identical)
    G.F_STYLE.prototype.f_style_copy = function(scale_line) {
        var w = ((scale_line == undefined) ? 1 : scale_line) * this.w;
        return new G.F_STYLE(w, this.stroke, this.fill);
    };

    //THIS to STRING for SVG-ELEMENT properties: line-width, stroke-color, fill-color
    G.F_STYLE.prototype.f_to_style_string = function() {
        var stroke_width = 'stroke-width="' + this.w + '"';
        var stroke = 'stroke="' + this.stroke + '"';
        var fill = 'fill="' + this.fill + '"';
        return (stroke_width + ' ' + stroke + ' ' + fill);
    };
}());