chrome.app.runtime.onLaunched.addListener(function(launchData) {
    console.log(arguments);
  chrome.app.window.create('index.html', {
    id: '606'
  }, function(w) {
      w.contentWindow.win = w;
      w.contentWindow.launchData = launchData;
		w.contentWindow.firstDoc = "First doc!";
      w.show();
  });
});
