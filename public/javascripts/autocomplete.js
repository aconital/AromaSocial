// USERS
$(function() {
    $('.auto').autocomplete({
            source: function(req, res) {
                $.ajax({
                  url: '/allusers',
                  dataType: 'json',
                  cache: false,
                  success: function(data) {
                    console.log("SUCCESS!!!!!!!");
                    console.log(data);
                    var arr = $.grep(data, function(item){
                      return item.username.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                    });
                    res($.map(arr, function(item){
                      return {
                        label: item.fullname,
                        value: item.username
                      };
                    }));
                  },
                  error: function(xhr) {
                    console.log("ERROR WTF!!!");
                    console.log(xhr.status);
                  }
                });
            },
            messages: {
              noResults: '',
              results: function() {}
            }
    });
});

// PUBLICATIONS - working
$(function() {
    $('.auto1').autocomplete({
            source: function(req, res) {
                $.ajax({
                  url: '/allpublications',
                  dataType: 'json',
                  cache: false,
                  success: function(data) {
                    console.log("SUCCESS!!!!!!!");
                    console.log(data);
                    var arr = $.grep(data, function(item){
                      return item.title.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                    });
                    res($.map(arr, function(item){
                      return {
                        label: item.title,
                        value: item.title
                      };
                    }));
                  },
                  error: function(xhr) {
                    console.log("ERROR WTF!!!");
                    console.log(xhr.status);
                  }
                });
            },
            messages: {
              noResults: '',
              results: function() {}
            }
    });
});

// Organizations - working
$(function() {
    $('.auto2').autocomplete({
            source: function(req, res) {
                $.ajax({
                  url: '/allorganizations',
                  dataType: 'json',
                  cache: false,
                  success: function(data) {
                    console.log("SUCCESS!!!!!!!");
                    console.log(data);
                    var arr = $.grep(data, function(item){
                      return item.name.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                    });
                    res($.map(arr, function(item){
                      return {
                        label: item.name,
                        value: item.name
                      };
                    }));
                  },
                  error: function(xhr) {
                    console.log("ERROR WTF!!!");
                    console.log(xhr.status);
                  }
                });
            },
            messages: {
              noResults: '',
              results: function() {}
            }
    });
});