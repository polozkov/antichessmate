(function f_set_F_POSITION_prototype() {
    //deep copy of position object
    G.F_POSITION.prototype.f_get_copy = function() {
        return new G.F_POSITION(this.arr64, this.who, this.castle_a_e_h, this.en_passant);
    };

    //play move, changing self object (this)
    G.F_POSITION.prototype.f_move_do = function(m) {
        var fig_1_6 = Math.abs(this.arr64[m.a64]); //playing figure

        //criterion (test) for en_passant is DOUBLE move (delta==16) and fig is 1 (pawn); (-1) - no enpassant
        this.en_passant = (Math.abs(m.b64 - m.a64) == 16) && (fig_1_6 == 1) ? (m.a64 % 8) : (-1);

        //change castling status, when move made by King or Rook (first move)
        if (m.is_first_move_for_castling_fig) {
            var n_0_123_a_e_h = G.RULES.arr_07_to_13_a_e_h[m.a64 % 8]; //0 or 1,2,3 (empty or rook_a_h or king e)
            if (n_0_123_a_e_h > 0) { //this move is made by king or rook (first move, as we checked before)
                this.castle_a_e_h[(this.who > 1) ? 0 : 1][n_0_123_a_e_h - 1] = true;
            }
        }

        //move figure from occupiyed cell a -> to empty (or enemy cell) b
        this.arr64[m.b64] = this.arr64[m.a64];
        this.arr64[m.a64] = 0;
        this.who *= -1; //inverse color (black -1 after white +1, and white after black)

        if (m.flag == 0) { return; } //no flag do nothing, in othe case
        var abs = Math.abs(m.flag); //1..6, not zero, as we checked

        //en passant
        if (abs == 1) {
            //horizontal b64, vertical a64 (only here opponent's pawn can be captured en-passant)
            this.arr64[m.b64 % 8 + (m.a64 - (m.a64 % 8))] = 0;
            return;
        }

        //castle
        if (abs == 6) {
            var is_00 = ((m.b64 % 8) < 3); //short castle for king to the vertical (B), 0-0-0 to (F)
            var y8 = (m.b64 < 8) ? 0 : 56; //horisontal (white - 0, or black - 7)
            var n_old = is_00 ? y8 : (y8 + 7); //where rook WAS before 0-0 or 0-0-0
            var n_new = is_00 ? (y8 + 2) : (y8 + 4); //where rook WILL be after 0-0 or 0-0-0

            this.arr64[n_new] = this.arr64[n_old];
            this.arr64[n_old] = 0;
            return;
        }

        //promotion
        if ((2 <= abs) && (abs <= 5)) {
            this.arr64[m.b64] = m.flag; //add new figure 2..5 (whit correct sign)
        }
    };

    //deep copy of position with move
    G.F_POSITION.prototype.f_move_for_copy_do = function(m) {
        var position_copy = this.f_get_copy();
        position_copy.f_move_do(m); //move for self position_copy
        return position_copy;
    };

    //generate moves (can be with check and illegal castle)
    G.F_POSITION.prototype.f_gen_moves_with_illegal = function() {
        M = {
            //pawn moves
            f_fig_1: function(obj_position, a64, who) {
                var arr64 = obj_position.arr64;
                var n_en_passant = obj_position.en_passant;
                if (who == undefined) {who = obj_position.who; }

                var arr_moves = [];
                //x8 and y8 are coordinates of start pawn's cell
                var x8 = a64 % 8; 
                var y8 = (a64 - x8) / 8;
                //forward cell for pawn
                var b64 = a64 + who * 8;
                //dowble forward cell of pawn
                var c64 = a64 + who * 16;

                //PROMOTION (and exit function - for do not testing other move options)
                if (((y8 == 7) && (who == 1)) || ((y8 == 1) && (who == (-1)))) {
                    //array of pairs: final_cell and food (or 0, when no capturing)
                    var arr_promo = [];
                    //quiet move (0 - no food for pawn)
                    if (arr64[b64] == 0) {
                        arr_promo.push([b64, 0]);
                    }

                    //capturing to the x-1 (FIG*WHO negative, when we eat opponent's figure)
                    if ((x8 > 0) && ((arr64[b64 - 1] * who) < 0)) {
                        arr_promo.push([b64 - 1, arr64[b64 - 1]]);
                    }
                    //capturing to the x+1 (same as x-1)
                    if ((x8 < 7) && ((arr64[b64 + 1] * who) < 0)) {
                        arr_promo.push([b64 + 1, arr64[b64 + 1]]);
                    }

                    //foreach move add all odtions of promotions (knigth-2, bishop-3, rook-4, queen-5)
                    for (var i_len = 0; i_len < arr_promo.length; i_len++) {
                        for (var i_fig = 2; i_fig <= 5; i_fig++) {
                            //b64 is arr_promo[i_len][0]; captured_fig = arr_promo[i_len][1]; new_fig = i_fig * who;
                            arr_moves.push(new G.F_MOVE(a64, arr_promo[i_len][0], arr_promo[i_len][1], i_fig * who, false));
                        }
                    }
                    return arr_moves;
                }

                //FROM START POSITION DOUBLE MOVE
                if (((y8 == 1) && (who == 1)) || ((y8 == 7) && (who == (-1)))) {
                    if (arr64[b64] == 0) {
                        //c64 is dowble move; en-passant will be detected automatically for the opponent
                        arr_moves.push(new G.F_MOVE(a64, c64, 0, 0, false));
                    }
                }

                //TRY CAPTURE EN PASSANT
                if (((y8 == 4) && (who == 1)) || ((y8 == 3) && (who == (-1)))) {
                    if ((n_en_passant != -1) && (Math.abs(x8 - n_en_passant) == 1)) {
                        //n_en_passant is vertical for captured en-passant opponent pawn
                        c64 = n_en_passant + ((who == 1) ? 40 : 16);
                        //mark this en-passant move for delete opponent's pawn
                        arr_moves.push(new G.F_MOVE(a64, c64, 0, who, false));
                    }
                }

                //MOVE WITHOUT CAPTION
                if (arr64[b64] == 0) {
                    arr_moves.push(new G.F_MOVE(a64, b64, 0, 0, false));
                }
                //CAPTION TO (x-1)
                if ((x8 > 0) && ((arr64[b64 - 1] * who) < 0)) {
                    //arr64[b64 - 1] is captured figure (food for our pawn)
                    arr_moves.push(new G.F_MOVE(a64, b64 - 1, arr64[b64 - 1], 0, false));
                }
                //CAPTION TO (x+1)
                if ((x8 < 7) && ((arr64[b64 + 1] * who) < 0)) {
                    arr_moves.push(new G.F_MOVE(a64, b64 + 1, arr64[b64 + 1], 0, false));
                }

                return arr_moves;
            },

            f_fig_king_or_knight: function(arr64, a64, who, arr_neighbours) {
                var arr_moves = [];
                var x8 = a64 % 8;
                var y8 = (a64 - x8) / 8;
                var b64;

                var new_x, new_y;
                for (var i8 = 0; i8 < 8; i8++) {
                    new_x = arr_neighbours[i8][0] + x8;
                    new_y = arr_neighbours[i8][1] + y8;
                    //if (new_x and new_y are both on board)
                    if (((0 <= new_x) && (new_x <= 7)) && ((0 <= new_y) && (new_y <= 7))) {
                        b64 = new_x + (new_y * 8);
                        //opponent or empty cell
                        if ((arr64[b64] * who) <= 0) {
                            //when EQUAL to zero - quiet move, else capturing arr64[b64]
                            arr_moves.push(new G.F_MOVE(a64, b64, arr64[b64], 0, false));
                        }
                    }
                }
                return arr_moves;
            },

            //knight is the second figure
            f_fig_2: function (obj_position, a64, who) {
                var arr64 = obj_position.arr64;
                if (who == undefined) {who = obj_position.who; }

                var arr_neighbours = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
                return M.f_fig_king_or_knight(arr64, a64, who, arr_neighbours); 
            },

            //bishop, rook or queen
            f_fig_lineal: function(arr64, a64, who, arr_neighbours) {
                var arr_moves = [];
                var x8 = a64 % 8;
                var y8 = (a64 - x8) / 8;
                var b64, sign;
                var new_x, new_y;

                //4 directions for bishop and rook, 8 directions for queen
                for (var i_dir = 0; i_dir < arr_neighbours.length; i_dir++) {
                    //test all distances (deltas) until occupied cell
                    for (var i_delta = 1; i_delta <= 7; i_delta++) {
                        new_x = arr_neighbours[i_dir][0] * i_delta + x8;
                        new_y = arr_neighbours[i_dir][1] * i_delta + y8;
                        //new_x and new_y are on board
                        if (((0 <= new_x) && (new_x <= 7)) && ((0 <= new_y) && (new_y <= 7))) {
                            b64 = new_x + (new_y * 8);
                            sign = arr64[b64] * who; //for us important is the owner of the figure
                            
                            //opponent or empty cell
                            if (sign <= 0) {arr_moves.push(new G.F_MOVE(a64, b64, arr64[b64], 0, false)); }
                            
                            //break interation, because block of figure
                            if (sign != 0) {i_delta = 99; }              
                        } else {
                            i_delta = 999; //break interation, because out of board
                        }
                    }
                }
                return arr_moves;
            },

            //bishop
            f_fig_3: function(obj_position, a64, who) {
                var arr64 = obj_position.arr64;
                if (who == undefined) {who = obj_position.who; }

                var arr_neighbours = [[-1,-1], [-1,1], [1,-1], [1,1]];
                return M.f_fig_lineal(arr64, a64, who, arr_neighbours);
            },

            //rook
            f_fig_4: function(obj_position, a64, who, ) {
                var arr64 = obj_position.arr64;
                if (who == undefined) {who = obj_position.who; }
                var castle_a_e_h = obj_position.castle_a_e_h;

                var arr_neighbours = [[-1,0], [0,-1], [0,1], [1,0]];
                var arr_result = M.f_fig_lineal(arr64, a64, who, arr_neighbours);

                //check, that it is the first move for castling rook
                var n0_123 = 0;
                if ((who==1) && (a64 == 0) && (castle_a_e_h[0][0] == false)) {n0_123 = 1; }
                if ((who==1) && (a64 == 7) && (castle_a_e_h[0][2] == false)) {n0_123 = 3; }
                if ((who==(-1)) && (a64 == 56) && (castle_a_e_h[1][0] == false)) {n0_123 = 1; }
                if ((who==(-1)) && (a64 == 63) && (castle_a_e_h[1][2] == false)) {n0_123 = 3; }
                
                //add true value for first-move of rook for castling
                if (n0_123 != 0) {
                    for (var i_moves = 0; i_moves < arr_result.length; i_moves++) {
                        arr_result[i_moves].is_first_move_for_castling_fig = true;
                    }
                }
                return arr_result;
            },

            //queen
            f_fig_5: function(obj_position, a64, who) {
                var arr64 = obj_position.arr64;
                if (who == undefined) {who = obj_position.who; }

                //combine bishop and rook
                var arr_neighbours = [[-1,-1], [-1,1], [1,-1], [1,1], [-1,0], [0,-1], [0,1], [1,0]];
                return M.f_fig_lineal(arr64, a64, who, arr_neighbours);
            },

            //king
            f_fig_6: function(obj_position, a64, who) {
                var arr64 = obj_position.arr64;
                if (who == undefined) {who = obj_position.who; }
                var castle_a_e_h = obj_position.castle_a_e_h;

                var arr_neighbours = [[-1,-1], [-1,1], [1,-1], [1,1], [-1,0], [0,-1], [0,1], [1,0]];
                var arr_result = M.f_fig_king_or_knight(arr64, a64, who, arr_neighbours);

                if (((who==1) && (a64 == 3) && (castle_a_e_h[0][1] == false)) ||
                ((who==(-1)) && (a64 == 59) && (castle_a_e_h[1][1] == false))) {
                    //add true value for first-move of the king for castling
                    for (var i_moves = 0; i_moves < arr_result.length; i_moves++) {
                        arr_result[i_moves].is_first_move_for_castling_fig = true;
                    }
                }

                //Try add 0-0 and 0-0-0 without cheching checks and attack for rook (FOR WHITES)
                if ((who == 1) && (arr64[3] == 6) && (!castle_a_e_h[0][1])) {
                    if ((arr64[0] == 4) && (arr64[1] == 0) && (arr64[2] == 0) && (!castle_a_e_h[0][0])) {
                        //6 is this.flag for castling (king is the figure numer six)
                        arr_result.push(new G.F_MOVE(3, 1, 0, 6, true));
                    }
                    if ((arr64[7] == 4) && (arr64[6] == 0) && (arr64[5] == 0) && (arr64[4] == 0) && (!castle_a_e_h[0][2])) {
                        arr_result.push(new G.F_MOVE(3, 5, 0, 6, true));
                    }
                }; 

                //Try add 0-0 and 0-0-0 without cheching checks and attack for rook (FOR BLACKS)
                if ((who == (-1)) && (arr64[3 + 56] == (-6)) && (!castle_a_e_h[1][1])) {
                    if ((arr64[56] == (-4)) && (arr64[57] == 0) && (arr64[58] == 0) && (!castle_a_e_h[1][0])) {
                        arr_result.push(new G.F_MOVE(56 + 3, 56 + 1, 0, 6, true));
                    }
                    if ((arr64[56 + 7] == (-4)) && (arr64[56 + 6] == 0) && (arr64[56 + 5] == 0) && (arr64[56 + 4] == 0) && (!castle_a_e_h[1][2])) {
                        arr_result.push(new G.F_MOVE(56 + 3, 56 + 5, 0, 6, true));
                    }
                };

                return arr_result;
            },
        };

        var arr_moves_for_each_cell = [];
        var arr_moves_all = [];
        var i64, i_move, name_of_function = "";

        //generate array [0..63] of moves forech cells (maybe empty arrays)
        for (i64 = 0; i64 < 64; i64++) {
            //figure of current player, not opponent and not empty
            if ((this.arr64[i64] * this.who) > 0) {
                name_of_function = "f_fig_" + Math.abs(this.arr64[i64]);
                //console.log(name_of_function, i64);
                arr_moves_for_each_cell.push(M[name_of_function](this, i64, this.who));
            } else arr_moves_for_each_cell.push([]);
        }

        for (i64 = 0; i64 < 64; i64++) {
            //ALL arr_moves_for_each_cell[i64] COMBINE in the one array 
            for (i_move = 0; i_move < arr_moves_for_each_cell[i64].length; i_move++) {
                arr_moves_all.push(arr_moves_for_each_cell[i64][i_move]);
            }
        }
        return arr_moves_all;
    };

    //active player can capture king
    G.F_POSITION.prototype.f_can_eat_king = function (who_attack) {
        var old_who = this.who; //save order of move
        this.who = who_attack; //we will test attacking player

        var moves_all = this.f_gen_moves_with_illegal();
        
        for (var i_move = 0; i_move < moves_all.length; i_move++) {
            //attacking player can capture the king
            if (Math.abs(moves_all[i_move].captured) == 6) {
                this.who = old_who; //restore order of move
                return true;
            }
        };
        this.who = old_who; //restore order of move
        return false;
    };

    //check, that castling is legal
    G.F_POSITION.prototype.f_can_castling = function (move_with_castle) {
        //when check - no castling
        if (this.f_can_eat_king(-this.who)) {return false; };

        //we will check position after castlштп
        var position_after = this.f_move_for_copy_do(move_with_castle);
        
        //when check after castling - castling is illegal
        if (position_after.f_can_eat_king(position_after.who)) {return false; };

        var moves_opp = position_after.f_gen_moves_with_illegal();
        //y8 = 0 or 56; vert_x8= 2 or 4
        var rook_b64 = ((this.who == 1) ? 0 : 56) + (((move_with_castle.a64 % 8) == 0) ? 2 : 4);
        for (var i_move = 0; i_move < moves_opp.length; i_move++) {
            //opponent can move to rook's position (and pawn too - quiet move block castling)
            if (Math.abs(moves_opp[i_move].b64) == Math.abs(rook_b64)) {return false};
        }

        return true;
    };

    //legal chess moves
    G.F_POSITION.prototype.f_gen_moves_legal = function() {
        var moves_all = this.f_gen_moves_with_illegal();
        var moves_legal = [];

        //condition for filter (moves_all to moves_legal)
        function f_is_legal(position, m) {
            if ((Math.abs(m.flag) == 6) && position.f_can_castling(m)) {return true; };
            var who_opp = position.who * (-1);
            return ((position.f_move_for_copy_do(m).f_can_eat_king(who_opp)) == false);
        };

        for (var i_move = 0; i_move < moves_all.length; i_move++) {
            if (f_is_legal(this, moves_all[i_move])) {
                moves_legal.push(moves_all[i_move]);
            }
        };

        return moves_legal;
    };

    //legal anti-chess moves (capturing are priority)
    G.F_POSITION.prototype.f_gen_moves_anti_chess = function() {
        var moves_legal = this.f_gen_moves_legal();
        var moves_anti = [];

        //condition for filter (moves_legal to moves_anti)
        function f_is_anti(m) {
            //capturing or en-passant
            return ((m.captured != 0) || (Math.abs(m.flag) == 1));
        };

        for (var i_move = 0; i_move < moves_legal.length; i_move++) {
            if (f_is_anti(moves_legal[i_move])) {
                moves_anti.push(moves_legal[i_move]);
            }
        };

        if (moves_anti.length > 0) {return moves_anti;}
        return moves_legal;
    };
}());

(function f_test_rules() {
    var obj_position = new G.F_POSITION(G.RULES.BOARD.e2e4, 1);
    var m_with_illegal = obj_position.f_gen_moves_with_illegal();
    //console.log(m_with_illegal);

    //console.log(obj_position.f_move_for_copy_do(m_with_illegal[0]));

    //console.log(obj_position.f_gen_moves_legal());
    //console.log(obj_position.f_gen_moves_anti_chess());
}());