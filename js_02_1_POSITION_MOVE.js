G.RULES = {
    //start positions as array of 64 integer numbers
    BOARD: {
        //64 zeros
        empty: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ],
        //start position for classical chess game
        start: [4, 2, 3, 6, 5, 3, 2, 4, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -4, -2, -3, -6, -5, -3, -2, -4
        ],
        //testing position (I modify this position for debugging)
        e2e4: [4, 2, 3, 6, 5, 3, 2, 4, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -4, -2, -3, -6, -5, -3, -2, -4
        ]
    },
    //castle - detector (rook, king, rook or virtical with no castling figures)
    arr_07_to_13_a_e_h: [1, 0, 0, 0, 2, 0, 0, 3]
};

//object position (board, who-play_now, castle-arr[0..1][0..2]_of_bool_legal, en-passant for the last move)
G.F_POSITION = function(arr64, who, a_e_h, pawn_move_or_minus_one) {
    this.arr64 = arr64.slice();
    this.who = who;
    //in the start position, noone (kings and rooks) have not made any move yet
    this.castle_a_e_h = a_e_h ? [a_e_h[0].slice(), a_e_h[1].slice()] : [
        [false, false, false],
        [false, false, false]
    ];
    //en passant = [0..7] or -1, when last move is not a pawn-double-start
    this.en_passant = (pawn_move_or_minus_one == undefined) ? pawn_move_or_minus_one : -1;
};

//object for move (start, final cells; captured opponent's figure, flag for specila moves + castling bool)
G.F_MOVE = function(a64, b64, captured_fig, promotion_fig_or_en_passant_or_castle, is_first_move_for_castling_fig) {
    this.a64 = a64; //start cell for moving figure
    this.b64 = b64; //final cell for moving figure
    this.captured = captured_fig ? captured_fig : 0; //captured opponent's figure (0 for Quiet move)

    //flag for pawn's promotion (2,3,4,5); en passant (1), castle (6)
    this.flag = promotion_fig_or_en_passant_or_castle ? promotion_fig_or_en_passant_or_castle : 0;
    //when king or rook make first move, it change castling opportunity
    this.is_first_move_for_castling_fig = is_first_move_for_castling_fig ? true : false;
};


    /*
    G.F_POSITION.prototype.f_move_undo = function(m) {
        this.arr64[m.a64] = this.arr64[m.b64];
        this.arr64[m.b64] = m.captured;
        this.who *= -1;

        if (m.flag == 0) {return; }
        var abs = Math.abs(m.flag);

        //en passant
        if (abs == 1) {
            this.arr64[m.b64 % 8 + (m.a64 - (m.a64 % 8))] = -m.flag;
            return;
        }

        //castle
        if (abs == 6) {
            var is_00 = ((m.b64 % 8) < 3); //is short castle, not 0-0-0
            var y8 = (m.b64 < 8) ? 0 : 56;
            var n_old = is_00 ? y8 : (y8 + 2);
            var n_new = is_00 ? (y8 + 7) : (y8 + 4);
            this.arr64[n_old] = this.arr64[n_new];
            this.arr64[n_new] = 0;
            return;
        }

        //promotion
        if ((2 <= abs) && (abs <= 5)) {
            this.arr64[m.a64] = (m.flag < 0) ? (-1) : 1;
        }
    };*/
