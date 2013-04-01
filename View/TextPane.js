var TextPane = Backbone.View.extend({
	initialize: function() {
		this.editor = ace.edit(this.el);
	},
	render: function(session) {
		this.editor.setSession(session);
	}
});