var Chide = Backbone.Model.extend({
	initialize: function() {
		this.set({
			docs: new Docs(),
			textPane: new TextPane({el: $(".text-pane")})
		});
		
		// For mockup really
		if(window.firstDoc) {
			var doc = new Doc({
				text: window.firstDoc
			});
			this.get('docs').add(doc);
		}
		
		if(!this.get('docs').length) {
				var doc = new Doc({
					text: 'No doc...'
				});
				this.get('docs').add(doc);
		}
		
		this.on('change:selectedDoc', function() {
			this.get('textPane').render(this.get('selectedDoc').get('editSession'));
		})
		
		//Start the ball rolling by selecting the first document.
		this.set({
			selectedDoc: this.get('docs').at(0)
		});
		
	}
});