// ALL
$(function() {
    $('.auto').catcomplete({
            source: function(req, res) {
              var r = []; 
              $.when(
                $.ajax({
                  url: '/allusers',
                  dataType: 'json',
                  cache: false,
                  success: function(data) {
                    console.log(data);
                    var arr = $.grep(data, function(item){
                      return item.fullname.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                    });
                    $.map(arr, function(item){
                      var dlink = "/profile/" + item.username;
                      r.push({label: item.fullname, value: item.fullname, category: "Users", imgsrc: item.imgUrl, link: dlink});
                    });
                  },
                  error: function(xhr) {
                    console.log(xhr.status);
                  }
                }),
                $.ajax({
                  url: '/allpublications',
                  dataType: 'json',
                  cache: false,
                  success: function(data) {
                    //console.log(data);
                    var arr = $.grep(data, function(item){
                      console.log(item.title);
                      return item.title.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                    });
                    $.map(arr, function(item){
                      console.log("PUB ITEM: ");
                      console.log(item);
                      var dlink = "/publication/" + item.objectId;
                      r.push({label: item.title, value: item.title, category: "Publications", link: dlink});
                    });
                  },
                  error: function(xhr) {
                    console.log(xhr.status);
                  }
                }),
                $.ajax({
                  url: '/allorganizations',
                  dataType: 'json',
                  cache: false,
                  success: function(data) {
                    console.log(data);
                    var arr = $.grep(data, function(item){
                      return item.name.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                    });
                    $.map(arr, function(item){
                      var dlink = "/organization/" + item.objectId;
                      r.push({label: item.name, value: item.name, category: "Organizations", imgsrc: item.profile_imgURL, link: dlink});
                    });
                  },
                  error: function(xhr) {
                    console.log(xhr.status);
                  }
                })
             ).then(function() {
              res(r);
            });
                
            },
            messages: {
              noResults: '',
              results: function() {}
            },
            focus: function(event, ui) {
                $(this).val(ui.item.label);
                $(".ui-helper-hidden-accessible").hide();
                event.preventDefault();
                return false;
            },
            select: function(event, ui) {
              window.location.href = ui.item.link;
            }
     }).data("custom-catcomplete")._renderItem = function(ul, item) {
             return $("<li></li>").data("ui-autocomplete-item", item)
                     .append("<a>" + "<img height='40' width='40' src='" + item.imgsrc + "' />&nbsp" + item.label + "</a>")
                     .appendTo(ul);
     };   
});

// $( "#SearchInput" ).autocomplete({ .... }).data( "autocomplete" )._renderItem = function( ul, item ) {
//         return $( "<li></li>" )
//             .data( "item.autocomplete", item )
//             .append( "<a>" + "<img src='" + item.imgsrc + "' />" + item.id+ " - " + item.label+ "</a>" )
//             .appendTo( ul );
//     };

// // USERS
// $(function() {
//     $('.auto').autocomplete({
//             source: function(req, res) {
//                 $.ajax({
//                   url: '/allusers',
//                   dataType: 'json',
//                   cache: false,
//                   success: function(data) {
//                     console.log("SUCCESS!!!!!!!");
//                     console.log(data);
//                     var arr = $.grep(data, function(item){
//                       return item.username.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
//                     });
//                     res($.map(arr, function(item){
//                       return {
//                         label: item.fullname,
//                         value: item.username
//                       };
//                     }));
//                   },
//                   error: function(xhr) {
//                     console.log("ERROR WTF!!!");
//                     console.log(xhr.status);
//                   }
//                 });
//             },
//             messages: {
//               noResults: '',
//               results: function() {}
//             }
//     });
// });

// // PUBLICATIONS - working
// $(function() {
//     $('.auto1').autocomplete({
//             source: function(req, res) {
//                 $.ajax({
//                   url: '/allpublications',
//                   dataType: 'json',
//                   cache: false,
//                   success: function(data) {
//                     console.log("SUCCESS!!!!!!!");
//                     console.log(data);
//                     var arr = $.grep(data, function(item){
//                       return item.title.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
//                     });
//                     res($.map(arr, function(item){
//                       return {
//                         label: item.title,
//                         value: item.title
//                       };
//                     }));
//                   },
//                   error: function(xhr) {
//                     console.log("ERROR WTF!!!");
//                     console.log(xhr.status);
//                   }
//                 });
//             },
//             messages: {
//               noResults: '',
//               results: function() {}
//             }
//     });
// });

// // Organizations - working
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