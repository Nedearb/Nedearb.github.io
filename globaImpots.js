
function readHead(source, onreadystatechange){
  var xhr = new XMLHttpRequest;
  xhr.open('HEAD', source);
  xhr.onreadystatechange = onreadystatechange;
  xhr.send();
};

function read(source, onreadystatechange){
  var xhr = new XMLHttpRequest;
  xhr.open('GET', source);
  xhr.onreadystatechange = onreadystatechange;
  xhr.send();
};


function initImports(){
  
  read("/header.html", function(){
    if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
      var div = document.getElementById("page_wrapper");
      div.innerHTML = this.response+div.innerHTML;
    }
  });
  
};

initImports();
