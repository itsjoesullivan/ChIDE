var Doc = Backbone.Model.extend({
	initialize: function() {
		this.set({
			editSession: new ace.EditSession(this.get('text'))
		});
	},
	defaults: {
		text: ''
	}
});

var Docs = Backbone.Collection.extend({model:Doc});