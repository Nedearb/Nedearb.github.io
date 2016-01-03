

function read(source, onload){
    var xhr=new XMLHttpRequest;
    xhr.open('GET', source);
    xhr.onload = onload;
    xhr.send();
}


function initImports(){
    var header = document.getElementById("");
    
    read("/header.html", function(){
        var div = document.getElementById("page_wrapper");
        div.innerHTML = this.response+div.innerHTML;
    });
    
    read("/footer.html", function(){
        var div = document.getElementById("page_wrapper");
        div.innerHTML = div.innerHTML+this.response;
    });
    
}

initImports();
