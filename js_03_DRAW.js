G.STYLES = {
    //black and white figures (lineWidth, stroke, fill)
    arr_bw_fig: [new G.F_STYLE(0.3, "#FFF", "#000"), new G.F_STYLE(0.3, "#000", "#FFF")],
    //black and white cells(lineWidth, stroke, fill)
    arr_bw_cell: [new G.F_STYLE(2, "#FF6", "#333"), new G.F_STYLE(2, "#FF6", "#CCC")],
    //hints for selected cells
    cell_hint: new G.F_STYLE(0.1, "#F00", "#0F0"),
    //buttons for operating with game process
    button: new G.F_STYLE(0.2, "#888", "#0F0"),

    btn_back_total: "M0,0 l2,3 l0,-6 l-2,3z M-3,0 l2,3 l0,-6 l-2,3 z",
    btn_back: "M0,0 m-2,0 l3,3 l0,-6 l-3,3 z",
    btn_forward: "M0,0 m2,0 l-3,-3 l0,6 m3,-3 z",
    btn_forward_total: "M0,0 l-2,-3 l0,6 m2,-3 z M3,0 l-2,-3 l0,6 m2,-3 z",
    btn_180: "M-1.5,0 l-1,-1.5 l-1,1.5 l0.5,0 a3,3 0 1 0 3,-3 l0,1 a2,2 0 1 1 -2,2 z",

    arr_fig_names: ["ZERO", "pawn", "knight", "bishop", "rook", "queen", "king"],

    grid_foreach_fig: 8.0,
    grid_cell_size: 50.0,
    //celection of the cell
    hint: "M-3.5,-3.5 L-2,-4 L-4,-2 Z M3.5,-3.5 L4,-2 L2,-4 Z M3.5,3.5 L2,4 L4,2 Z M-3.5,3.5 L-4,2 L-2,4 Z",

    pawn: "M0,0 m0,-1 l2,4 l-4,0 l2,-4 a1,1 0 0 1 0,-2 a1,1 0 0 1 0,2 z",
    knight: "M0,0 m-1,0 l-1,3 l4,0 q1,-2 0,-4 l-1,-2 l-1,1 l-2 0 a1,0.5 0 0 0 0,1 a1,0.5 0 0 0 0,1 z",
    bishop: "M0,0 m-1,2 l-1,1 l4,0 l-1,-1 q2,-2 0,-4 l-1,-1 l-1,1 q-2,2 0,4 z",

    rook: "M0,0 m-2,2 l0,1 l4,0 l0,-1 q-2,-2 0,-4 l0,-1 l-4,0 l0,1 q2,2 0,4 z",
    queen: "M0,0 m0,-3 l0.5,2 l1.5,-2 l-1,4, l2,-3, -1,5, l-4,0 l-1,-5, l2,3 l-1,-4, l1.5,2 l0.5,-2 z",
    king: "M0,0 m3,-1 l-1,4 l-4,0 l-1,-4 q-0.5,-2 2,-1 l-0.5,-1.5 l3,0 l-0.5,1.5 q2.5,-1 2,1 z " +
        "M-0.25,-0.25 h-0.5 v0.5 h0.5 v0.5 h0.5 v-0.5 h0.5 v-0.5 h-0.5 v-0.5 h-0.5 v0.5 z"
};

G.p00 = new G.F_XY(0, 0);

