var state = {
	tag_inputs: {}
};

var TagInput = {
	oninit: function(vnode) {
		state.tag_inputs[vnode.attrs.name] = [];
	},
	view: function(vnode) {
		function handle(e) {
			if (e.type == 'blur' || e.keyCode == 13 || e.keyCode == 32) {
				e.target.value.split(' ').map(function(new_tag) {
					if (new_tag)
						state.tag_inputs[name].push(new_tag);
				});

				e.target.value = '';
			} else if (
				e.keyCode == 8 &&
				e.target.selectionStart == 0 &&
				state.tag_inputs[name].length > 0
			) {
				var last_tag = state.tag_inputs[name].pop();
				e.target.value = (last_tag + ' ' + e.target.value).trim();
				e.target.selectionStart = last_tag.length;
				e.target.selectionEnd = last_tag.length;
			}
		}

		var name = vnode.attrs.name;
		var tags = state.tag_inputs[name];

		return m('div.tag-input', {
			onclick: function(e) {
				e.target.children[e.target.childElementCount - 1].focus();
			}
		}, [
			tags.map(function(tag, i) {
				return m('span', {
					key: i, onclick: function(e) {
						state.tag_inputs[name].splice(i, 1);
					}
				}, tag);
			}),
			m('input[type=text]', {onblur: handle, onkeyup: handle })
		]);
	}
};

var Container = {
	view: function(vnode) {
		return [
			m(TagInput, {name: 'test'}),
			m(TagInput, {name: 'something'})
		];
	}
};

m.mount(document.getElementById('tag-inputs'), Container);
