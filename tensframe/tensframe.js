var state = {
	images: [
		'token-red', 'token-blue', 'ant', 'apple', 'bee', 'caterpillar',
		'crocodile', 'daisy', 'flamingo', 'game-pad', 'guitar', 'hot-dog',
		'ladybird', 'lolly', 'moon', 'orange', 'orangutan', 'palette',
		'skateboard', 'smiley','snail', 'snake', 'star', 'sun', 'chipmunk',
		'swan', 'sweet', 'teddy', 'tent', 'wool'
	].map(function(image) { return 'images/' + image + '.png'; }),

	frame_width: 5,
	num_cells: 10,
	cells: [],
	calculations: {},
	more_calculations: false,

	update_frame_width: function(value) {
		state.frame_width = value;
	},
	update_num_cells: function(value) {
		state.num_cells = value;

		state.cells = state.cells.slice(0, value);
	},
	get_cell: function(index) {
		if (index > state.cells.length-1)
			return null;

		return state.cells[index];
	},
	set_cell: function(index, value) {
		if (state.cells.length < state.num_cells) {
			for (var i = 0; i < state.num_cells; i++)
				state.cells.push(null);
		}

		state.cells[index] = value;
	},
	unset_cell: function(index) {
		state.cells[index] = null;
	},
	set_calculation: function(calculation, value) {
		state.calculations[calculation] = value;
	},
	toggle_more_calculations: function() {
		state.more_calculations = !state.more_calculations;
	}
};

var Token = {
	view: function(vnode) {
		var in_frame = vnode.attrs.in_frame;

		return m('img', {
			src: vnode.attrs.src,
			class: in_frame ? 'max-width-100' : 'size-48',
			onclick: vnode.attrs.onclick,
			draggable: true,
			ondragstart: function(e) {
				e.dataTransfer.setData('text/plain', vnode.attrs.src);
			}
		});
	}
};

var Controls = {
	view: function() {
		return [
			'The frame is ',
			m('input[type=number].inline-editable.mx-1', {
				onchange: function(e) { state.update_frame_width(e.target.value); },
				onclick: function(e) { state.update_frame_width(e.target.value); },
				value: state.frame_width
			}),
			'cells wide with ',
			m('input[type=number].inline-editable.mx-1', {
				onchange: function(e) { state.update_num_cells(e.target.value); },
				onclick: function(e) { state.update_num_cells(e.target.value); },
				value: state.num_cells
			}),
			'cells in total.',
			m('p',
				'Click or drag the tokens below into the frame (click them ' +
				'again in the frame to remove them).'),
			m('div', state.images.map(function(image, i) {
				return m(Token, {
					src: image,
					in_frame: false,
					key: i,
					onclick: function(e) {
						for (var j = 0; j < state.num_cells; j++) {
							if (state.get_cell(j) == null) {
								state.set_cell(j, image);
								break;
							}
						}
					}
				});
			}))
		];
	}
};

var Frame = {
	view: function() {
		var cells = [];

		for (var i = 0; i < state.num_cells; i++) {
			var last = cells.length - 1;

			if (last < 0 || cells[last].length == state.frame_width) {
				cells.push([]);
				last++;
			}

			cells[last].push(state.cells[i]);
		}

		return m('table.tensframe', cells.map(function(row, i) {
			return m('tr', row.map(function(cell, j) {
				return m('td', {
					key: i,
					onclick: function(e) {
						state.unset_cell((i * state.frame_width) + j);
					},
					ondragover: function(e) {
						e.preventDefault();
					},
					ondrop: function(e) {
						state.set_cell(
							(i * state.frame_width) + j,
							e.dataTransfer.getData('text/plain'));
						e.preventDefault();
					}
				}, [
					cell
						? m('div.centre-both.p-1', m(Token, {src: cell, in_frame: true}))
						: m('div')
				]);
			}));
		}));
	}
};

var Calculation = {
	oninit: function(vnode) {
		state.set_calculation(vnode.attrs.calculation, null);
	},
	view: function(vnode) {
		var parts = vnode.attrs.calculation.split('_', 2);
		var answer = vnode.attrs.answer;

		var correct = state.calculations[vnode.attrs.calculation] == answer;

		return m('div.h2.p-1.round', {class: correct ? 'correct' : ''}, [
			parts[0],
			m('input[type=text].inline-editable', {
				onkeyup: function(e) {
					state.set_calculation(vnode.attrs.calculation, e.target.value);
				}
			}),
			parts[1]
		]);
	}
};

var Calculations = {
	view: function() {
		var num_filled = state.cells.filter(function(i) { return i; }).length;

		return [
			m('div.columns', [
				m('div.mx-a', m(Calculation, {
					calculation: num_filled + ' + ' + ' _ = ' + state.num_cells,
					answer: state.num_cells - num_filled
				})),
				m('div.mx-a', m(Calculation, {
					calculation: '_ + ' + num_filled + ' = ' + state.num_cells,
					answer: state.num_cells - num_filled
				}))
			]),
			state.more_calculations ? m('div.columns.mt-2', [
				m('div.mx-a', m(Calculation, {
					calculation: state.num_cells + ' = _ + ' + num_filled,
					answer: state.num_cells - num_filled
				})),
				m('div.mx-a', m(Calculation, {
					calculation: state.num_cells + ' = ' + num_filled + ' + _',
					answer: state.num_cells - num_filled
				}))
			]) : null,
			m('div.mt-2.text-centre.pointer', {
				onclick: function() {
					state.toggle_more_calculations();
				}
			}, (state.more_calculations ? 'Less' : 'More') + ' Calculations')
		];
	}
};

var Container = {
	view: function() {
		return m('div.col-8.mx-a', [
			m('div.container-label', {'data-label': 'Setup'}, m(Controls)),
			m('div.container-label', {'data-label': 'Frame'}, m(Frame)),
			m('div.container-label', {'data-label': 'Calculations'}, m(Calculations))
		]);
	}
};

m.mount(document.getElementById('tens-frame'), Container);