G.DRAW = {
    main_svg: document.getElementById("svg_main"),

    //set view_box by object_x1y1 and object_wh (svg is = G.DRAW.main_svg)
    f_set_view_box: function(p_left_top, wh, svg) {
        var value = p_left_top.f_get_pair() + ' ' + wh.f_get_pair();
        svg.setAttribute("viewBox", value);
    },

    f_add_el_to_svg: function(el_svg_string, svg) {
        svg.innerHTML = svg.innerHTML + el_svg_string;
    },

    //rectangle element by object_x1y1 anf sizes as real numbers w,h
    f_rect: function(top_left, w, h, gotten_style, svg) {
        var xy_wh = 'x="' + top_left.x + '" y="' + top_left.y + '" width="' + w + '" height="' + h + '"';
        var style = gotten_style.f_to_style_string();
        var svg_text = '<rect ' + xy_wh + ' ' + style + ' />';
        G.DRAW.f_add_el_to_svg(svg_text, svg);
    },

    CHESS: {
        cell: G.STYLES.grid_cell_size, //the more cell, the less borders between cells, it is optimal

        f_fig: function(string_name, cell_size, c, gotten_style, svg) {
            //path for figure by name
            var d = 'd="' + G.STYLES[string_name] + '"';
            var scale = cell_size / G.STYLES.grid_foreach_fig;

            var transform = 'transform="matrix(' + scale + ',0,0,' + scale + ',' + c.x + ',' + c.y + ')"';
            var style = gotten_style.f_to_style_string();
            var svg_text = '<path ' + d + ' ' + transform + ' ' + style + ' />';
            G.DRAW.f_add_el_to_svg(svg_text, svg);
        },

        //when is_black_rotation = false, white side is to user; board_total_square_size is real number
        f_board: function(board_64, is_black_rotation, board_left_top, board_total_square_size, svg, hints) {
            var cell_size = board_total_square_size * 0.125; //divide on 8

            //coordinate of the center or top-left point of the cell (nx,ny)
            function f_coord(nx, ny, is_top_left) {
                var xy_top_left = board_left_top.f_op_add((new G.F_XY(nx, ny)).f_op_scale(cell_size));
                if (is_top_left) {return xy_top_left; };
                //return center point (+50% of the cell_size)
                return xy_top_left.f_op_add(new G.F_XY(cell_size * 0.5, cell_size * 0.5));
            };
            
            function f_draw_cell(nx, ny) {
                //Are we have rotation on 180 degrees?
                var my_x = is_black_rotation ? nx : (7 - nx);
                var my_y = is_black_rotation ? ny : (7 - ny);
                var bw_01 = (nx + ny + 1) % 2; //color of the cell (black or white)
                //draw square cell
                G.DRAW.f_rect(f_coord(my_x, my_y, true), cell_size, cell_size, G.STYLES.arr_bw_cell[bw_01], svg);
                
                //no chess-figures, no svg-figures
                if (board_64[nx + ny * 8] == 0) {return; }
                //type of the figure
                var string_name = G.STYLES.arr_fig_names[Math.abs(board_64[nx + ny * 8])];
                //color of the figure
                var gotten_style = G.STYLES.arr_bw_fig[(board_64[nx + ny * 8] < 0) ? 0 : 1];

                G.DRAW.CHESS.f_fig(string_name, cell_size, f_coord(my_x, my_y, false), gotten_style, svg)
            };

            for (var i64 = 0; i64 < 64; i64++) {
                f_draw_cell(i64 % 8, (i64 - (i64 % 8)) / 8);
            };

            var h = board_total_square_size * 0.125 * 1;
            var top_left = board_left_top.f_op_add(new G.F_XY(0, board_total_square_size));
            var line_style = G.STYLES.arr_bw_fig[is_black_rotation ? 0 : 1];
            //panel, that show, what color is used by user
            G.DRAW.f_rect(top_left, board_total_square_size, h, line_style, svg);

            //draw buttons for chess SVG
            G.DRAW.CHESS.f_fig("btn_back_total", cell_size, f_coord(0, 8, false), G.STYLES.button, svg);
            G.DRAW.CHESS.f_fig("btn_back", cell_size, f_coord(1, 8, false), G.STYLES.button, svg);
            G.DRAW.CHESS.f_fig("btn_forward", cell_size, f_coord(2, 8, false), G.STYLES.button, svg);
            G.DRAW.CHESS.f_fig("btn_forward_total", cell_size, f_coord(3, 8, false), G.STYLES.button, svg);
            G.DRAW.CHESS.f_fig("btn_180", cell_size, f_coord(7, 8, false), G.STYLES.button, svg);

            if (!hints) {return; };
            //draw hints, only if we have then (array, maybe empty)
            for (var i_hint = 0; i_hint < hints.length; i_hint++) {
                var t64 = is_black_rotation ? hints[i_hint] : (63 - hints[i_hint]);
                var nxy = [t64 % 8, (t64 - (t64 % 8)) / 8];
                G.DRAW.CHESS.f_fig("hint", cell_size, f_coord(nxy[0], nxy[1], false), G.STYLES.cell_hint, svg);
            }
        },
    }
};

(function f_test() {
    G.DRAW.f_set_view_box(G.p00, new G.F_XY(8, 9).f_op_scale(G.DRAW.CHESS.cell), G.DRAW.main_svg);

    G.DRAW.CHESS.f_board(G.RULES.BOARD.start, true, G.p00, G.DRAW.CHESS.cell * 8, G.DRAW.main_svg, [11]);
}());