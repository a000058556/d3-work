function asyncProcess(imgID,URL){
    // (1等待)單張圖片載入
    return new Promise((resolve, reject)=>{
        // resolve (asyncProcess)回傳的方法，若正常就取得asyncProcess內的結果
        // reject 若失敗就例外處理
        $(imgID).attr("src",URL);

        // 圖片載完後才執行此函數
        $(imgID).on("load",function(){ 
            // 取得圖片寬度(.naturalWidth)，回傳數字
            // debugger;
            resolve(this.naturalWidth);
            // resolve($(this)[0].naturalWidth); 若上面this讀不到圖片可用這個試試
        });
        // 當圖片有錯誤時，會跳至這裡執行，並reject錯誤訊息
        $(imgID).on('error',function(){
            reject("Image Source error!");
        });
    });
}


$(function(){
    $("#go-add-up").on("click",go);
});


function go(){
    // 按下後計算三張圖片寬度
    // (2等待)要等三張圖片都載入完成才計算。
    // Promise.all(要先執行完的事) 做完後才做.then
    Promise.all([
        asyncProcess("#image1","https://punchline.asia/wp-content/uploads/2017/09/it-movie-poster-1.jpg"),
        asyncProcess("#image2","https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/c618cd88432989.5dd5e72e505d1.jpg"),
        asyncProcess("#image3","https://www.u-buy.com.tw/productimg/?image=aHR0cHM6Ly9tLm1lZGlhLWFtYXpvbi5jb20vaW1hZ2VzL0kvNzFIQk9PN3RZNUwuX0FDX1NMMTUwMF8uanBn.jpg")
    ]).then(
        // 若asyncProcess成功完成resolve會把結果(圖片s的寬度)帶到.then中的response
        // 若asyncProcess成功失敗reject會帶錯誤訊息到帶到.then中的error
        // 會等待.all所有程序都完成才執行。
        // response會拿到第一個回傳(陣列)，蒐集了所有上面(Promise.all)的執行結果
        response => {
            // debugger;
            var totalWidth = 0;

            // 用迴圈把寬度與加總列出來
            for(var x=0; x < response.length; x++){
                $("#add-up").append(response[x]);
                totalWidth += response[x];  
                if(x < response.length-1){
                    $("#add-up").append(" + ");
                }else{
                    $("#add-up").append(" = " + totalWidth);
                }
            }
        },
        error => {
            // 當圖片出錯時，會接收reject(16行)的回傳，將錯誤訊息傳至console.log
            window.alert(`Error:${error}`);
            // console.log(`Error:${error}`);
        }
    );
}