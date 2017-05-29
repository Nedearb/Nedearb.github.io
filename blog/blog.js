
var lastPost = 0;

function numToThreeDigit(i){
  return (i<100?"0":"")+(i<10?"0":"")+i;
}


function countPosts(done){
  func = function(i){
    readHead("posts/post" + numToThreeDigit(i) + ".html", function(){
      if(this.readyState === XMLHttpRequest.DONE){
        if(this.status == 200){
          func(i+1);
        }else{
          done(i-1);
        }
      }
    });
  }
  func(1);
}


function initBlogImports(){

  var data = {};
  var raw = window.location.search.substring(1).split("&");
  for (var i = 0; i < raw.length; i++) {
    if(raw[i] === ""){
      continue;
    }
    var param = raw[i].split("=");
    data[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
  }

  var maxPostsOnPage = 10;

  var page;

  if(data.page){
    page = parseInt(data.page);
  }else{
    page = 0;
  }

  countPosts(function(count){
    console.log("Number of posts: " + count);

    var last = count;

    var firstPostOnPage = Math.min(last, last-(page*maxPostsOnPage));
    var lastPostOnPage = Math.max(1, firstPostOnPage-maxPostsOnPage+1);

    console.log("First: " + firstPostOnPage);
    console.log("Last: " + lastPostOnPage);

    readPosts = function(i){
      read("posts/post" + numToThreeDigit(i) + ".html", function(){
        var div = document.getElementById("page_body");
        if(this.readyState === XMLHttpRequest.DONE){
          if(this.status === 200){
            div.innerHTML = div.innerHTML+"<hr width=\"80%\" align=\"left\">"+this.response;
            if(i > lastPostOnPage){
              readPosts(i-1);
            }else{
              div.innerHTML = div.innerHTML+"<hr width=\"80%\" align=\"left\">";
            }
          }
        }
      });
    }
    readPosts(firstPostOnPage);

    var div = document.getElementById("page_wrapper");

    var currentURL = window.location.href.split("?")[0];

    var prevHref = currentURL+"?page="+(page-1);
    var nextHref = currentURL+"?page="+(page+1);

    var footer = "<center>&nbsp;";

    if(firstPostOnPage != last){
      footer = footer+"<a href = \"" + prevHref + "\">&lt;- Prev</a>";
    }

    if(lastPostOnPage == firstPostOnPage){
      footer = footer + "&nbsp;&nbsp; Post " + lastPostOnPage + "&nbsp;&nbsp;";
    }else{
      footer = footer + "&nbsp;&nbsp; Posts " + lastPostOnPage + " through " + firstPostOnPage + "&nbsp;&nbsp;";
    }

    if(lastPostOnPage != 1){
      footer = footer+"<a href = \"" + nextHref + "\">Next -&gt</a>";
    }
    
    footer = footer + "&nbsp;</center>";

    div.innerHTML = div.innerHTML+footer;

  });



  /*
  readPosts(page * postsOnPage, (page-1) * postsOnPage, function(){

    var div = document.getElementById("page_wrapper");

    var currentURL = window.location.search.split("?")[0];

    var prevHref = currentURL+"?page="+(page-1);
    var nextHref = currentURL+"?page="+(page+1);

    var footer = "";

    if(page > 0){
      footer = footer+"<a href = \"" + prevHref + "\">Prev</a>";
    }
    if(page * postsOnPage < lastPost){
      footer = footer+"<a href = \"" + nextHref + "\">Next</a>";
    }

    div.innerHTML = div.innerHTML+footer;

  });*/



};

initBlogImports();
