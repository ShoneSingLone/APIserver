// 获取图片信息
function getImageInfo(img) {
    return new Promise(resolve => {
        let Orientation = 1;
        // 图像压缩
        let {
            getData: GetData,
            getTag:GetTag
        } = window.EXIF;
        debugger;
        GetData(img, () => {
            Orientation = GetTag(img, "Orientation");
            resolve(Orientation);
        });
    });
}

// 旋转画布
function rotate(ctx, Orientation) {
    switch (Orientation) {
        case 3:
            //旋转180度
            ctx.rotate(Math.PI);
            break;
        case 6:
            //旋转90度
            ctx.rotate(Math.PI / 2);
            break;
        case 8:
            //旋转270度
            ctx.rotate(Math.PI * 1.5);
            break;
    }
}

// canvas 绘制图片
function drawImage(img, quality, Orientation) {
    return new Promise((resolve, reject) => {
        try {
            const {
                width,
                height
            } = img;
            //生成canvas
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");

            if (Orientation == 3 || Orientation == 6) {
                canvas.width = height;
                canvas.height = width;
            } else {
                canvas.width = width;
                canvas.height = height;
            }
            if (Orientation != 1) {
                ctx.translate(canvas.width / 2, canvas.width / 2);
                rotate(ctx, Orientation);
                ctx.translate(-canvas.width / 2, -canvas.width / 2);
            }


            ctx.drawImage(img, 0, 0);
            // 图像质量
            if (!(quality && quality <= 1 && quality > 0)) {
                quality = 0.7;
            }
            // quality值越小，所绘制出的图像越模糊
            canvas.toBlob(blob => resolve(blob), "image/jpeg", quality);
        } catch (error) {
            reject(error);
        }
    });
}

// 图片渲染
function canvasDataURL({
    file
}, quality = 0.7) {
    return new Promise(resolve => {
        let ready = new FileReader();
        /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
        ready.readAsDataURL(file);
        ready.onload = () => {
            let {
                result: path
            } = ready;
            let img = new Image();
            img.onload = () => {
                getImageInfo(img)
                    .then(Orientation => drawImage(img, quality, Orientation, blob => resolve(blob)));
            };
            img.src = path;
        };
    });
}


function compressionImg(fileObj) {
    return new Promise(resolve => {
        let newFile = null;
        canvasDataURL(fileObj, 0.7)
            .then(blob => {
                // 处理后的file
                newFile = new File([blob], fileObj.name, {
                    type: blob.type
                });
                if (!newFile || newFile.size > fileObj.size) {
                    newFile = fileObj;
                }
                resolve(newFile);
            });
    });

}

export default compressionImg;