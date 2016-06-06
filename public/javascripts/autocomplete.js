// For transforming publication type category
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// ALL
$(function() {
  if ($('.auto').length != 0) {
    $('.auto').catcomplete({
            source: function(req, res) {
              var str = req.term;
              var r = []; 
              $.when(
                $.ajax({
                  url: '/allusers',
                  dataType: 'json',
                  type: 'POST',
                  data: {substr: str},
                  cache: false,
                  success: function(data) {
                    console.log("USER SUCCESS DATA: ", data);
                    // var arr = $.grep(data, function(item){
                    //   return item.fullname.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                    // });
                    $.map(data, function(item){
                      var dlink = "/profile/" + item.username;
                      r.push({label: item.fullname, value: item.fullname, category: "Users", imgsrc: item.picture, link: dlink});
                    });
                  },
                  error: function(xhr) {
                    console.log(xhr.status);
                  }
                }),
                $.ajax({
                  url: '/allpublications',
                  dataType: 'json',
                  type: 'POST',
                  data: {substr: str},
                  cache: false,
                  success: function(data) {
                    console.log("DATA RECEIVED FOR PUBS: ")
                    console.log(data);
                    // var arr = $.grep(data, function(item){
                    //   console.log(item.title);
                    //   return item.title.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                    // });
                    $.map(data, function(item){
                      //console.log("PUB ITEM: ");
                      //console.log(item);
                      var type = item.type;
                      var dlink = "/publication/" + type + "/" + item.objectId;
                      r.push({label: item.title, value: item.title, category: toTitleCase(item.type), imgsrc: "/images/paper.png", link: dlink});
                    });
                  },
                  error: function(xhr) {
                    console.log(xhr.status);
                  }
                }),
                $.ajax({
                  url: '/allorganizations',
                  dataType: 'json',
                  type: 'POST',
                  data: {substr: str},
                  cache: false,
                  success: function(data) {
                    console.log("DATA RECEIVED FOR ORGS: ")
                    console.log(data);
                    // var arr = $.grep(data, function(item){
                    //   return item.name.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                    // });
                    $.map(data, function(item){
                      var dlink = "/organization/" + item.name;
                      r.push({label: item.displayName, value: item.displayName, category: "Organizations", imgsrc: item.picture.url, link: dlink});
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
             return $("<div></div>").data("ui-autocomplete-item", item)
                     .append("<div class='item-box'>"+"<div class='item-box-left'>"+"<div class='item-box-image-outside'>"+"<a style='cursor: pointer'>"+ "<img class='search-img' src='" + item.imgsrc + "' />" +"</a>"+"</div></div>"+
                 "<div class='item-box-right'>"+"<a style='cursor: pointer'>" + item.label + "</a>"+"</div></div>")
                     .appendTo(ul);
     };
    }   
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
// $(function() {
//      $('.auto2').autocomplete({
//              source: function(req, res) {
//                  $.ajax({
//                    url: '/allorganizations',
//                    dataType: 'json',
//                    cache: false,
//                    success: function(data) {
//                      console.log("SUCCESS!!!!!!!");
//                      console.log(data);
//                      var arr = $.grep(data, function(item){
//                        return item.name.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
//                      });
//                      res($.map(arr, function(item){
//                        return {
//                          label: item.name,
//                          value: item.name
//                        };
//                      }));
//                    },
//                    error: function(xhr) {
//                      console.log("ERROR WTF!!!");
//                      console.log(xhr.status);
//                    }
//                  });
//              },
//              messages: {
//                noResults: '',
//                results: function() {}
//              }
//     });
// });