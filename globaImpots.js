

function read(source, onload){
  var xhr=new XMLHttpRequest;
  xhr.open('GET', source);
  xhr.onload = onload;
  xhr.send();
};


function initImports(){
  
  read("/header.html", function(){
      var div = document.getElementById("page_wrapper");
      div.innerHTML = this.response+div.innerHTML;
  });
  
};

initImports();
