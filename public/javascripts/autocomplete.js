$(function() {
    $('#auto').autocomplete({
            source: function(req, res) {
                $.ajax({
                  url: '/allusers',
                  dataType: 'json',
                  cache: false,
                  success: function(data) {
                    console.log("SUCCESS!!!!!!!");
                    console.log(data);
                    res($.map(data, function(item) {
                        console.log("NAME: ");
                        console.log(item.fullname);
                        return {
                            label: item.fullname,
                            value: item.id
                        };
                    }));
                  },
                  error: function(xhr) {
                    console.log("ERROR WTF!!!");
                    console.log(xhr.status);
                  }
                });
            }
    });
});
