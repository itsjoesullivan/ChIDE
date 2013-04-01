var Doc = Backbone.Model.extend({
	defaults: {
		text: ''
	}
});

var Docs = Backbone.Collection.extend({model:Doc});